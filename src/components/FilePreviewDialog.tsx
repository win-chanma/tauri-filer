import { useState, useEffect } from "react";
import { readFilePreview } from "../commands/fs-commands";
import type { FileEntry } from "../types";
import { X, FileText, ImageIcon } from "lucide-react";

interface FilePreviewDialogProps {
  open: boolean;
  entry: FileEntry | null;
  onClose: () => void;
}

export function FilePreviewDialog({ open, entry, onClose }: FilePreviewDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !entry || entry.isDir) {
      setContent(null);
      setError(null);
      return;
    }

    const mime = entry.mimeType || "";
    if (mime.startsWith("image/")) {
      setContent(null);
      setError(null);
      return;
    }

    setLoading(true);
    readFilePreview(entry.path)
      .then((text) => {
        setContent(text);
        setError(null);
      })
      .catch((err) => {
        setContent(null);
        setError(String(err));
      })
      .finally(() => setLoading(false));
  }, [open, entry]);

  if (!open || !entry) return null;

  const mime = entry.mimeType || "";
  const isImage = mime.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2 min-w-0">
            {isImage ? <ImageIcon size={16} className="text-emerald-400" /> : <FileText size={16} className="text-slate-400" />}
            <span className="text-sm text-slate-200 truncate">{entry.name}</span>
          </div>
          <button className="text-slate-500 hover:text-slate-200" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-sm text-slate-500">Loading...</div>}
          {error && <div className="text-sm text-red-400">{error}</div>}
          {isImage && (
            <img
              src={`https://asset.localhost/${entry.path}`}
              alt={entry.name}
              className="max-w-full max-h-[60vh] object-contain mx-auto"
              onError={() => setError("Failed to load image")}
            />
          )}
          {content !== null && (
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
