"""Boss Agent: top-level orchestrator. Kicks off the pipeline and holds the
retry policy — if the Review Agent scores an upstream agent below threshold,
the Boss Agent re-invokes that agent (bounded by MAX_AGENT_RETRIES)."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.config import get_settings

logger = logging.getLogger("papervision.agents.boss")
settings = get_settings()


class BossAgent(BaseAgent):
    name = "boss_agent"

    async def run(self, state: AgentState) -> AgentState:
        logger.info("Boss agent starting pipeline for paper_id=%s", state.get("paper_id"))
        return {"status": "orchestrating", "retries": state.get("retries") or {}}

    @staticmethod
    def should_retry(agent_name: str, score: float, state: AgentState) -> bool:
        retries = state.get("retries") or {}
        count = retries.get(agent_name, 0)
        return score < settings.review_quality_threshold and count < settings.max_agent_retries
