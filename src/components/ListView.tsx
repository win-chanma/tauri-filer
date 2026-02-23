import { useMemo, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { useTabStore } from "../stores/tab-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { useDragDrop } from "../hooks/use-drag-drop";
import { useNavigation } from "../hooks/use-navigation";
import { sortEntries } from "../utils/sort";
import { isCutPath } from "../utils/clipboard-helpers";
import { FileRow } from "./FileRow";
import type { FileEntry, SortKey } from "../types";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ListViewProps {
  onContextMenu?: (e: React.MouseEvent) => void;
  onFileOpen?: (entry: FileEntry) => void;
}

function SortIcon({ sortKey, activeKey, order }: { sortKey: SortKey; activeKey: SortKey; order: "asc" | "desc" }) {
  if (sortKey !== activeKey) return null;
  return order === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

export function ListView({ onContextMenu, onFileOpen }: ListViewProps) {
  const entries = useFileStore((s) => s.entries);
  const sortConfig = useFileStore((s) => s.sortConfig);
  const showHidden = useUIStore((s) => s.showHidden);
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const setSelectedPaths = useFileStore((s) => s.setSelectedPaths);
  const toggleSelection = useFileStore((s) => s.toggleSelection);
  const selectRange = useFileStore((s) => s.selectRange);
  const setSortConfig = useFileStore((s) => s.setSortConfig);
  const loadDirectory = useFileStore((s) => s.loadDirectory);
  const { navigateTo } = useNavigation();
  const clipboardPaths = useClipboardStore((s) => s.paths);
  const clipboardMode = useClipboardStore((s) => s.mode);
  const { handleDragStart, handleDragOver, handleDrop } = useDragDrop();

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
      } else if (e.shiftKey) {
        selectRange(visibleEntries, entry.path);
      } else {
        setSelectedPaths(new Set([entry.path]));
      }
    },
    [toggleSelection, selectRange, setSelectedPaths, visibleEntries]
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

  const handleSortClick = useCallback(
    (key: SortKey) => {
      const current = useFileStore.getState().sortConfig;
      if (current.key === key) {
        setSortConfig({ key, order: current.order === "asc" ? "desc" : "asc" });
      } else {
        setSortConfig({ key, order: "asc" });
      }
    },
    [setSortConfig]
  );

  const itemContent = useCallback(
    (_index: number, entry: FileEntry) => (
      <FileRow
        entry={entry}
        selected={selectedPaths.has(entry.path)}
        isCut={isCutPath(entry.path, clipboardPaths, clipboardMode)}
        onSelect={(e) => handleSelect(entry, e)}
        onOpen={() => handleOpen(entry)}
        onContextMenu={onContextMenu}
        onDragStart={(e) => handleDragStart(e, entry.path)}
        onDragOver={handleDragOver}
        onDrop={(e) => {
          handleDrop(e, entry.path).then(() => {
            const tab = useTabStore.getState().tabs.find(
              (t) => t.id === useTabStore.getState().activeTabId
            );
            if (tab) loadDirectory(tab.path);
          });
        }}
      />
    ),
    [selectedPaths, clipboardPaths, clipboardMode, handleSelect, handleOpen, onContextMenu, handleDragStart, handleDragOver, handleDrop, loadDirectory]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-[1fr_80px_140px] px-3 py-1.5 text-xs text-slate-500 border-b border-[#2a2a3a] select-none">
        <button
          className="flex items-center gap-1 hover:text-slate-300 text-left"
          onClick={() => handleSortClick("name")}
        >
          Name <SortIcon sortKey="name" activeKey={sortConfig.key} order={sortConfig.order} />
        </button>
        <button
          className="flex items-center gap-1 justify-end hover:text-slate-300"
          onClick={() => handleSortClick("size")}
        >
          Size <SortIcon sortKey="size" activeKey={sortConfig.key} order={sortConfig.order} />
        </button>
        <button
          className="flex items-center gap-1 justify-end hover:text-slate-300"
          onClick={() => handleSortClick("modified")}
        >
          Modified <SortIcon sortKey="modified" activeKey={sortConfig.key} order={sortConfig.order} />
        </button>
      </div>

      <div className="flex-1 relative" onContextMenu={onContextMenu}>
        <div className="absolute inset-0 overflow-hidden">
          <Virtuoso
            data={visibleEntries}
            itemContent={itemContent}
          />
        </div>
      </div>
    </div>
  );
}
