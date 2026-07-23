import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [papers, setPapers] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastTimeout, setToastTimeout] = useState(null);

  const showToast = (message, type = "info") => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 4000);
    setToastTimeout(timer);
  };

  return (
    <AppContext.Provider value={{ papers, setPapers, activeAnalysis, setActiveAnalysis, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
