import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Analysis from "./pages/Analysis.jsx";
import Landing from "./pages/Landing.jsx";
import About from "./pages/About.jsx";
import Toast from "./components/Toast.jsx";
import { AppProvider } from "./context/AppContext.jsx";

export default function App() {
  const { pathname } = useLocation();
  const showSidebar = ["/dashboard", "/upload", "/analysis"].some((p) =>
    pathname.startsWith(p)
  );

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <Toast />
        <div className="flex flex-1">
          {showSidebar && <Sidebar />}
          <main className={`flex-1 overflow-y-auto ${showSidebar ? "p-6" : ""}`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/analysis/:paperId" element={<Analysis />} />
            </Routes>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
