import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadBox from "../components/UploadBox.jsx";
import LoadingAnimation from "../components/LoadingAnimation.jsx";
import WorkflowGraph from "../components/WorkflowGraph.jsx";
import { uploadPaper, analyzePaper } from "../services/api.js";
import { useAppContext } from "../context/AppContext.jsx";

export default function Upload() {
  const { showToast } = useAppContext();
  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | error
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFile = async (file) => {
    setStatus("uploading");
    setError(null);
    showToast("Uploading document to secure workspace...", "info");
    try {
      const { data: uploadData } = await uploadPaper(file);
      setStatus("analyzing");
      showToast("Initializing multi-agent synthesis suite...", "info");
      await analyzePaper(uploadData.paper_id);
      navigate(`/analysis/${uploadData.paper_id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
      setStatus("error");
      showToast("Synthesis engine run failed.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload a Research Paper</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Our cognitive synthesis pipeline orchestrates specialized agents—spanning document parsing, metadata analysis, structural segmentation, citation verification, and quality review—to generate a comprehensive research dossier.
        </p>
      </div>

      <UploadBox onFileSelected={handleFile} />

      {status === "uploading" && <LoadingAnimation label="Uploading document to secure workspace..." />}
      {status === "analyzing" && (
        <div className="space-y-6">
          <LoadingAnimation label="Executing multi-agent synthesis and verification protocols..." />
          <WorkflowGraph activeStage="extract" completedStages={["upload"]} />
        </div>
      )}
      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600 font-medium">
            Analysis Failed: {error || "Connection timed out."}
          </p>
          <p className="text-xs text-red-500 mt-1">
            Please verify that the PaperVision AI analysis services are running and your environment parameters are configured.
          </p>
        </div>
      )}
    </div>
  );
}
