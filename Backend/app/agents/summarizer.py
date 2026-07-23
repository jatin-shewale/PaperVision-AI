"""Summary Agent: produces the executive summary, research problem statement,
methodology description, key findings, and limitations using local Ollama/Qwen."""

import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_summary_fallback

logger = logging.getLogger("papervision.agents.summarizer")


class SummaryAgent(BaseAgent):
    name = "summary_agent"

    async def run(self, state: AgentState) -> AgentState:
        parsed_paper = state["parsed_paper"]
        return {"summary": extract_summary_fallback(parsed_paper)}
