from typing import Optional
from pydantic import BaseModel, Field


class AgentScore(BaseModel):
    agent: str
    quality_score: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    retried: bool = False
    notes: Optional[str] = None


class Metadata(BaseModel):
    title: str
    authors: list[str] = []
    year: Optional[int] = None
    venue: Optional[str] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None


class SummaryResult(BaseModel):
    executive_summary: str
    research_problem: str
    methodology: str
    key_findings: list[str]
    limitations: list[str]


class Citation(BaseModel):
    text: str
    page: Optional[int] = None
    verified: bool = False


class InsightResult(BaseModel):
    novelty_score: float = Field(ge=0, le=1)
    complexity_score: float = Field(ge=0, le=1)
    research_gaps: list[str] = []
    recommendations: list[str] = []

class KeywordResult(BaseModel):
    keywords: list[str] = []

class VisualizationHighlight(BaseModel):
    page: int
    label: str  # methodology | experiments | findings | citation | keyword | reference
    text_snippet: str
    bbox: Optional[list[float]] = None


class AnalysisResult(BaseModel):
    paper_id: str
    metadata: Metadata
    summary: SummaryResult
    citations: list[Citation]
    insights: InsightResult
    keywords: list[str]
    highlights: list[VisualizationHighlight]
    agent_scores: list[AgentScore]
    status: str = "completed"
