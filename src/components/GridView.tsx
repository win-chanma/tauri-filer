import { useMemo, useCallback } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { useNavigation } from "../hooks/use-navigation";
import { sortEntries } from "../utils/sort";
import { isCutPath } from "../utils/clipboard-helpers";
import { FileCard } from "./FileCard";
import type { FileEntry } from "../types";

interface GridViewProps {
  onContextMenu?: (e: React.MouseEvent) => void;
  onFileOpen?: (entry: FileEntry) => void;
}

export function GridView({ onContextMenu, onFileOpen }: GridViewProps) {
  const entries = useFileStore((s) => s.entries);
  const sortConfig = useFileStore((s) => s.sortConfig);
  const showHidden = useUIStore((s) => s.showHidden);
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const setSelectedPaths = useFileStore((s) => s.setSelectedPaths);
  const toggleSelection = useFileStore((s) => s.toggleSelection);
  const clipboardPaths = useClipboardStore((s) => s.paths);
  const clipboardMode = useClipboardStore((s) => s.mode);
  const { navigateTo } = useNavigation();

  const sortedEntries = useMemo(
    () => sortEntries(entries, sortConfig),
    [entries, sortConfig]
  );

  const visibleEntries = useMemo(
    () => (showHidden ? sortedEntries : sortedEntries.filter((e) => !e.isHidden)),
    [sortedEntries, showHidden]
  );

  const handleSelect = useCallback(
    (entry: FileEntry, e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(entry.path);
      } else {
        setSelectedPaths(new Set([entry.path]));
      }
    },
    [toggleSelection, setSelectedPaths]
  );

  const handleOpen = useCallback(
    (entry: FileEntry) => {
      if (onFileOpen) {
        onFileOpen(entry);
      } else if (entry.isDir) {
        navigateTo(entry.path);
      }
    },
    [onFileOpen, navigateTo]
  );

  const itemContent = useCallback(
    (_index: number, entry: FileEntry) => (
      <FileCard
        entry={entry}
        selected={selectedPaths.has(entry.path)}
        isCut={isCutPath(entry.path, clipboardPaths, clipboardMode)}
        onSelect={(e) => handleSelect(entry, e)}
        onOpen={() => handleOpen(entry)}
      />
    ),
    [selectedPaths, clipboardPaths, clipboardMode, handleSelect, handleOpen]
  );

  return (
    <div className="h-full relative" onContextMenu={onContextMenu}>
      <div className="absolute inset-0 overflow-hidden">
        <VirtuosoGrid
          data={visibleEntries}
          listClassName="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1 p-2"
          itemContent={itemContent}
        />
      </div>
    </div>
  );
}
