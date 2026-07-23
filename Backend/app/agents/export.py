"""Export Agent: renders the composed analysis result to PDF / Markdown / JSON."""
import json
import logging
import os

logger = logging.getLogger("papervision.agents.export")


class ExportAgent:
    name = "export_agent"

    def to_json(self, result: dict) -> str:
        return json.dumps(result, indent=2)

    def to_markdown(self, result: dict) -> str:
        meta = result.get("metadata", {})
        summary = result.get("summary", {})
        insights = result.get("insights", {})
        lines = [
            f"# {meta.get('title', 'Untitled Paper')}",
            "",
            f"**Authors:** {', '.join(meta.get('authors', []) or [])}",
            f"**Year:** {meta.get('year', 'N/A')}",
            "",
            "## Executive Summary",
            summary.get("executive_summary", ""),
            "",
            "## Research Problem",
            summary.get("methodology", ""),
            "",
            "## Key Findings",
            *[f"- {f}" for f in summary.get("key_findings", [])],
            "",
            "## Limitations",
            *[f"- {l}" for l in summary.get("limitations", [])],
            "",
            "## Novelty & Complexity",
            f"Novelty: {insights.get('novelty_score', 'N/A')} | "
            f"Complexity: {insights.get('complexity_score', 'N/A')}",
            "",
            "## Keywords",
            ", ".join(result.get("keywords", [])),
        ]
        return "\n".join(lines)

    def to_pdf(self, result: dict, output_path: str) -> str:
        # Lightweight PDF export using fpdf-like fallback via PyMuPDF text insertion.
        import fitz

        md = self.to_markdown(result)
        doc = fitz.open()
        page = doc.new_page()
        rect = fitz.Rect(50, 50, page.rect.width - 50, page.rect.height - 50)
        page.insert_textbox(rect, md, fontsize=10)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        return output_path
