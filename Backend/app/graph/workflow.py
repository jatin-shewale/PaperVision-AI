"""LangGraph orchestration: Boss -> {Metadata, Analyzer} -> Summary -> Citation
-> Keyword -> Insight -> Visualization -> Review (scores + triggers retries)
-> Composer -> (Export on demand).

This mirrors the architecture diagram in the assignment brief, expressed as
a LangGraph StateGraph so execution order, branching, and retries are explicit.
"""
import logging

from langgraph.graph import StateGraph, END
from typing import Callable
from typing_extensions import TypedDict

from app.agents.analyzer import PaperAnalyzerAgent
from app.agents.boss_agent import BossAgent
from app.agents.citation import CitationAgent
from app.agents.composer import ComposerAgent
from app.agents.insight import InsightAgent
from app.agents.keyword import KeywordAgent
from app.agents.metadata import MetadataAgent
from app.agents.reviewer import ReviewAgent
from app.agents.summarizer import SummaryAgent
from app.agents.visualization import VisualizationAgent
from app.parser.pdf_parser import ParsedPaper

logger = logging.getLogger("papervision.graph")


class PipelineState(TypedDict, total=False):
    paper_id: str
    parsed_paper: ParsedPaper
    sections: list
    metadata: dict
    summary: dict
    citations: list
    references: list
    keywords: list
    insights: dict
    highlights: list
    agent_scores: list
    retries: dict
    result: dict
    status: str
    progress_callback: Callable[[str, str], None]


def _report(state: PipelineState, stage: str, message: str) -> None:
    callback = state.get("progress_callback")
    if callback:
        callback(stage, message)


boss = BossAgent()
metadata_agent = MetadataAgent()
analyzer_agent = PaperAnalyzerAgent()
summary_agent = SummaryAgent()
citation_agent = CitationAgent()
keyword_agent = KeywordAgent()
insight_agent = InsightAgent()
visualization_agent = VisualizationAgent()
review_agent = ReviewAgent()
composer_agent = ComposerAgent()


async def node_boss(state: PipelineState) -> PipelineState:
    _report(state, "boss", "Planning the analysis pipeline")
    return await boss.run(state)


async def node_metadata(state: PipelineState) -> PipelineState:
    _report(state, "metadata", "Extracting paper metadata")
    return await metadata_agent.run(state)


async def node_analyzer(state: PipelineState) -> PipelineState:
    _report(state, "analyzer", "Analyzing structure and sections")
    return await analyzer_agent.run(state)


async def node_summary(state: PipelineState) -> PipelineState:
    _report(state, "summary", "Writing the research summary")
    return await summary_agent.run(state)


async def node_citation(state: PipelineState) -> PipelineState:
    _report(state, "citation", "Extracting and checking citations")
    return await citation_agent.run(state)


async def node_keyword(state: PipelineState) -> PipelineState:
    _report(state, "keyword", "Mining key terms")
    return await keyword_agent.run(state)


async def node_insight(state: PipelineState) -> PipelineState:
    _report(state, "insight", "Generating research insights")
    return await insight_agent.run(state)


async def node_visualization(state: PipelineState) -> PipelineState:
    _report(state, "visualization", "Mapping findings to paper pages")
    return await visualization_agent.run(state)


async def node_review(state: PipelineState) -> PipelineState:
    """Runs review, and re-runs any agent that scored below threshold
    (bounded by MAX_AGENT_RETRIES), then re-reviews once more."""
    _report(state, "review", "Checking answer quality")
    review_result = await review_agent.run(state)
    retries = dict(state.get("retries") or {})
    scores = review_result.get("agent_scores") or []

    rerun_map = {
        "metadata": node_metadata,
        "summary": node_summary,
        "citations": node_citation,
        "keywords": node_keyword,
        "insights": node_insight,
    }

    updated_state = dict(state)
    for s in scores:
        agent_key = s["agent"]
        if BossAgent.should_retry(agent_key, s["quality_score"], {"retries": retries}):
            logger.info("Retrying %s (score=%.2f)", agent_key, s["quality_score"])
            _report(updated_state, agent_key, f"Improving {agent_key} after quality review")
            retries[agent_key] = retries.get(agent_key, 0) + 1
            node_fn = rerun_map.get(agent_key)
            if node_fn:
                rerun_update = await node_fn(updated_state)
                updated_state.update(rerun_update)
                s["retried"] = True

    updated_state["agent_scores"] = scores
    updated_state["retries"] = retries
    return updated_state


async def node_composer(state: PipelineState) -> PipelineState:
    _report(state, "composer", "Assembling the final research brief")
    return await composer_agent.run(state)


def build_graph():
    graph = StateGraph(PipelineState)
    graph.add_node("boss", node_boss)
    graph.add_node("metadata_node", node_metadata)
    graph.add_node("analyzer", node_analyzer)
    graph.add_node("summary_node", node_summary)
    graph.add_node("citation", node_citation)
    graph.add_node("keyword", node_keyword)
    graph.add_node("insight_node", node_insight)
    graph.add_node("visualization", node_visualization)
    graph.add_node("review", node_review)
    graph.add_node("composer", node_composer)

    graph.set_entry_point("boss")
    graph.add_edge("boss", "metadata_node")
    graph.add_edge("metadata_node", "analyzer")
    graph.add_edge("analyzer", "summary_node")
    graph.add_edge("summary_node", "citation")
    graph.add_edge("citation", "keyword")
    graph.add_edge("keyword", "insight_node")
    graph.add_edge("insight_node", "visualization")
    graph.add_edge("visualization", "review")
    graph.add_edge("review", "composer")
    graph.add_edge("composer", END)

    return graph.compile()


pipeline = build_graph()
