import { motion } from "framer-motion";

export default function LoadingAnimation({ label = "Working..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-xl mx-auto">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-slate-100"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent border-r-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
        />
      </div>
      <p className="text-sm font-semibold text-slate-500 tracking-wide text-center px-4 animate-pulse">{label}</p>
    </div>
  );
}
