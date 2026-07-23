"""Citation Agent: extracts in-text citations and reference list entries,
and (best-effort) verifies that cited works appear in the reference list."""
import logging
import re

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_citations_fallback

logger = logging.getLogger("papervision.agents.citation")

INLINE_CITATION_RE = re.compile(r"\(([A-Z][a-zA-Z]+(?:\s+et al\.)?,?\s*\d{4}[a-z]?)\)")


class CitationAgent(BaseAgent):
    name = "citation_agent"

    async def run(self, state: AgentState) -> AgentState:
        parsed_paper = state["parsed_paper"]
        text = parsed_paper.full_text
        inline_matches = {m.group(1).strip() for m in INLINE_CITATION_RE.finditer(text)}

        extracted = extract_citations_fallback(parsed_paper)
        if not extracted["citations"] and inline_matches:
            extracted["citations"] = [
                {"text": c, "page": None, "verified": False}
                for c in sorted(inline_matches)
            ]
        return extracted
