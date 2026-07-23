import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from "recharts";

export default function InsightsPanel({ insights }) {
  if (!insights) return null;
  
  const data = [
    { name: "Novelty", value: Math.round((insights.novelty_score || 0) * 100), fill: "#4f46e5" },
    { name: "Complexity", value: Math.round((insights.complexity_score || 0) * 100), fill: "#f59e0b" },
  ];

  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">Analytical Metrics</h3>
        <p className="text-xs text-slate-400">Algorithmic scoring of methodology novelty and complexity.</p>
      </div>

      <div className="h-44 border border-slate-100 rounded-xl p-3 bg-slate-50/50 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="35%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar 
              minAngle={15} 
              background={{ fill: "#e2e8f0" }} 
              clockWise 
              dataKey="value" 
              cornerRadius={4}
            />
            <Legend 
              iconSize={8} 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider text-xs">Identified Research Gaps</h4>
          <ul className="space-y-2">
            {(insights.research_gaps || []).map((g, i) => (
              <li key={i} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed">
                {g}
              </li>
            ))}
            {(insights.research_gaps || []).length === 0 && (
              <li className="text-xs text-slate-400 italic">No critical gaps identified.</li>
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider text-xs">Future Research Directions</h4>
          <ul className="space-y-2">
            {(insights.recommendations || []).map((r, i) => (
              <li key={i} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed">
                {r}
              </li>
            ))}
            {(insights.recommendations || []).length === 0 && (
              <li className="text-xs text-slate-400 italic">No recommendations available.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
