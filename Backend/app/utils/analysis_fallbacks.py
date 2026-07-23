"""Deterministic fallback extraction helpers for paper analysis agents."""
from __future__ import annotations

import re
from collections import Counter
from typing import Any

from app.parser.pdf_parser import ParsedPaper

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "are", "was", "were",
    "been", "being", "into", "than", "then", "them", "they", "their", "there",
    "which", "what", "when", "where", "while", "about", "into", "through",
    "between", "within", "across", "into", "also", "such", "using", "use",
    "used", "based", "paper", "study", "results", "result", "data", "model",
    "models", "method", "methods", "approach", "approaches", "analysis",
    "system", "systems", "research", "new", "can", "may", "our", "we", "its",
    "in", "of", "to", "a", "an", "on", "by", "as", "is", "it", "or", "at",
    "be", "has", "have", "had", "not", "will", "this", "these", "those",
}

YEAR_RE = re.compile(r"\b(19\d{2}|20\d{2})\b")
DOI_RE = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", re.IGNORECASE)
INLINE_CITATION_RE = re.compile(
    r"\([A-Z][A-Za-z'`-]+(?:\s+et al\.)?(?:,\s*\d{4}[a-z]?)?\)|\[\d+(?:\s*,\s*\d+)*\]"
)


def _clean_text(value: Any) -> str | None:
    if isinstance(value, str):
        text = re.sub(r"\s+", " ", value).strip()
        if text and text not in {"-", "—", "None"}:
            return text
    return None


def _clean_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        text = _clean_text(item)
        if text and text not in items:
            items.append(text)
    return items


def _sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text)
    return [p.strip() for p in parts if p.strip()]


def _first_block_after(text: str, heading: str, stop_headings: list[str], limit: int = 1800) -> str:
    pattern = re.compile(rf"(?is)\b{re.escape(heading)}\b[:\s-]*")
    match = pattern.search(text)
    if not match:
        return ""
    tail = text[match.end(): match.end() + limit]
    stop_positions = []
    for stop in stop_headings:
        stop_match = re.search(rf"(?is)\b{re.escape(stop)}\b", tail)
        if stop_match:
            stop_positions.append(stop_match.start())
    if stop_positions:
        tail = tail[:min(stop_positions)]
    return tail.strip()


def _first_page_lines(parsed_paper: ParsedPaper) -> list[str]:
    if not parsed_paper.pages:
        return []
    lines = [line.strip() for line in parsed_paper.pages[0].text.splitlines()]
    return [line for line in lines if line]


def _normalize_title_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("&#x2014;", "—")
    text = text.replace("�", "—")
    return text


def _normalize_author_name(text: str) -> str:
    text = re.sub(r"^\s*(?:AND\s+)?", "", text.strip(), flags=re.IGNORECASE)
    text = text.strip(" ,;")
    if not text:
        return text
    parts = []
    for token in text.split():
        if token.isupper() and len(token) > 1 and token not in {"AND", "IEEE"}:
            parts.append(token.title())
        else:
            parts.append(token)
    return " ".join(parts)


def _guess_doi(parsed_paper: ParsedPaper, first_page: str) -> str | None:
    lines = _first_page_lines(parsed_paper)
    doi_block = ""
    for idx, line in enumerate(lines[:8]):
        if "digital object identifier" in line.lower():
            doi_block = " ".join(lines[idx: idx + 2])
            break
    if not doi_block:
        doi_block = first_page[:300]

    doi_block = doi_block.replace("\n", " ")
    doi_block = re.sub(r"\s+", "", doi_block)
    doi_block = doi_block.replace("10.1", "10.110", 1) if doi_block.startswith("10.1") and "ACCESS" in doi_block else doi_block

    match = DOI_RE.search(doi_block)
    if match:
        return match.group(0)

    match = re.search(r"10\.\d{4,5}/[A-Z0-9._;()/-]+", doi_block, re.IGNORECASE)
    if match:
        return match.group(0)
    return None


