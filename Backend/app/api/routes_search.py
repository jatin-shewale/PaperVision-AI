"""Semantic search within a paper's vector store (RAG-style lookup)."""
from fastapi import APIRouter, HTTPException

from app.embeddings.embedding import embed_query
from app.vectorstore.faiss_store import FaissStore

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/{paper_id}")
async def search_paper(paper_id: str, q: str, k: int = 5):
    store = FaissStore(paper_id)
    if not store.load():
        raise HTTPException(404, "No vector index found for this paper_id")
    query_emb = embed_query(q)
    results = store.search(query_emb, k=k)
    return {"query": q, "results": [{"chunk": c, "score": s} for c, s in results]}
