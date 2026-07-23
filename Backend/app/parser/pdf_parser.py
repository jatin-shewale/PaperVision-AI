"""Extracts structured text, layout, and metadata from research paper PDFs
using PyMuPDF (fast structure/layout) and pdfplumber (tables/precise text)."""

from dataclasses import dataclass, field

import fitz  # PyMuPDF
import pdfplumber


@dataclass
class PageContent:
    page_number: int
    text: str
    bbox_blocks: list[dict] = field(default_factory=list)


@dataclass
class ParsedPaper:
    title: str
    num_pages: int
    pages: list[PageContent]
    full_text: str
    tables: list[dict] = field(default_factory=list)


def parse_pdf(file_path: str) -> ParsedPaper:
    doc = fitz.open(file_path)
    pages: list[PageContent] = []
    full_text_parts: list[str] = []

    for i, page in enumerate(doc):
        text = page.get_text("text")
        blocks = [
            {"bbox": b[:4], "text": b[4]}
            for b in page.get_text("blocks")
            if b[4].strip()
        ]
        pages.append(PageContent(page_number=i + 1, text=text, bbox_blocks=blocks))
        full_text_parts.append(text)

    title = (doc.metadata.get("title") or "").strip() or _guess_title(pages)

    tables: list[dict] = []
    with pdfplumber.open(file_path) as pl:
        for i, page in enumerate(pl.pages):
            for t in page.extract_tables():
                tables.append({"page": i + 1, "rows": t})

    return ParsedPaper(
        title=title,
        num_pages=len(pages),
        pages=pages,
        full_text="\n".join(full_text_parts),
        tables=tables,
    )


def _guess_title(pages: list[PageContent]) -> str:
    if not pages:
        return "Untitled Paper"
    first_lines = [l.strip() for l in pages[0].text.splitlines() if l.strip()]
    return first_lines[0] if first_lines else "Untitled Paper"


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list[str]:
    """Simple sliding-window chunker over whitespace-normalized text."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start = end - overlap
        if start < 0:
            break
    return [c for c in chunks if c.strip()]
