import { useCallback, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadBox({ onFileSelected }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  return (
    <motion.label
      htmlFor="pdf-upload"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      whileHover={{ scale: 1.005 }}
      className={`card flex flex-col items-center justify-center gap-4 py-20 cursor-pointer border-2 border-dashed transition-all ${
        dragActive 
          ? "border-brand-500 bg-brand-50/50 shadow-inner" 
          : "border-slate-200/80 bg-white hover:border-brand-500/50 hover:bg-slate-50/30"
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
        fileName ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600"
      }`}>
        {fileName ? <FileText size={26} /> : <UploadCloud size={26} />}
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-800">
          {fileName ? fileName : "Drag & drop your research paper PDF"}
        </p>
        <p className="text-xs text-slate-400">
          {fileName ? "Processing document..." : "or click to browse your files (up to 20MB)"}
        </p>
      </div>
      <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
    </motion.label>
  );
}
