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
    return <Folder size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-folder)" }} />;
  }

  const mime = entry.mimeType || "";

  if (mime.startsWith("image/")) {
    return <FileImage size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-image)" }} />;
  }
  if (mime.startsWith("video/")) {
    return <FileVideo size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-video)" }} />;
  }
  if (mime.startsWith("audio/")) {
    return <FileAudio size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-audio)" }} />;
  }
  if (mime === "application/json") {
    return <FileJson size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-json)" }} />;
  }
  if (mime === "application/zip" || mime === "application/gzip") {
    return <FileArchive size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-archive)" }} />;
  }
  if (
    mime.startsWith("text/") ||
    mime === "application/xml"
  ) {
    if (mime.includes("script") || mime.includes("typescript") || mime.includes("rust")) {
      return <FileCode size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-code)" }} />;
    }
    return <FileText size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-text)" }} />;
  }

  return <File size={ICON_SIZE} className="shrink-0" style={{ color: "var(--color-icon-default)" }} />;
}
