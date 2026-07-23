import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getPaper, exportUrl, paperFileUrl } from "../services/api.js";
import MetadataCard from "../components/MetadataCard.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import CitationTable from "../components/CitationTable.jsx";
import InsightsPanel from "../components/InsightsPanel.jsx";
import AgentCard from "../components/AgentCard.jsx";
import PDFViewer from "../components/PDFViewer.jsx";
import WorkflowGraph from "../components/WorkflowGraph.jsx";
import LoadingAnimation from "../components/LoadingAnimation.jsx";
import SectionBreakdown from "../components/SectionBreakdown.jsx";
import { Download } from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";

export default function Analysis() {
  const { showToast } = useAppContext();
  const location = useLocation();
  const { paperId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadResult = async () => {
      try {
        const { data } = await getPaper(paperId);
        if (cancelled) return;
        if (data.status === "failed") {
          setError(data.error || "Analysis failed.");
          return;
        }
        setResult(data);
        if (data.status !== "completed") {
          window.setTimeout(loadResult, 2500);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.detail || err.message);
      }
    };

    loadResult();
    return () => {
      cancelled = true;
    };
  }, [paperId]);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash, result?.status]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium max-w-md mx-auto my-8">
        Failed to load analysis: {error}
      </div>
    );
  }
  
  if (!result || result.status !== "completed") {
    const stage = result?.stage || "extract";
    const completedStages = ["upload"];
    const stageOrder = ["extract", "chunk", "embedding", "boss", "metadata", "analyzer", "summary", "citation", "keyword", "insight", "visualization", "review", "composer"];
    const currentIndex = stageOrder.indexOf(stage);
    completedStages.push(...stageOrder.slice(0, Math.max(currentIndex, 0)));

    return (
      <div className="max-w-7xl mx-auto py-4 space-y-6">
        <div className="border-b border-slate-200/60 pb-6">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Cognitive Synthesis Dossier</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Building your research brief</h1>
          <p className="text-sm text-slate-500 mt-2">{result?.message || "Starting the local analysis pipeline..."}</p>
        </div>
        <LoadingAnimation label="Ollama is working locally. The final brief will appear here automatically." />
        <WorkflowGraph activeStage={stage} completedStages={completedStages} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200/60 pb-6">
        <div className="space-y-2 max-w-3xl">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Cognitive Synthesis Dossier</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {result.metadata?.title || "Research Brief"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 pt-2">
          {["json", "markdown", "pdf"].map((fmt) => (
            <a
              key={fmt}
              href={exportUrl(paperId, fmt)}
              onClick={() => showToast(`Downloading synthesized ${fmt.toUpperCase()} brief...`, "success")}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Download size={13} /> {fmt.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      <WorkflowGraph completedStages={["upload", "extract", "chunk", "embedding", "boss", "metadata", "analyzer", "summary", "citation", "keyword", "insight", "visualization", "review", "composer"]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MetadataCard metadata={result.metadata} />
          <SummaryCard summary={result.summary} />
          <SectionBreakdown sections={result.sections || []} />
          <CitationTable
            citations={result.citations}
            onCitationClick={(page) => {
              setActivePage(page);
              const viewer = document.getElementById("document-viewer");
              if (viewer) {
                viewer.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
          <InsightsPanel insights={result.insights} />
        </div>
        <div className="space-y-8">
          <div id="document-viewer">
            <PDFViewer
              fileUrl={paperFileUrl(paperId)}
              highlights={result.highlights}
              activePage={activePage}
              onJumpToPage={setActivePage}
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Pipeline Agent Reviews</h3>
            <div className="grid gap-4">
              {(result.agent_scores || []).map((s, i) => (
                <AgentCard
                  key={i}
                  name={s.agent}
                  qualityScore={s.quality_score}
                  confidence={s.confidence}
                  retried={s.retried}
                  notes={s.notes}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
