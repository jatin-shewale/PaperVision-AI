"""Thin async wrapper around Google Gemini for orchestration, reasoning,
structured JSON output, and review/synthesis tasks."""
import json
import logging
from typing import Any, Optional

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

logger = logging.getLogger("papervision.gemini")
settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


class GeminiClient:
    """Handles all calls to Gemini 2.5 Flash.

    Used by: BossAgent (orchestration), ReviewAgent (quality scoring),
    ComposerAgent (final synthesis).
    """

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.gemini_model
        self._model = genai.GenerativeModel(self.model_name) if settings.gemini_api_key else None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def generate_json(self, prompt: str, schema_hint: str = "") -> dict[str, Any]:
        """Ask Gemini for a strictly-JSON response. Raises if no API key is configured."""
        if not self._model:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to backend/.env to enable Gemini calls."
            )
        full_prompt = (
            f"{prompt}\n\n"
            f"Respond with ONLY valid JSON, no markdown fences, no commentary. {schema_hint}"
        )
        response = self._model.generate_content(full_prompt)
        text = response.text.strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.warning("Gemini returned non-JSON, wrapping raw text")
            return {"raw": text}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def generate_text(self, prompt: str) -> str:
        if not self._model:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to backend/.env to enable Gemini calls."
            )
        response = self._model.generate_content(prompt)
        return response.text.strip()
