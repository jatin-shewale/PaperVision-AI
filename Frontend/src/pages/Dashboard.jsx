import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPapers } from "../services/api.js";
import { FileText, UploadCloud } from "lucide-react";

export default function Dashboard() {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    listPapers().then(({ data }) => setPapers(data.papers || []));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Workspace Dashboard</h1>
          <p className="text-sm text-slate-500">Access synthesized research dossiers or upload new scientific publications.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-200"
        >
          <UploadCloud size={16} /> Analyze New Paper
        </Link>
      </div>

      {papers.length === 0 ? (
        <div className="card text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400">
          <FileText className="mx-auto mb-4 text-slate-300" size={40} />
          <p className="text-base font-semibold text-slate-700 mb-1">No synthesized papers found</p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Upload a manuscript to initialize the multi-agent cognitive analysis pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((id) => (
            <Link
              key={id}
              to={`/analysis/${id}`}
              className="card bg-white border border-slate-100 hover:border-brand-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 bg-indigo-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors text-sm mb-1 truncate">
                  {id}
                </h3>
                <p className="text-xs text-slate-400">Synthesized Document ID</p>
              </div>
              <span className="text-xs font-semibold text-brand-600 mt-4 inline-flex items-center gap-1 group-hover:underline">
                View synthesis brief →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
