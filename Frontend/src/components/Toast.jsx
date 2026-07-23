import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";

export default function Toast() {
  const { toast, showToast } = useAppContext();

  if (!toast) return null;

  const { message, type } = toast;

  const styles = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-500/20",
      text: "text-emerald-800",
      icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
    },
    error: {
      bg: "bg-rose-50/95 border-rose-500/20",
      text: "text-rose-800",
      icon: <XCircle className="text-rose-500 shrink-0" size={18} />,
    },
    info: {
      bg: "bg-indigo-50/95 border-indigo-500/20",
      text: "text-indigo-800",
      icon: <Info className="text-brand-600 shrink-0" size={18} />,
    },
  }[type || "info"];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-full border shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md ${styles.bg}`}
      >
        {styles.icon}
        <span className={`text-xs font-bold tracking-wide ${styles.text}`}>
          {message}
        </span>
      </motion.div>
    </div>
  );
}
