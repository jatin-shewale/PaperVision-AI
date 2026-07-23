"""Final Composer Agent: assembles all agent outputs into the unified
AnalysisResult that the frontend renders as the Research Brief."""
import logging
import uuid

from app.agents.base import AgentState, BaseAgent

logger = logging.getLogger("papervision.agents.composer")


class ComposerAgent(BaseAgent):
    name = "composer_agent"

    async def run(self, state: AgentState) -> AgentState:
        paper_id = state.get("paper_id") or str(uuid.uuid4())
        result = {
            "paper_id": paper_id,
            "metadata": state.get("metadata", {}),
            "summary": state.get("summary", {}),
            "citations": state.get("citations", []),
            "insights": state.get("insights", {}),
            "keywords": state.get("keywords", []),
            "sections": state.get("sections", []),
            "highlights": state.get("highlights", []),
            "agent_scores": state.get("agent_scores", []),
            "status": "completed",
        }
        return {"result": result}
