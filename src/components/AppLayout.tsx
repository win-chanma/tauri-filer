import { useEffect, useState, useCallback, useMemo } from "react";
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
import { SettingsDialog } from "./SettingsDialog";
import { EmptyState } from "./EmptyState";
import { Spinner } from "./Spinner";
import type { FileEntry } from "../types";

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

  const getActiveTabPath = useCallback(() => {
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    return tab?.path ?? null;
  }, []);

  const getSelectedPaths = useCallback(
    () => Array.from(selectedPaths),
    [selectedPaths]
  );

  const handlers = useMemo(
    () =>
      createContextMenuHandlers({
        getActiveTabPath,
        getSelectedEntry,
        getSelectedPaths,
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
      }),
    [
      getActiveTabPath,
      getSelectedEntry,
      getSelectedPaths,
      navigateTo,
      clipboardPaths,
      clipboardMode,
      clipboardClear,
      clearSelection,
      refresh,
    ]
  );

  const { handleFileOpen, handlePaste, handleCreateFolder, handleRename, handleDelete } = handlers;

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
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
