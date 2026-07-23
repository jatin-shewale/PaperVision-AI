# PaperVision AI

**Intelligent Multi-Agent Research Paper Intelligence Platform**

PaperVision AI ingests a research paper PDF and runs it through an 11-agent
LangGraph pipeline — extraction, semantic chunking/embedding, structural
analysis, summarization, citation extraction, keyword mining, insight
generation, visualization mapping, and a review/retry quality-control loop —
then presents the result in an interactive React dashboard with a synced PDF
viewer and animated workflow graph.

## Architecture

flowchart TD
    %% =========================
    %% DOCUMENT INGESTION
    %% =========================
    A[ Research Paper PDF] --> B[ Extract Text]
    B --> C[ Chunking]
    C --> D[ Generate Embeddings]
    D --> E[( FAISS Vector Store)]

    %% =========================
    %% ORCHESTRATION
    %% =========================
    E --> F{ Boss Agent}

    %% =========================
    %% PARALLEL ANALYSIS AGENTS
    %% =========================
    F --> G[ Metadata Agent]
    F --> H[ Paper Analyzer Agent]

    G --> I[ Summary Agent]
    H --> I

    I --> J[ Citation Agent]
    I --> K[ Keyword Agent]
    I --> L[ Insight Agent]

    %% =========================
    %% SPECIALIZED ANALYSIS
    %% =========================
    L --> L1[ Novelty Analysis]
    L --> L2[ Complexity Analysis]
    L --> L3[ Research Gap Detection]
    L --> L4[ Future Recommendations]

    %% =========================
    %% VISUALIZATION
    %% =========================
    H --> M[ Visualization Agent]
    M --> M1[ Page Mapping]
    M --> M2[ Highlight Mapping]

    %% =========================
    %% QUALITY CONTROL
    %% =========================
    J --> N[ Review Agent]
    K --> N
    L --> N
    M --> N

    N --> O{ Quality Check}

    O -->|Needs Improvement| F
    O -->|Approved| P[ Final Composer Agent]

    %% =========================
    %% FINAL OUTPUT
    %% =========================
    P --> Q[Research Brief]

    Q --> R[PDF Export]
    Q --> S[Markdown Export]
    Q --> T[🔗 JSON Export]

    %% =========================
    %% STYLES
    %% =========================
    classDef input fill:#E8F4FD,stroke:#3498DB,stroke-width:2px,color:#1F2937;
    classDef processing fill:#F3E8FF,stroke:#9B59B6,stroke-width:2px,color:#1F2937;
    classDef storage fill:#E8F8F5,stroke:#1ABC9C,stroke-width:2px,color:#1F2937;
    classDef orchestrator fill:#FFF4D6,stroke:#F39C12,stroke-width:2px,color:#1F2937;
    classDef agent fill:#EAF7EA,stroke:#52A447,stroke-width:2px,color:#1F2937;
    classDef analysis fill:#FFF0F5,stroke:#E67E9F,stroke-width:2px,color:#1F2937;
    classDef quality fill:#FFF8E7,stroke:#E6B800,stroke-width:2px,color:#1F2937;
    classDef output fill:#EAF2FF,stroke:#5B8DEF,stroke-width:2px,color:#1F2937;

    %% =========================
    %% APPLY STYLES
    %% =========================
    class A input;
    class B,C,D processing;
    class E storage;
    class F orchestrator;
    class G,H,I,J,K,L,M,P agent;
    class L1,L2,L3,L4,M1,M2 analysis;
    class N,O quality;
    class Q,R,S,T output;

Ollama + Qwen3:14B handles the full analysis pipeline locally, including
summarization, insight synthesis, quality review, metadata, section
segmentation, citations, and keywords. Gemini support remains configured as
an optional future provider.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Flow, React
PDF / PDF.js, Recharts, Lucide Icons, Axios.

**Backend:** FastAPI, LangGraph, Pydantic, Ollama (Qwen3:14B), optional Gemini,
PyMuPDF, pdfplumber, FAISS, Sentence Transformers, SQLite.

## Getting Started

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env as needed, and make sure Ollama is running locally
#   ollama serve
#   ollama pull qwen3:14b
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api` to
`http://localhost:8000`.

### 3. Docker (all services)

```bash
docker compose up --build
```

## API Overview

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | `/api/papers/upload`               | Upload a PDF, returns `paper_id`      |
| POST   | `/api/papers/{paper_id}/analyze`   | Runs the full agent pipeline          |
| GET    | `/api/papers/{paper_id}`           | Fetch the composed analysis result    |
| GET    | `/api/search/{paper_id}?q=...`     | Semantic search over paper chunks     |
| GET    | `/api/export/{paper_id}/{format}`  | Export as `json` / `markdown` / `pdf` |

## Review / Retry Loop

The `ReviewAgent` scores each upstream agent's output (0–1 quality +
confidence). If an agent's score falls below `REVIEW_QUALITY_THRESHOLD`
(default `0.75`), the `BossAgent`'s retry policy re-invokes that agent, up
to `MAX_AGENT_RETRIES` times, before the `ComposerAgent` assembles the final
brief.

## Notes on Configuration

- **Ollama**: the active AI provider. It requires a local Ollama server
  (`ollama serve`) with the `qwen3:14b` model pulled. If unavailable, agents
  fall back to lightweight defaults where supported.
- **Gemini**: remains available for a future provider switch and requires
  `GEMINI_API_KEY` in `backend/.env` when enabled.

## Project Structure

See `frontend/` and `backend/app/` — folders mirror the architecture diagram
above (`agents/`, `graph/`, `parser/`, `embeddings/`, `vectorstore/`, etc).

## License

MIT — built as an AI Agent Developer take-home submission.
