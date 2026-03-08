import type { FileEntry } from "../types";
import { readClipboardFiles } from "../commands/clipboard-commands";
import { pasteWithConflictCheck, type PasteResult } from "./paste-with-conflicts";

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
  onConflict?: (result: PasteResult) => void;
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
    if (!tabPath) return;

    let pastePaths = deps.clipboardPaths;
    let pasteMode = deps.clipboardMode;
    try {
      const osClip = await readClipboardFiles();
      if (osClip.paths.length > 0) {
        pastePaths = osClip.paths;
        pasteMode = osClip.mode;
      }
    } catch {
      // OS clipboard unavailable, use internal
    }

    if (pastePaths.length === 0) return;
    try {
      const result = await pasteWithConflictCheck({
        paths: pastePaths,
        mode: pasteMode,
        destination: tabPath,
      });
      if (result) {
        deps.onConflict?.(result);
      } else {
        if (pasteMode === "cut") deps.clipboardClear();
        deps.refresh();
      }
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
