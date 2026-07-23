export default function SummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-lg">Executive Summary</h3>
        <p className="text-sm text-slate-600 leading-relaxed bg-brand-50/30 p-4 rounded-xl border border-brand-500/5 font-medium">
          {summary.executive_summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-brand-600">Research Problem</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{summary.research_problem}</p>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-brand-600">Methodology</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{summary.methodology}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-brand-600">Key Findings</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1.5">
            {(summary.key_findings || []).map((f, i) => (
              <li key={i} className="leading-relaxed">{f}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-brand-600">Limitations</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1.5">
            {(summary.limitations || []).map((l, i) => (
              <li key={i} className="leading-relaxed">{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
