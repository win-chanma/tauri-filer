import {
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileJson,
} from "lucide-react";
import type { FileEntry } from "../types";

const ICON_SIZE = 18;

export function FileIcon({ entry }: { entry: FileEntry }) {
  if (entry.isDir) {
    return <Folder size={ICON_SIZE} className="text-indigo-400 shrink-0" />;
  }

  const mime = entry.mimeType || "";

  if (mime.startsWith("image/")) {
    return <FileImage size={ICON_SIZE} className="text-emerald-400 shrink-0" />;
  }
  if (mime.startsWith("video/")) {
    return <FileVideo size={ICON_SIZE} className="text-rose-400 shrink-0" />;
  }
  if (mime.startsWith("audio/")) {
    return <FileAudio size={ICON_SIZE} className="text-amber-400 shrink-0" />;
  }
  if (mime === "application/json") {
    return <FileJson size={ICON_SIZE} className="text-yellow-400 shrink-0" />;
  }
  if (mime === "application/zip" || mime === "application/gzip") {
    return <FileArchive size={ICON_SIZE} className="text-orange-400 shrink-0" />;
  }
  if (
    mime.startsWith("text/") ||
    mime === "application/xml"
  ) {
    if (mime.includes("script") || mime.includes("typescript") || mime.includes("rust")) {
      return <FileCode size={ICON_SIZE} className="text-cyan-400 shrink-0" />;
    }
    return <FileText size={ICON_SIZE} className="text-slate-400 shrink-0" />;
  }

  return <File size={ICON_SIZE} className="text-slate-500 shrink-0" />;
}
