"""Export analysis results as PDF / Markdown / JSON."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse

from app.agents.export import ExportAgent
from app.api.routes_papers import RESULTS

router = APIRouter(prefix="/api/export", tags=["export"])
exporter = ExportAgent()


@router.get("/{paper_id}/json")
async def export_json(paper_id: str):
    result = RESULTS.get(paper_id)
    if not result:
        raise HTTPException(404, "No analysis found")
    return result


@router.get("/{paper_id}/markdown")
async def export_markdown(paper_id: str):
    result = RESULTS.get(paper_id)
    if not result:
        raise HTTPException(404, "No analysis found")
    return PlainTextResponse(exporter.to_markdown(result), media_type="text/markdown")


@router.get("/{paper_id}/pdf")
async def export_pdf(paper_id: str):
    result = RESULTS.get(paper_id)
    if not result:
        raise HTTPException(404, "No analysis found")
    output_path = f"./data/exports/{paper_id}.pdf"
    exporter.to_pdf(result, output_path)
    return FileResponse(output_path, media_type="application/pdf", filename=f"{paper_id}_brief.pdf")
