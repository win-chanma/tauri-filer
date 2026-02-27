import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { useContextMenu } from "../hooks/use-context-menu";
import { useNavigation } from "../hooks/use-navigation";
import {
  getHomeDir,
  createDirectory,
  renameItem,
  deleteItems,
  copyItems,
  moveItems,
  openFile,
} from "../commands/fs-commands";
import { buildContextMenuItems } from "../utils/context-menu-items";
import { createContextMenuHandlers } from "../utils/context-menu-handlers";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { useMouseNavigation } from "../hooks/use-mouse-navigation";
import { TabBar } from "./TabBar";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { ListView } from "./ListView";
import { GridView } from "./GridView";
import { StatusBar } from "./StatusBar";
import { ContextMenu } from "./ContextMenu";
import { NewFolderDialog } from "./NewFolderDialog";
import { RenameDialog } from "./RenameDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { SearchDialog } from "./SearchDialog";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { EmptyState } from "./EmptyState";
import { Spinner } from "./Spinner";
import type { FileEntry } from "../types";

const TerminalPane = lazy(() => import("./TerminalPane").then((m) => ({ default: m.TerminalPane })));
const SettingsDialog = lazy(() => import("./SettingsDialog").then((m) => ({ default: m.SettingsDialog })));

export function AppLayout() {
  const { t } = useTranslation();
  const tabs = useTabStore((s) => s.tabs);
  const addTab = useTabStore((s) => s.addTab);
  const loadDirectory = useFileStore((s) => s.loadDirectory);
  const loading = useFileStore((s) => s.loading);
  const error = useFileStore((s) => s.error);
  const entries = useFileStore((s) => s.entries);
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const clearSelection = useFileStore((s) => s.clearSelection);
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const viewMode = useUIStore((s) => s.viewMode);
  const terminalVisible = useUIStore((s) => s.terminalVisible);
  const clipboardCopy = useClipboardStore((s) => s.copy);
  const clipboardCut = useClipboardStore((s) => s.cut);
  const clipboardPaths = useClipboardStore((s) => s.paths);
  const clipboardMode = useClipboardStore((s) => s.mode);
  const clipboardClear = useClipboardStore((s) => s.clear);

  const { navigateTo, refresh } = useNavigation();

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<FileEntry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(400);
  const isDraggingRef = useRef(false);

  const { menu, show: showContextMenu, hide: hideContextMenu } = useContextMenu();

  const getSelectedEntry = useCallback(() => {
    const paths = Array.from(selectedPaths);
    if (paths.length !== 1) return null;
    return entries.find((e) => e.path === paths[0]) || null;
  }, [selectedPaths, entries]);

  useKeyboardShortcuts({
    onNewFolder: () => setNewFolderOpen(true),
    onRename: () => setRenameOpen(true),
    onDelete: () => setDeleteOpen(true),
    onSearch: () => setSearchOpen(true),
  });

  useMouseNavigation();

  // アクティブタブのパスを取得（ターミナルの cwd に使用）
  const activeTabPath = useTabStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeTabId);
    return tab?.path ?? null;
  });

  // ターミナルペインのドラッグリサイズ
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const startX = e.clientX;
      const startWidth = terminalWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const delta = startX - ev.clientX;
        const maxWidth = Math.floor(window.innerWidth * 0.5);
        const newWidth = Math.max(200, Math.min(maxWidth, startWidth + delta));
        setTerminalWidth(newWidth);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [terminalWidth]
  );

  useEffect(() => {
    if (tabs.length === 0) {
      getHomeDir()
        .then((home) => {
          addTab(home);
          return loadDirectory(home);
        })
        .catch((err) => {
          console.error("Init failed:", err);
          addTab("/");
          loadDirectory("/").catch(console.error);
        });
    }
  }, []);

  const { handleFileOpen, handlePaste, handleCreateFolder, handleRename, handleDelete } =
    createContextMenuHandlers({
      getActiveTabPath: () => {
        const tab = useTabStore.getState().tabs.find(
          (t) => t.id === useTabStore.getState().activeTabId
        );
        return tab?.path ?? null;
      },
      getSelectedEntry,
      getSelectedPaths: () => Array.from(selectedPaths),
      navigateTo,
      openFile,
      createDirectory,
      renameItem,
      deleteItems,
      copyItems,
      moveItems,
      clipboardPaths,
      clipboardMode,
      clipboardClear,
      clearSelection,
      refresh,
    });

  const selectedEntry = getSelectedEntry();
  const hasSelection = selectedPaths.size > 0;
  const hasClipboard = clipboardPaths.length > 0;

  const contextMenuItems = buildContextMenuItems({
    t,
    hasSelection,
    selectedEntry,
    selectedCount: selectedPaths.size,
    hasClipboard,
    onOpen: () => {
      const entry = getSelectedEntry();
      if (entry) handleFileOpen(entry);
    },
    onPreview: () => setPreviewEntry(selectedEntry),
    onCopy: () => clipboardCopy(Array.from(selectedPaths)),
    onCut: () => clipboardCut(Array.from(selectedPaths)),
    onPaste: handlePaste,
    onNewFolder: () => setNewFolderOpen(true),
    onRename: () => setRenameOpen(true),
    onDelete: () => setDeleteOpen(true),
  });

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <TabBar />
      <Toolbar onSettingsOpen={() => setSettingsOpen(true)} />
      <div className="flex flex-1 min-h-0">
        {sidebarVisible && <Sidebar />}
        <main className="flex-1 min-w-0 flex flex-col">
          {loading && <Spinner />}
          {error && (
            <div className="flex items-center justify-center py-8 text-[var(--color-danger-hover)] text-sm">
              {error}
            </div>
          )}
          {!loading && !error && entries.length === 0 && <EmptyState />}
          {!loading && !error && entries.length > 0 && (
            viewMode === "list"
              ? <ListView onContextMenu={showContextMenu} onFileOpen={handleFileOpen} />
              : <GridView onContextMenu={showContextMenu} onFileOpen={handleFileOpen} />
          )}
        </main>
        {terminalVisible && (
          <div
            className="flex shrink-0"
            style={{ width: terminalWidth }}
          >
            {/* ドラッグリサイザー */}
            <div
              className="w-1 cursor-col-resize bg-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors shrink-0"
              onMouseDown={handleResizeMouseDown}
            />
            {/* ターミナル本体 */}
            <div className="flex-1 min-w-0">
              <Suspense fallback={null}>
                <TerminalPane cwd={activeTabPath ?? "/"} width={terminalWidth} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
      <StatusBar />

      <ContextMenu
        x={menu.x}
        y={menu.y}
        visible={menu.visible}
        onClose={hideContextMenu}
        items={contextMenuItems}
      />
      <NewFolderDialog
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onCreate={handleCreateFolder}
      />
      <RenameDialog
        open={renameOpen}
        currentName={selectedEntry?.name || ""}
        onClose={() => setRenameOpen(false)}
        onRename={handleRename}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        count={selectedPaths.size}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <FilePreviewDialog
        open={!!previewEntry}
        entry={previewEntry}
        onClose={() => setPreviewEntry(null)}
      />
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
