"""Upload, analyze, and retrieve research papers."""
import asyncio
import json
import logging
import os
import uuid
from pathlib import Path

import aiofiles
from fastapi.responses import FileResponse
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from app.embeddings.embedding import embed_texts
from app.graph.workflow import pipeline
from app.parser.pdf_parser import chunk_text, parse_pdf
from app.vectorstore.faiss_store import FaissStore

logger = logging.getLogger("papervision.api.papers")
router = APIRouter(prefix="/api/papers", tags=["papers"])

DATA_DIR = Path("./data")
UPLOAD_DIR = DATA_DIR / "uploads"
STATUS_DIR = DATA_DIR / "job_status"
RESULT_DIR = DATA_DIR / "analysis_results"

for directory in (UPLOAD_DIR, STATUS_DIR, RESULT_DIR):
    directory.mkdir(parents=True, exist_ok=True)

# In-memory job/result store for this scaffold.
RESULTS: dict[str, dict] = {}
JOB_STATUS: dict[str, dict] = {}


def _status_path(paper_id: str) -> Path:
    return STATUS_DIR / f"{paper_id}.json"


def _result_path(paper_id: str) -> Path:
    return RESULT_DIR / f"{paper_id}.json"


def _load_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        logger.exception("Failed to load cached analysis file: %s", path)
        return None


def _save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _persist_status(paper_id: str, payload: dict) -> None:
    JOB_STATUS[paper_id] = payload
    _save_json(_status_path(paper_id), payload)


def _persist_result(paper_id: str, payload: dict) -> None:
    RESULTS[paper_id] = payload
    _save_json(_result_path(paper_id), payload)


def _restore_cached_result(paper_id: str) -> dict | None:
    if paper_id in RESULTS:
        return RESULTS[paper_id]
    cached = _load_json(_result_path(paper_id))
    if cached:
        RESULTS[paper_id] = cached
    return cached


def _restore_cached_status(paper_id: str) -> dict | None:
    if paper_id in JOB_STATUS:
        return JOB_STATUS[paper_id]
    cached = _load_json(_status_path(paper_id))
    if cached:
        JOB_STATUS[paper_id] = cached
    return cached


def _backfill_citation_pages(paper_id: str, result: dict) -> dict:
    citations = result.get("citations")
    if not isinstance(citations, list) or not citations:
        return result

    path = UPLOAD_DIR / f"{paper_id}.pdf"
    if not path.exists():
        return result

    try:
        parsed = parse_pdf(str(path))
    except Exception:  # noqa: BLE001
        logger.exception("Could not re-parse PDF for citation page backfill: %s", paper_id)
        return result

    changed = False
    for citation in citations:
        if not isinstance(citation, dict):
            continue
        if citation.get("page") is not None:
            continue
        needle = str(citation.get("text") or "").strip()
        if not needle:
            continue
        for page in parsed.pages:
            page_text = page.text
            if needle in page_text or needle.replace("(", "").replace(")", "") in page_text:
                citation["page"] = page.page_number
                changed = True
                break

    if changed:
        result["citations"] = citations
        _persist_result(paper_id, result)
    return result


@router.post("/upload")
async def upload_paper(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    paper_id = str(uuid.uuid4())
    dest = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
    async with aiofiles.open(dest, "wb") as f:
        await f.write(await file.read())

    return {"paper_id": paper_id, "filename": file.filename, "status": "uploaded"}


async def _run_analysis(paper_id: str, path: str) -> None:
    _persist_status(paper_id, {
        "paper_id": paper_id,
        "status": "processing",
        "stage": "extract",
        "message": "Extracting text from the PDF",
    })

    def report_progress(stage: str, message: str) -> None:
        _persist_status(paper_id, {
            "paper_id": paper_id,
            "status": "processing",
            "stage": stage,
            "message": message,
        })

    try:
        parsed = parse_pdf(path)
        report_progress("chunk", "Preparing searchable paper sections")
        chunks = chunk_text(parsed.full_text)
        if chunks:
            report_progress("embedding", "Creating local semantic embeddings")
            embeddings = embed_texts(chunks)
            store = FaissStore(paper_id, dim=embeddings.shape[1])
            store.add(embeddings, chunks)
            store.save()

        final_state = await pipeline.ainvoke({
            "paper_id": paper_id,
            "parsed_paper": parsed,
            "progress_callback": report_progress,
        })
        _persist_result(paper_id, final_state["result"])
        _persist_status(paper_id, {"paper_id": paper_id, "status": "completed"})
    except Exception as exc:  # noqa: BLE001
        logger.exception("Analysis failed for paper_id=%s", paper_id)
        _persist_status(paper_id, {
            "paper_id": paper_id,
            "status": "failed",
            "error": str(exc),
        })


@router.on_event("startup")
async def resume_pending_analyses():
    """Resume any analyses that were mid-flight before a reload."""
    for status_file in STATUS_DIR.glob("*.json"):
        cached = _load_json(status_file)
        if not cached or cached.get("status") != "processing":
            continue
        paper_id = cached.get("paper_id")
        if not paper_id:
            continue
        path = UPLOAD_DIR / f"{paper_id}.pdf"
        if path.exists():
            JOB_STATUS[paper_id] = cached
            asyncio.create_task(_run_analysis(paper_id, str(path)))


@router.post("/{paper_id}/analyze")
async def analyze_paper(paper_id: str, background_tasks: BackgroundTasks):
    path = UPLOAD_DIR / f"{paper_id}.pdf"
    if not path.exists():
        raise HTTPException(404, "Paper not found. Upload it first.")

    cached_result = _restore_cached_result(paper_id)
    if cached_result:
        _persist_status(paper_id, {"paper_id": paper_id, "status": "completed"})
        return JOB_STATUS[paper_id]

    if JOB_STATUS.get(paper_id, {}).get("status") == "processing":
        return JOB_STATUS[paper_id]

    cached_status = _restore_cached_status(paper_id)
    if cached_status and cached_status.get("status") == "processing":
        return cached_status

    _persist_status(paper_id, {"paper_id": paper_id, "status": "queued"})
    background_tasks.add_task(_run_analysis, paper_id, str(path))
    return JOB_STATUS[paper_id]


@router.get("/{paper_id}")
async def get_paper_result(paper_id: str):
    cached_result = _restore_cached_result(paper_id)
    if cached_result:
        return _backfill_citation_pages(paper_id, cached_result)

    cached_status = _restore_cached_status(paper_id)
    if cached_status:
        return cached_status

    raise HTTPException(404, "No analysis found for this paper_id yet.")


@router.get("/{paper_id}/file")
async def get_paper_file(paper_id: str):
    path = UPLOAD_DIR / f"{paper_id}.pdf"
    if not path.exists():
        raise HTTPException(404, "Uploaded PDF not found.")
    return FileResponse(path, media_type="application/pdf", filename=f"{paper_id}.pdf")


@router.get("")
async def list_papers():
    return {"papers": list(RESULTS.keys())}
