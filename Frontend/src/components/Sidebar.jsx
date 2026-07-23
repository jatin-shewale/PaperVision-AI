import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UploadCloud, FileSearch } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Paper", icon: UploadCloud },
];

export default function Sidebar() {
  const location = useLocation();
  const paperId = location.pathname.startsWith("/analysis/") ? location.pathname.split("/")[2] : null;
  const citationHref = paperId ? `/analysis/${paperId}#citations` : null;

  return (
    <aside className="w-60 border-r border-slate-200/60 bg-white p-5 hidden md:block shrink-0">
      <nav className="space-y-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-600 shadow-[0_1px_2px_rgba(99,102,241,0.05)] border border-brand-500/5"
                  : "hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent"
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
        {citationHref ? (
          <NavLink
            to={citationHref}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent"
          >
            <FileSearch size={16} className="shrink-0" />
            Citation Explorer
          </NavLink>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-400 select-none">
            <FileSearch size={16} className="shrink-0" />
            Citation Explorer
          </div>
        )}
      </nav>
    </aside>
  );
}
