"""Generates sentence embeddings for chunked paper text using
sentence-transformers (all-MiniLM-L6-v2 by default: fast + good quality)."""
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_texts(texts: list[str]) -> np.ndarray:
    model = _get_model()
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)


def embed_query(text: str) -> np.ndarray:
    return embed_texts([text])[0]
