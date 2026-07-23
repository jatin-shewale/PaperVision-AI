import { CheckCircle2, XCircle } from "lucide-react";

export default function CitationTable({ citations = [], onCitationClick }) {
  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="citations">
      <h3 className="font-bold text-slate-900 text-lg mb-4">Citation Explorer</h3>
      <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-slate-500 bg-slate-50/80 border-b border-slate-200/60">
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Citation Text</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Location</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right">Verification Status</th>
            </tr>
          </thead>
          <tbody>
            {citations.map((c, i) => {
              const clickable = Boolean(c.page && onCitationClick);
              return (
                <tr
                  key={i}
                  className={`border-b border-slate-200/60 last:border-0 transition-colors ${clickable ? "hover:bg-slate-50/50 cursor-pointer" : ""}`}
                  onClick={() => clickable && onCitationClick(c.page)}
                >
                  <td className="py-3 px-4 text-slate-700 font-medium leading-relaxed max-w-md">
                    <button
                      type="button"
                      className={`text-left w-full ${clickable ? "hover:text-brand-700" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (clickable) onCitationClick(c.page);
                      }}
                    >
                      {c.text}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-semibold text-xs">
                    {c.page ? `Page ${c.page}` : "Page —"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 text-xs font-semibold">
                      {c.verified ? (
                        <>
                          <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />
                          <span className="text-emerald-700">Verified Citation</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-slate-400 shrink-0" size={14} />
                          <span className="text-slate-500">Unverified</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {citations.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                  No citations extracted from document.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
