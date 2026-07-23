"""Keyword Extraction Agent: pulls out core technical terms and topics
using local Qwen extraction over semantic chunks (cheap, high volume)."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_keywords_fallback

logger = logging.getLogger("papervision.agents.keyword")


class KeywordAgent(BaseAgent):
    name = "keyword_agent"

    async def run(self, state: AgentState) -> AgentState:
        parsed_paper = state["parsed_paper"]
        return {"keywords": extract_keywords_fallback(parsed_paper)}
