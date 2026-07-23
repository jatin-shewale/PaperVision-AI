"""FAISS-backed vector store for per-paper semantic search over chunks."""
import os
import pickle

import faiss
import numpy as np

from app.config import get_settings

settings = get_settings()


class FaissStore:
    def __init__(self, paper_id: str, dim: int = 384):
        os.makedirs(settings.vector_db_path, exist_ok=True)
        self.index_path = os.path.join(settings.vector_db_path, f"{paper_id}.index")
        self.meta_path = os.path.join(settings.vector_db_path, f"{paper_id}.meta.pkl")
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.chunks: list[str] = []

    def add(self, embeddings: np.ndarray, chunks: list[str]) -> None:
        self.index.add(embeddings.astype("float32"))
        self.chunks.extend(chunks)

    def save(self) -> None:
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "wb") as f:
            pickle.dump(self.chunks, f)

    def load(self) -> bool:
        if not (os.path.exists(self.index_path) and os.path.exists(self.meta_path)):
            return False
        self.index = faiss.read_index(self.index_path)
        with open(self.meta_path, "rb") as f:
            self.chunks = pickle.load(f)
        return True

    def search(self, query_embedding: np.ndarray, k: int = 5) -> list[tuple[str, float]]:
        if self.index.ntotal == 0:
            return []
        scores, idxs = self.index.search(
            query_embedding.reshape(1, -1).astype("float32"), min(k, self.index.ntotal)
        )
        return [
            (self.chunks[i], float(s))
            for s, i in zip(scores[0], idxs[0])
            if i != -1
        ]
