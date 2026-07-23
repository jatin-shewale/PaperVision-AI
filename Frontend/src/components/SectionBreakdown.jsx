export default function SectionBreakdown({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="sections">
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">Section Breakdown</h3>
        <p className="text-xs text-slate-400">Automatically mapped sections from the paper text.</p>
      </div>

      <div className="grid gap-3">
        {sections.map((section, index) => (
          <div key={index} className="border border-slate-200/60 rounded-xl p-4 bg-slate-50/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{section.label.replace(/_/g, " ")}</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{section.summary}</p>
              </div>
            </div>
            {section.start_snippet && (
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed line-clamp-2">
                {section.start_snippet}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
