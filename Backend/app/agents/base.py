"""Shared base class for all agents. Each agent receives the shared
`GraphState` dict, does its job, and returns a partial state update."""
from abc import ABC, abstractmethod
from typing import Any

AgentState = dict[str, Any]


class BaseAgent(ABC):
    name: str = "base_agent"

    @abstractmethod
    async def run(self, state: AgentState) -> AgentState:
        """Execute the agent's task and return state updates to merge in."""
        raise NotImplementedError
