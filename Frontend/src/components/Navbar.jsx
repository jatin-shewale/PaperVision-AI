import { Link, NavLink } from "react-router-dom";
import { Brain, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shadow-sm border border-brand-500/10 group-hover:scale-105 transition-transform">
          <Brain size={20} className="fill-brand-500/10" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">PaperVision <span className="text-brand-600">AI</span></span>
      </Link>

      <nav className="hidden sm:flex items-center gap-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm font-semibold transition-colors ${
              isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `text-sm font-semibold transition-colors ${
              isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
            }`
          }
        >
          Architecture
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm font-semibold transition-colors ${
              isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
            }`
          }
        >
          Workspace
        </NavLink>
      </nav>

      <div className="flex items-center gap-4">
        {/* Premium Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-brand-50 border border-brand-500/10 rounded-full px-2.5 py-1 text-xs font-semibold text-brand-700">
          <Sparkles size={12} />
          <span>Professional Account</span>
        </div>

        {/* Avatar Placeholder */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          PV
        </div>
      </div>
    </header>
  );
}
