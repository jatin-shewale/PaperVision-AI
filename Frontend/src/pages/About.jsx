import { Link } from "react-router-dom";
import { ArrowLeft, Brain, ShieldAlert, Cpu, Eye, FileSpreadsheet, RotateCcw } from "lucide-react";

export default function About() {
  const agents = [
    {
      icon: Cpu,
      title: "Orchestrator Node (Boss Agent)",
      desc: "Supervises the task schedule, triggers segment-specific execution branches, and handles retry routing in cases of low downstream confidence."
    },
    {
      icon: Brain,
      title: "Extraction & Structure Cluster",
      desc: "Handles text decoding, tabular and equation isolation, and builds structured index points across different document pages."
    },
    {
      icon: FileSpreadsheet,
      title: "Synthesis Specialists",
      desc: "Parallel specialized agents for Metadata validation, Citation matching, Keyword clustering, and Novelty / Complexity analytics."
    },
    {
      icon: ShieldAlert,
      title: "Review Agent",
      desc: "Quality assurance node that grades downstream facts, validates source snippets, and scores outputs to guarantee truthfulness."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Vision Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Vision Behind PaperVision AI</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Modern scientific literature is growing at an exponential rate. Traditional document parsers extract text but fail to synthesize insights, verify facts, or detect contradictions. PaperVision AI was built to solve this by organizing multiple AI agents into a coordinated cognitive pipeline.
          </p>
        </div>

        {/* Cognitive Pipeline Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Multi-Agent Cognitive Architecture</h2>
          <p className="text-slate-600">
            Rather than relying on a single prompt to digest a 20-page research paper, PaperVision AI distributes tasks across a hierarchy of specialized agents. Each agent does one job exceptionally well, reporting their results back to a coordinator.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="card bg-white p-6 rounded-2xl border border-slate-100/80 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{agent.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{agent.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Check Section */}
        <div className="card bg-white border-l-4 border-l-brand-600 p-8 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-brand-600 rounded-lg">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">The Quality Feedback Loop</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            A key feature of the pipeline is our **Review & Repair** logic. If an agent outputs a brief summary that falls below a quality threshold (e.g. 75%), the system automatically flags the discrepancy and re-runs the task with self-corrective parameters. This ensures that the generated executive brief is highly accurate, factual, and complete.
          </p>
        </div>

        {/* Closing CTA */}
        <div className="text-center pt-8 border-t border-slate-200/60">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
          >
            Go to App Workspace <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
