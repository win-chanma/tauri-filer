import type { FileEntry } from "../types";

export interface ContextMenuDeps {
  getActiveTabPath: () => string | null;
  getSelectedEntry: () => FileEntry | null;
  getSelectedPaths: () => string[];
  navigateTo: (path: string) => void;
  openFile: (path: string) => Promise<void>;
  createDirectory: (path: string, name: string) => Promise<string>;
  renameItem: (path: string, newName: string) => Promise<string>;
  deleteItems: (paths: string[]) => Promise<void>;
  copyItems: (sources: string[], destination: string) => Promise<void>;
  moveItems: (sources: string[], destination: string) => Promise<void>;
  clipboardPaths: string[];
  clipboardMode: "copy" | "cut" | null;
  clipboardClear: () => void;
  clearSelection: () => void;
  refresh: () => void;
}

export function createContextMenuHandlers(deps: ContextMenuDeps) {
  const handleFileOpen = async (entry: FileEntry) => {
    if (entry.isDir) {
      deps.navigateTo(entry.path);
    } else {
      try {
        await deps.openFile(entry.path);
      } catch (err) {
        console.error("Open file failed:", err);
      }
    }
  };

  const handlePaste = async () => {
    const tabPath = deps.getActiveTabPath();
    if (!tabPath || deps.clipboardPaths.length === 0) return;
    try {
      if (deps.clipboardMode === "copy") {
        await deps.copyItems(deps.clipboardPaths, tabPath);
      } else if (deps.clipboardMode === "cut") {
        await deps.moveItems(deps.clipboardPaths, tabPath);
        deps.clipboardClear();
      }
      deps.refresh();
    } catch (err) {
      console.error("Paste failed:", err);
    }
  };

  const handleCreateFolder = async (name: string) => {
    const tabPath = deps.getActiveTabPath();
    if (!tabPath) return;
    try {
      await deps.createDirectory(tabPath, name);
      deps.refresh();
    } catch (err) {
      console.error("Create folder failed:", err);
    }
  };

  const handleRename = async (newName: string) => {
    const entry = deps.getSelectedEntry();
    if (!entry) return;
    try {
      await deps.renameItem(entry.path, newName);
      deps.clearSelection();
      deps.refresh();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleDelete = async () => {
    const paths = deps.getSelectedPaths();
    if (paths.length === 0) return;
    try {
      await deps.deleteItems(paths);
      deps.clearSelection();
      deps.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return { handleFileOpen, handlePaste, handleCreateFolder, handleRename, handleDelete };
}
