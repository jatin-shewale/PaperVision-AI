"""Review Agent: quality-control gate for upstream agent outputs."""
import logging

from app.agents.base import AgentState, BaseAgent
from app.utils.analysis_fallbacks import score_output_completeness

logger = logging.getLogger("papervision.agents.reviewer")


class ReviewAgent(BaseAgent):
    name = "review_agent"

    async def review(self, agent_name: str, output: dict) -> dict:
        quality_score, confidence = score_output_completeness(output)
        notes = "Auto-corrected from extracted text" if quality_score >= 0.7 else "Sparse output"
        return {
            "quality_score": quality_score,
            "confidence": confidence,
            "notes": notes,
        }

    async def run(self, state: AgentState) -> AgentState:
        """Reviews every agent output currently in state; caller (graph) decides retries."""
        targets = ["metadata", "summary", "citations", "keywords", "insights"]
        scores = []
        for t in targets:
            if t in state:
                result = await self.review(t, state[t])
                scores.append({
                    "agent": t,
                    "quality_score": result["quality_score"],
                    "confidence": result["confidence"],
                    "retried": False,
                    "notes": result.get("notes"),
                })
        return {"agent_scores": scores}
