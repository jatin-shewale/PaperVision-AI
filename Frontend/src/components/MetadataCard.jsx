export default function MetadataCard({ metadata }) {
  if (!metadata) return null;

  const rows = [
    { label: "Title", value: metadata.title, isTitle: true },
    { label: "Authors", value: (metadata.authors || []).join(", ") || "—" },
    { label: "Year", value: metadata.year ?? "—" },
    { label: "Venue", value: metadata.venue ?? "—" },
    { label: "DOI", value: metadata.doi ?? "—" },
  ];

  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 text-lg mb-4">Paper Metadata</h3>
      <div className="border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        {rows.map((r, i) => (
          <div
            key={i}
            className={`grid grid-cols-3 text-sm p-4 ${
              i % 2 === 0 ? "bg-slate-50/50" : "bg-white"
            } ${i !== rows.length - 1 ? "border-b border-slate-200/60" : ""}`}
          >
            <div className="font-semibold text-slate-500">{r.label}</div>
            <div
              className={`col-span-2 font-medium leading-relaxed ${
                r.isTitle ? "text-slate-900 font-bold" : "text-slate-700"
              }`}
            >
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
