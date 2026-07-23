"""Visualization Agent: maps analysis outputs (methodology, experiments,
findings, citations, keywords, references) back to page-level snippets so
the frontend PDF viewer can highlight and synchronize with the analysis."""
import logging

from app.agents.base import AgentState, BaseAgent

logger = logging.getLogger("papervision.agents.visualization")

LABEL_KEYWORDS = {
    "methodology": ["method", "approach", "we propose", "architecture"],
    "experiments": ["experiment", "evaluation", "setup", "benchmark"],
    "findings": ["result", "we find", "we show", "achieve"],
    "citation": ["et al.", "(20"],
    "reference": ["references", "bibliography"],
}


class VisualizationAgent(BaseAgent):
    name = "visualization_agent"

    async def run(self, state: AgentState) -> AgentState:
        highlights = []
        keywords = state.get("keywords", [])
        for page in state["parsed_paper"].pages:
            lower = page.text.lower()
            for label, cues in LABEL_KEYWORDS.items():
                for cue in cues:
                    idx = lower.find(cue)
                    if idx != -1:
                        snippet = page.text[max(0, idx - 40): idx + 80].strip()
                        highlights.append({
                            "page": page.page_number,
                            "label": label,
                            "text_snippet": snippet,
                            "bbox": None,
                        })
                        break
            for kw in keywords:
                idx = lower.find(kw.lower())
                if idx != -1:
                    highlights.append({
                        "page": page.page_number,
                        "label": "keyword",
                        "text_snippet": kw,
                        "bbox": None,
                    })
        return {"highlights": highlights}
