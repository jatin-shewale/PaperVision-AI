"""Wrapper around a local Ollama instance running Qwen3:14B, used for local
document understanding: extraction, citation parsing, keyword mining, and
semantic chunk analysis (keeps heavy-volume text work off the paid Gemini API)."""
import json
import logging
from typing import Any

import ollama

from app.config import get_settings

logger = logging.getLogger("papervision.ollama")
settings = get_settings()


class OllamaClient:
    def __init__(self):
        self.client = ollama.Client(host=settings.ollama_base_url)
        self.model = settings.ollama_model

    def generate_json(self, prompt: str) -> dict[str, Any]:
        try:
            response = self.client.generate(
                model=self.model,
                prompt=f"{prompt}\n\nRespond with ONLY valid JSON.",
                format="json",
            )
            return json.loads(response["response"])
        except Exception as exc:  # noqa: BLE001
            logger.error("Ollama call failed: %s", exc)
            raise RuntimeError(
                f"Could not reach Ollama at {settings.ollama_base_url}. "
                "Make sure `ollama serve` is running and `ollama pull qwen3:14b` has been run."
            ) from exc

    def generate_text(self, prompt: str) -> str:
        response = self.client.generate(model=self.model, prompt=prompt)
        return response["response"].strip()
