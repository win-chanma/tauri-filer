import { memo } from "react";
import type { FileEntry } from "../types";
import { FileIcon } from "./FileIcon";
import { getFileOpacity } from "../utils/file-opacity";

interface FileCardProps {
  entry: FileEntry;
  selected: boolean;
  isCut: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
}

export const FileCard = memo(function FileCard({ entry, selected, isCut, onSelect, onOpen }: FileCardProps) {
  const opacityClass = getFileOpacity({ isHidden: entry.isHidden, isCut });

  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer select-none ${
        selected
          ? "bg-[var(--color-selection-bg)] ring-1 ring-[var(--color-selection-ring)]"
          : "hover:bg-white/5"
      }${opacityClass ? ` ${opacityClass}` : ""}`}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        <FileIcon entry={entry} />
      </div>
      <span
        className={`text-xs text-center w-full truncate ${
          entry.isDir ? "text-[var(--color-dir-name)]" : "text-[var(--color-text-dim)]"
        }`}
      >
        {entry.name}
      </span>
    </div>
  );
});
