import { CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export default function AgentCard({ name, qualityScore, confidence, retried, notes }) {
  const passed = qualityScore >= 0.75;
  return (
    <div className="card bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 text-sm capitalize">{name.replace(/_/g, " ")}</span>
        {passed ? (
          <CheckCircle2 className="text-emerald-500" size={18} />
        ) : (
          <AlertTriangle className="text-amber-500" size={18} />
        )}
      </div>
      
      <div className="flex gap-4 text-[11px] font-semibold text-slate-500">
        <span>Quality: <span className={passed ? "text-emerald-600" : "text-amber-600"}>{(qualityScore * 100).toFixed(0)}%</span></span>
        <span>Confidence: <span className="text-slate-700">{(confidence * 100).toFixed(0)}%</span></span>
        {retried && (
          <span className="flex items-center gap-1 text-brand-600">
            <RotateCcw size={11} /> Auto-corrected
          </span>
        )}
      </div>
      
      {notes && <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">{notes}</p>}
      
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${qualityScore * 100}%` }}
        />
      </div>
    </div>
  );
}
