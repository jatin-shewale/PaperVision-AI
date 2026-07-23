import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, CheckCircle2, FileSearch, LineChart, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Decorative background grid and shapes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 z-0" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm animate-fade-in">
            <Sparkles size={12} className="text-indigo-600" />
            <span>Next-Generation Academic Synthesis Suite</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Transform Research Papers into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Cognitive Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload complex academic manuscripts and let our collaborative multi-agent suite dissect methodologies, verify citations, extract gaps, and compose executive briefs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-200 group"
            >
              Launch Workspace
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              Explore Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Core Synthesis Engines</h2>
          <p className="text-slate-600">
            A comprehensive pipeline of autonomous intelligence agents mapping out every dimension of scientific literature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="card hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-600 mb-5">
              <Brain size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Multi-Agent Orchestration</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              An orchestrator directs specialty agents to analyze structural segments, extract equations, map experimental designs, and cross-examine findings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-600 mb-5">
              <FileSearch size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Verified Citations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every extracted citation is cross-verified against actual text blocks and pages, ensuring high precision and eliminating synthetic source references.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-600 mb-5">
              <LineChart size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Analytical Insights</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive structured grading on paper novelty, methodology complexity, research gap classifications, and recommended follow-up questions.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Pipeline Highlights */}
      <section className="bg-white py-20 border-y border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Rigorous Quality Loop for Uncompromised Accuracy
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Academic papers demand absolute precision. Our architecture incorporates an integrated quality-review protocol that evaluates downstream agent output. If quality validation scores fall short, the pipeline triggers automatic corrective runs.
            </p>
            
            <div className="space-y-3 pt-2">
              {[
                "Self-healing feedback loops mapping agent outputs to score parameters",
                "Segment-based vector mapping of findings, methodology, and citations",
                "Export-ready synthesis dossiers in PDF, JSON, and Markdown formats",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-inner space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <span className="text-xs font-semibold text-slate-400">PIPELINE DIAGNOSTICS</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm font-semibold text-slate-800">1. Document Parsing & Embeddings</span>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Completed</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm font-semibold text-slate-800">2. Metadata & Structure Extraction</span>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Completed</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm font-semibold text-slate-800">3. Autonomous Agent Synthesis</span>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Completed</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-sm animate-pulse">
                <span className="text-sm font-semibold text-slate-800">4. High-Fidelity Review & Composition</span>
                <span className="text-xs font-semibold bg-brand-600 text-white px-2.5 py-1 rounded-full">In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/40 text-center">
        <div className="max-w-6xl mx-auto px-6 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} PaperVision AI. Engineered for deep academic understanding and verified analysis.</p>
        </div>
      </footer>
    </div>
  );
}
