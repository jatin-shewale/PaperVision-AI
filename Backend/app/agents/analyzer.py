"""Paper Analyzer Agent: does the first structural pass over the document."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_sections_fallback

logger = logging.getLogger("papervision.agents.analyzer")


class PaperAnalyzerAgent(BaseAgent):
    name = "paper_analyzer_agent"

    async def run(self, state: AgentState) -> AgentState:
        return {"sections": extract_sections_fallback(state["parsed_paper"])}
