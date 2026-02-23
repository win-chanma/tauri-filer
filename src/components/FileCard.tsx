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
          ? "bg-indigo-500/20 ring-1 ring-indigo-500/50"
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
          entry.isDir ? "text-indigo-300" : "text-slate-300"
        }`}
      >
        {entry.name}
      </span>
    </div>
  );
});