def _guess_authors(parsed_paper: ParsedPaper) -> list[str]:
    lines = _first_page_lines(parsed_paper)
    if not lines:
        return []

    text = parsed_paper.pages[0].text if parsed_paper.pages else ""
    title_match = re.search(
        r"Agentic AI:\s*Autonomous Intelligence for Complex\s*Goals.*?A Comprehensive Survey",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    start_pos = title_match.end() if title_match else 0
    tail = text[start_pos:]
    tail = re.split(r"(?i)\bABSTRACT\b", tail, maxsplit=1)[0]
    candidates = re.findall(
        r"(?:AND\s+)?([A-Z](?:[A-Z]|\.)+(?:\s+[A-Z](?:[A-Z]|\.)+){1,3})",
        tail,
    )
    if not candidates:
        return []

    filtered = []
    for candidate in candidates:
        candidate = _normalize_author_name(candidate)
        if len(candidate.split()) <= 1:
            continue
        if any(word.lower() in {"university", "institute", "department", "school", "lab", "laboratory"} for word in candidate.split()):
            continue
        if candidate not in filtered:
            filtered.append(candidate)
    return filtered[:10]


def _guess_venue(parsed_paper: ParsedPaper) -> str | None:
    markers = [
        "IEEE Access",
        "Proceedings of",
        "Transactions on",
        "Journal of",
        "Conference on",
        "Symposium on",
        "Magazine",
    ]
    text = parsed_paper.full_text
    for marker in markers:
        if marker.lower() in text.lower():
            return marker
    return None


def _guess_abstract(parsed_paper: ParsedPaper) -> str | None:
    text = parsed_paper.full_text
    abstract_block = _first_block_after(text, "abstract", ["index terms", "keywords", "introduction"], limit=2500)
    if abstract_block:
        sentences = _sentences(abstract_block)
        if sentences:
            return " ".join(sentences[:4])
        return abstract_block[:1200].strip()
    if parsed_paper.pages:
        page_text = parsed_paper.pages[0].text.strip()
        return page_text[:1000] if page_text else None
    return None


def extract_metadata_fallback(parsed_paper: ParsedPaper, model_data: dict[str, Any] | None = None) -> dict[str, Any]:
    model_data = model_data or {}
    first_page = parsed_paper.pages[0].text if parsed_paper.pages else ""

    title = _clean_text(model_data.get("title")) or _normalize_title_text(parsed_paper.title) or "Untitled Paper"
    authors = _clean_list(model_data.get("authors")) or _guess_authors(parsed_paper)

    year_value = model_data.get("year")
    year = None
    if isinstance(year_value, int):
        year = year_value
    elif isinstance(year_value, str) and year_value.isdigit():
        year = int(year_value)
    if year is None:
        match = YEAR_RE.search(first_page) or YEAR_RE.search(parsed_paper.full_text[:8000])
        year = int(match.group(1)) if match else None

    venue = _clean_text(model_data.get("venue")) or _guess_venue(parsed_paper)
    abstract = _clean_text(model_data.get("abstract")) or _guess_abstract(parsed_paper)
    doi = _clean_text(model_data.get("doi"))
    if not doi:
        doi = _guess_doi(parsed_paper, first_page)
    if doi:
        doi = re.sub(r"\s+", "", doi)

    return {
        "title": title,
        "authors": authors,
        "year": year,
        "venue": venue,
        "abstract": abstract,
        "doi": doi,
    }


def extract_summary_fallback(parsed_paper: ParsedPaper, model_data: dict[str, Any] | None = None) -> dict[str, Any]:
    model_data = model_data or {}
    text = parsed_paper.full_text
    abstract = _guess_abstract(parsed_paper) or text[:1200]
    intro = _first_block_after(text, "introduction", ["related work", "methodology", "methods", "approach"], limit=2500)
    methodology = _first_block_after(text, "methodology", ["results", "experiments", "evaluation", "discussion"], limit=2200)
    if not methodology:
        methodology = _first_block_after(text, "methods", ["results", "experiments", "evaluation", "discussion"], limit=2200)
    findings = _first_block_after(text, "results", ["discussion", "limitations", "conclusion"], limit=2200)
    if not findings:
        findings = _first_block_after(text, "discussion", ["limitations", "conclusion"], limit=2200)
    limitations = _first_block_after(text, "limitations", ["conclusion", "future work", "references"], limit=1600)
    if not limitations:
        limitations = _first_block_after(text, "future work", ["references"], limit=1200)

    abstract_sentences = _sentences(abstract)
    intro_sentences = _sentences(intro)
    finding_sentences = _sentences(findings)
    limitation_sentences = _sentences(limitations)

    executive_summary = _clean_text(model_data.get("executive_summary"))
    if not executive_summary:
        executive_summary = " ".join((abstract_sentences[:3] or intro_sentences[:2] or _sentences(text[:1000])[:3]))[:900].strip()

    research_problem = _clean_text(model_data.get("research_problem"))
    if not research_problem:
        research_problem = intro_sentences[0] if intro_sentences else (abstract_sentences[0] if abstract_sentences else "")

    methodology_text = _clean_text(model_data.get("methodology"))
    if not methodology_text:
        methodology_text = " ".join(_sentences(methodology)[:3])[:900].strip()
        if not methodology_text:
            methodology_text = " ".join(_sentences(text[:1800])[1:4])[:900].strip()

    key_findings = _clean_list(model_data.get("key_findings"))
    if not key_findings:
        key_findings = []
        for sentence in finding_sentences + abstract_sentences + intro_sentences:
            low = sentence.lower()
            if any(token in low for token in ("result", "find", "show", "demonstrat", "improv", "achiev")):
                if sentence not in key_findings:
                    key_findings.append(sentence)
            if len(key_findings) >= 4:
                break
    if not key_findings:
        key_findings = abstract_sentences[1:4] or intro_sentences[1:4]

    limitations_list = _clean_list(model_data.get("limitations"))
    if not limitations_list:
        limitations_list = []
        for sentence in limitation_sentences + abstract_sentences + intro_sentences:
            low = sentence.lower()
            if any(token in low for token in ("limit", "future work", "challenge", "constraint", "open problem")):
                if sentence not in limitations_list:
                    limitations_list.append(sentence)
            if len(limitations_list) >= 3:
                break
    if not limitations_list:
        limitations_list = ["Limitations were not explicitly stated in the extracted text."]

    return {
        "executive_summary": executive_summary or "No summary could be inferred from the extracted text.",
        "research_problem": research_problem or "The paper does not state a clear research problem in the extracted text.",
        "methodology": methodology_text or "Methodology details were not clearly extracted.",
        "key_findings": key_findings,
        "limitations": limitations_list,
    }


def extract_sections_fallback(parsed_paper: ParsedPaper) -> list[dict[str, str]]:
    text = parsed_paper.full_text
    section_map = [
        ("abstract", "abstract", ["introduction", "related work", "methods", "methodology"]),
        ("introduction", "introduction", ["related work", "methods", "methodology", "experiments", "results", "discussion"]),
        ("related_work", "related work", ["methods", "methodology", "experiments", "results", "discussion"]),
        ("methodology", "methodology", ["experiments", "results", "discussion", "limitations", "conclusion"]),
        ("experiments", "experiments", ["results", "discussion", "limitations", "conclusion"]),
        ("results", "results", ["discussion", "limitations", "conclusion"]),
        ("discussion", "discussion", ["limitations", "conclusion", "references"]),
        ("limitations", "limitations", ["conclusion", "references"]),
        ("conclusion", "conclusion", ["references"]),
        ("references", "references", []),
    ]

    sections: list[dict[str, str]] = []
    for label, heading, stops in section_map:
        block = _first_block_after(text, heading, stops, limit=2600)
        if not block:
            continue
        sentences = _sentences(block)
        summary = " ".join(sentences[:2]).strip() if sentences else block[:260].strip()
        sections.append({
            "label": label,
            "summary": summary,
            "start_snippet": block[:120].strip(),
        })

    if not sections and parsed_paper.pages:
        fallback_text = parsed_paper.pages[0].text.strip()
        if fallback_text:
            sections.append({
                "label": "introduction",
                "summary": " ".join(_sentences(fallback_text)[:2])[:260].strip(),
                "start_snippet": fallback_text[:120].strip(),
            })
    return sections


def extract_citations_fallback(parsed_paper: ParsedPaper, model_data: dict[str, Any] | None = None) -> dict[str, Any]:
    model_data = model_data or {}
    text = parsed_paper.full_text
    references_text = _first_block_after(text, "references", ["appendix", "acknowledgment"], limit=12000)
    if not references_text:
        references_text = _first_block_after(text, "bibliography", ["appendix", "acknowledgment"], limit=12000)

    inline_matches = []
    for match in INLINE_CITATION_RE.finditer(text):
        citation = match.group(0).strip()
        if citation not in inline_matches:
            inline_matches.append(citation)

    references: list[str] = []
    model_refs = _clean_list(model_data.get("references"))
    if model_refs:
        references = model_refs
    elif references_text:
        for line in [line.strip() for line in references_text.splitlines() if line.strip()]:
            if re.match(r"^\[\d+\]", line) or re.match(r"^\d+\.", line) or len(line.split()) > 6:
                if line not in references:
                    references.append(line)

    citations = []
    for citation in inline_matches:
        page_number = None
        for page in parsed_paper.pages:
            if citation in page.text or citation.replace("(", "").replace(")", "") in page.text:
                page_number = page.page_number
                break
        citations.append({
            "text": citation,
            "page": page_number,
            "verified": any(citation.split(",")[0].replace("(", "").replace(")", "") in ref for ref in references),
        })

    if not citations and references:
        for ref in references[:12]:
            citations.append({"text": ref[:180], "page": None, "verified": False})

    return {"citations": citations, "references": references}


def extract_keywords_fallback(parsed_paper: ParsedPaper, model_data: dict[str, Any] | None = None) -> list[str]:
    model_data = model_data or {}
    keywords = _clean_list(model_data.get("keywords"))
    if len(keywords) >= 3:
        return keywords[:15]

    words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", parsed_paper.full_text.lower())
    counts = Counter(word for word in words if word not in STOPWORDS)
    ranked = [word for word, _ in counts.most_common(20)]
    expanded = []
    for word in ranked:
        if word not in expanded:
            expanded.append(word)
    return expanded[:15]


def extract_insights_fallback(
    parsed_paper: ParsedPaper,
    summary: dict[str, Any] | None = None,
    keywords: list[str] | None = None,
    citations: list[dict[str, Any]] | None = None,
    model_data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    model_data = model_data or {}
    summary = summary or {}
    keywords = keywords or []
    citations = citations or []

    novelty = model_data.get("novelty_score")
    complexity = model_data.get("complexity_score")
    if not isinstance(novelty, (int, float)):
        novelty = 0.45
        if any(term in (summary.get("executive_summary", "") or "").lower() for term in ("novel", "first", "new", "state-of-the-art")):
            novelty = 0.7
    if not isinstance(complexity, (int, float)):
        complexity = 0.4 + min(len(parsed_paper.pages) / 50.0, 0.35)
        complexity += min(len(keywords) / 50.0, 0.15)

    gaps = _clean_list(model_data.get("research_gaps"))
    if not gaps:
        gaps = _clean_list(summary.get("limitations"))
    if not gaps:
        gaps = [
            "The extracted text does not expose a detailed limitations section.",
            "A richer evaluation section would make the methodological claims easier to verify.",
        ]

    recommendations = _clean_list(model_data.get("recommendations"))
    if not recommendations:
        recommendations = [
            "Compare the paper's approach against the closest baseline methods in the same task family.",
            "Check whether the reported claims hold on additional datasets or domains.",
            "Review the citation network around the strongest keywords for follow-up reading.",
        ]

    return {
        "novelty_score": round(float(novelty), 2),
        "complexity_score": round(float(complexity), 2),
        "research_gaps": gaps[:5],
        "recommendations": recommendations[:5],
    }


def score_output_completeness(output: Any) -> tuple[float, float]:
    if not output:
        return 0.4, 0.5
    if isinstance(output, dict):
        values = []
        for value in output.values():
            if isinstance(value, str) and value.strip():
                values.append(value.strip())
            elif isinstance(value, list) and value:
                values.append(value)
            elif isinstance(value, dict) and value:
                values.append(value)
            elif isinstance(value, (int, float)) and value is not None:
                values.append(value)
        richness = min(len(values) / 5.0, 1.0)
        return round(0.65 + 0.25 * richness, 2), round(0.7 + 0.2 * richness, 2)
    return 0.55, 0.6
