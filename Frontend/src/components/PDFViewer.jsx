import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Point pdf.js at a CDN worker matching the installed version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Renders the uploaded PDF and overlays highlight markers for the labels
 * produced by the Visualization Agent (methodology, experiments, findings,
 * citations, references, keywords). Clicking a citation/keyword elsewhere
 * in the UI can call `onJumpToPage` to scroll here.
 */
export default function PDFViewer({ fileUrl, highlights = [], activePage, onJumpToPage }) {
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(activePage || 1);

  useEffect(() => {
    if (activePage) {
      setPage(activePage);
    }
  }, [activePage]);

  const pageHighlights = highlights.filter((h) => h.page === page);

  return (
    <div className="card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-lg">Document Viewer</h3>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-slate-700 text-xs">
            Page {page} {numPages ? `/ ${numPages}` : ""}
          </span>
          <button
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
            disabled={numPages && page >= numPages}
            onClick={() => setPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {fileUrl ? (
        <div className="relative border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50/50 flex justify-center p-2 min-h-[400px]">
          <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={page} width={380} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
          {onJumpToPage && (
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => onJumpToPage(page)}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white"
              >
                Sync view
              </button>
            </div>
          )}
          {pageHighlights.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 border border-slate-200/60 rounded-xl p-3 text-[11px] space-y-1.5 max-h-32 overflow-y-auto shadow-md backdrop-blur-sm">
              <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Synthesized Highlights</div>
              {pageHighlights.map((h, i) => (
                <div key={i} className="flex gap-2 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                  <span className="uppercase text-brand-600 font-bold shrink-0">{h.label}</span>
                  <span className="text-slate-600 truncate">{h.text_snippet}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100/80">
          <p className="text-sm font-medium">No document loaded</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Upload a research manuscript to preview document highlights.</p>
        </div>
      )}
    </div>
  );
}
