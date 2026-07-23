"""PaperVision AI backend entrypoint."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_export, routes_papers, routes_search
from app.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("papervision")

settings = get_settings()

app = FastAPI(
    title="PaperVision AI",
    description="Multi-agent research paper intelligence platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_papers.router)
app.include_router(routes_export.router)
app.include_router(routes_search.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "papervision-ai-backend"}
