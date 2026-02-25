import { useEffect, useState, useCallback } from "react";
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

  const handleCreateFolder = async (name: string) => {
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (!tab) return;
    try {
      await createDirectory(tab.path, name);
      refresh();
    } catch (err) {
      console.error("Create folder failed:", err);
    }
  };

  const handleRename = async (newName: string) => {
    const entry = getSelectedEntry();
    if (!entry) return;
    try {
      await renameItem(entry.path, newName);
      clearSelection();
      refresh();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleDelete = async () => {
    const paths = Array.from(selectedPaths);
    if (paths.length === 0) return;
    try {
      await deleteItems(paths);
      clearSelection();
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handlePaste = async () => {
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (!tab || clipboardPaths.length === 0) return;
    try {
      if (clipboardMode === "copy") {
        await copyItems(clipboardPaths, tab.path);
      } else if (clipboardMode === "cut") {
        await moveItems(clipboardPaths, tab.path);
        clipboardClear();
      }
      refresh();
    } catch (err) {
      console.error("Paste failed:", err);
    }
  };

  const handleFileOpen = useCallback(
    (entry: FileEntry) => {
      if (entry.isDir) {
        navigateTo(entry.path);
      } else {
        openFile(entry.path).catch(console.error);
      }
    },
    [navigateTo]
  );

  const selectedEntry = getSelectedEntry();
  const hasSelection = selectedPaths.size > 0;
  const hasClipboard = clipboardPaths.length > 0;

  const contextMenuItems = [
    ...(hasSelection
      ? [
          {
            label: t("context.open"),
            onClick: () => {
              const entry = getSelectedEntry();
              if (entry) handleFileOpen(entry);
            },
          },
        ]
      : []),
    ...(selectedEntry && !selectedEntry.isDir
      ? [
          {
            label: t("context.preview"),
            onClick: () => setPreviewEntry(selectedEntry),
          },
        ]
      : []),
    ...(hasSelection
      ? [
          { label: t("context.copy"), shortcut: "Ctrl+C", onClick: () => clipboardCopy(Array.from(selectedPaths)) },
          { label: t("context.cut"), shortcut: "Ctrl+X", onClick: () => clipboardCut(Array.from(selectedPaths)) },
        ]
      : []),
    ...(hasClipboard
      ? [{ label: t("context.paste"), shortcut: "Ctrl+V", onClick: handlePaste }]
      : []),
    { separator: true, label: "", onClick: () => {} },
    { label: t("context.newFolder"), shortcut: "Ctrl+Shift+N", onClick: () => setNewFolderOpen(true) },
    ...(selectedPaths.size === 1
      ? [{ label: t("context.rename"), shortcut: "F2", onClick: () => setRenameOpen(true) }]
      : []),
    ...(hasSelection
      ? [
          { separator: true, label: "", onClick: () => {} },
          {
            label: t("context.delete"),
            shortcut: "Del",
            danger: true,
            onClick: () => setDeleteOpen(true),
          },
        ]
      : []),
  ];

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
