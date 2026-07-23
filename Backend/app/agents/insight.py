"""Key Insights Agent: computes novelty score, complexity score, research
gaps, and recommendations using local Ollama/Qwen reasoning."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_insights_fallback

logger = logging.getLogger("papervision.agents.insight")


class InsightAgent(BaseAgent):
    name = "insight_agent"

    async def run(self, state: AgentState) -> AgentState:
        parsed_paper = state["parsed_paper"]
        summary = state.get("summary", {})
        keywords = state.get("keywords", [])
        citations = state.get("citations", [])
        return {
            "insights": extract_insights_fallback(
                parsed_paper,
                summary=summary,
                keywords=keywords,
                citations=citations,
            )
        }
