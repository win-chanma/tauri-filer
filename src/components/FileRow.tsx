import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FileEntry } from "../types";
import { FileIcon } from "./FileIcon";
import { formatFileSize, formatDate } from "../utils/format";
import { getFileOpacity } from "../utils/file-opacity";

interface FileRowProps {
  entry: FileEntry;
  selected: boolean;
  isCut: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const FileRow = memo(function FileRow({
  entry,
  selected,
  isCut,
  onSelect,
  onOpen,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
}: FileRowProps) {
  const { t } = useTranslation();
  const [dropTarget, setDropTarget] = useState(false);
  const opacityClass = getFileOpacity({ isHidden: entry.isHidden, isCut });

  return (
    <div
      className={`grid grid-cols-[1fr_80px_140px] items-center px-3 py-1.5 text-sm cursor-pointer rounded select-none ${
        dropTarget
          ? "bg-indigo-500/30 ring-1 ring-indigo-400"
          : selected
            ? "bg-indigo-500/20 text-slate-100"
            : "text-slate-400 hover:bg-white/5"
      }${opacityClass ? ` ${opacityClass}` : ""}`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={(e) => {
        onSelect(e);
        onContextMenu?.(e);
      }}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (entry.isDir) {
          onDragOver?.(e);
          setDropTarget(true);
        }
      }}
      onDragLeave={() => setDropTarget(false)}
      onDrop={(e) => {
        setDropTarget(false);
        if (entry.isDir) onDrop?.(e);
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <FileIcon entry={entry} />
        <span
          className={`truncate ${entry.isDir ? "text-indigo-300" : "text-slate-200"}`}
        >
          {entry.name}
        </span>
      </div>
      <span className="text-xs text-right tabular-nums">
        {entry.isDir ? t("fileRow.noSize") : formatFileSize(entry.size)}
      </span>
      <span className="text-xs text-right tabular-nums">
        {formatDate(entry.modified)}
      </span>
    </div>
  );
});
