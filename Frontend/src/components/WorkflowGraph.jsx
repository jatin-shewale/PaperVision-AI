import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

const STAGES = [
  "upload", "extract", "chunk", "embedding", "vector_search",
  "boss", "metadata", "analyzer", "summary", "citation",
  "keyword", "insight", "visualization", "review", "composer",
];

const LABELS = {
  upload: "Upload", extract: "Extract Text", chunk: "Chunking",
  embedding: "Embeddings", vector_search: "Vector Search", boss: "Boss Agent",
  metadata: "Metadata Agent", analyzer: "Paper Analyzer", summary: "Summary Agent",
  citation: "Citation Agent", keyword: "Keyword Agent", insight: "Insight Agent",
  visualization: "Visualization Agent", review: "Review Agent", composer: "Final Composer",
};

/** activeStage: id of the currently running stage (for pulse highlight) */
export default function WorkflowGraph({ activeStage, completedStages = [] }) {
  const nodes = useMemo(
    () =>
      STAGES.map((id, i) => {
        const isActive = id === activeStage;
        const isDone = completedStages.includes(id);
        return {
          id,
          data: { label: LABELS[id] },
          position: { x: (i % 3) * 220, y: Math.floor(i / 3) * 90 },
          style: {
            background: isActive ? "#4f46e5" : isDone ? "#f5f3ff" : "#ffffff",
            color: isActive ? "#ffffff" : isDone ? "#4f46e5" : "#64748b",
            border: `1px solid ${isActive ? "#4338ca" : isDone ? "#c7d2fe" : "#e2e8f0"}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: isActive || isDone ? "600" : "500",
            padding: 8,
            width: 180,
            boxShadow: isActive 
              ? "0 4px 12px rgba(79, 70, 229, 0.2)" 
              : "0 1px 3px rgba(0, 0, 0, 0.02)",
          },
        };
      }),
    [activeStage, completedStages]
  );

  const edges = useMemo(
    () =>
      STAGES.slice(1).map((id, i) => {
        const isActiveOrDone = id === activeStage || completedStages.includes(id);
        return {
          id: `${STAGES[i]}-${id}`,
          source: STAGES[i],
          target: id,
          animated: id === activeStage,
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: isActiveOrDone ? "#818cf8" : "#cbd5e1"
          },
          style: { 
            stroke: isActiveOrDone ? "#818cf8" : "#e2e8f0", 
            strokeWidth: isActiveOrDone ? 2 : 1.5 
          },
        };
      }),
    [activeStage, completedStages]
  );

  return (
    <div className="h-[380px] card overflow-hidden bg-white p-0 relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cognitive Pipeline Stream</span>
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
