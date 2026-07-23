"""Metadata Agent: extracts title, authors, year, venue, abstract, DOI
from the first page(s) of the paper using local Ollama/Qwen extraction."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import extract_metadata_fallback

logger = logging.getLogger("papervision.agents.metadata")


class MetadataAgent(BaseAgent):
    name = "metadata_agent"

    async def run(self, state: AgentState) -> AgentState:
        parsed_paper = state["parsed_paper"]
        return {"metadata": extract_metadata_fallback(parsed_paper)}
