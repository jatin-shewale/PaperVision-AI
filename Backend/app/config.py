"""Central application configuration, loaded from environment variables."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:14b"

    review_quality_threshold: float = 0.75
    max_agent_retries: int = 2

    vector_db_path: str = "./data/faiss_index"
    sqlite_path: str = "./data/papervision.db"

    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> "Settings":
    return Settings()
