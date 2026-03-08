import { useEffect } from "react";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { useNavigation } from "./use-navigation";
import { getHomeDir } from "../commands/fs-commands";
import {
  readClipboardFiles,
  writeClipboardFiles,
} from "../commands/clipboard-commands";
import { pasteWithConflictCheck, type PasteResult } from "../utils/paste-with-conflicts";

interface ShortcutActions {
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSearch: () => void;
  onFileOpen: (entry: FileEntry) => void;
  onConflict: (result: PasteResult) => void;
}

import type { FileEntry } from "../types";
import { sortEntries } from "../utils/sort";

export function useKeyboardShortcuts(actions: ShortcutActions) {
  const addTab = useTabStore((s) => s.addTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const selectAll = useFileStore((s) => s.selectAll);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleHidden = useUIStore((s) => s.toggleHidden);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const loadDirectory = useFileStore((s) => s.loadDirectory);
  const { back, forward, up, refresh } = useNavigation();

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      const key = e.key.toLowerCase();

      // テキスト入力中は無視
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // getState()で最新の状態を取得（stale closure対策）
      const selectedPaths = useFileStore.getState().selectedPaths;
      const { paths: clipboardPaths, mode: clipboardMode } = useClipboardStore.getState();

      // Ctrl+C: Copy
      if (ctrl && !shift && key === "c") {
        e.preventDefault();
        const paths = Array.from(selectedPaths);
        if (paths.length > 0) {
          useClipboardStore.getState().copy(paths);
          writeClipboardFiles(paths, "copy").catch(() => {});
        }
        return;
      }
      // Ctrl+X: Cut
      if (ctrl && !shift && key === "x") {
        e.preventDefault();
        const paths = Array.from(selectedPaths);
        if (paths.length > 0) {
          useClipboardStore.getState().cut(paths);
          writeClipboardFiles(paths, "cut").catch(() => {});
        }
        return;
      }
      // Ctrl+V: Paste
      if (ctrl && !shift && key === "v") {
        e.preventDefault();
        const tab = useTabStore.getState().tabs.find(
          (t) => t.id === useTabStore.getState().activeTabId
        );
        if (!tab) return;

        let pastePaths = clipboardPaths;
        let pasteMode = clipboardMode;
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
            destination: tab.path,
          });
          if (result) {
            actions.onConflict(result);
          } else {
            if (pasteMode === "cut") useClipboardStore.getState().clear();
            refresh();
          }
        } catch (err) {
          console.error("Paste failed:", err);
        }
        return;
      }
      // Arrow key navigation
      if (!ctrl && !alt && (key === "arrowdown" || key === "arrowup" || key === "home" || key === "end")) {
        e.preventDefault();
        const { entries, sortConfig, focusedIndex } = useFileStore.getState();
        const showHidden = useUIStore.getState().showHidden;
        const sorted = sortEntries(entries, sortConfig);
        const visible = showHidden ? sorted : sorted.filter((en) => !en.isHidden);
        if (visible.length === 0) return;

        let newIndex = focusedIndex;
        if (key === "arrowdown") {
          newIndex = focusedIndex < visible.length - 1 ? focusedIndex + 1 : focusedIndex;
        } else if (key === "arrowup") {
          newIndex = focusedIndex > 0 ? focusedIndex - 1 : 0;
        } else if (key === "home") {
          newIndex = 0;
        } else if (key === "end") {
          newIndex = visible.length - 1;
        }

        useFileStore.getState().setFocusedIndex(newIndex);
        const target = visible[newIndex];
        if (target) {
          if (shift) {
            // Shift: range from anchor to current (replace, not merge)
            const { lastSelectedPath } = useFileStore.getState();
            const anchorIdx = lastSelectedPath
              ? visible.findIndex((en) => en.path === lastSelectedPath)
              : 0;
            const [from, to] = anchorIdx <= newIndex ? [anchorIdx, newIndex] : [newIndex, anchorIdx];
            const range = visible.slice(from, to + 1).map((en) => en.path);
            // Set selection without changing anchor (lastSelectedPath)
            useFileStore.setState({ selectedPaths: new Set(range) });
          } else {
            useFileStore.getState().setSelectedPaths(new Set([target.path]));
          }
        }
        return;
      }
      // Enter: Open selected
      if (!ctrl && !alt && key === "enter") {
        e.preventDefault();
        const paths = Array.from(selectedPaths);
        if (paths.length !== 1) return;
        const { entries, sortConfig } = useFileStore.getState();
        const sorted = sortEntries(entries, sortConfig);
        const entry = sorted.find((en) => en.path === paths[0]);
        if (entry) actions.onFileOpen(entry);
        return;
      }
      // Escape: Clear selection
      if (key === "escape") {
        e.preventDefault();
        useFileStore.getState().clearSelection();
        useFileStore.getState().setFocusedIndex(-1);
        return;
      }
      // Backspace: Go to parent directory
      if (!ctrl && !alt && key === "backspace") {
        e.preventDefault();
        up();
        return;
      }
      // Delete
      if (key === "delete") {
        e.preventDefault();
        if (selectedPaths.size > 0) actions.onDelete();
        return;
      }
      // F2: Rename
      if (key === "f2") {
        e.preventDefault();
        if (selectedPaths.size === 1) actions.onRename();
        return;
      }
      // F5: Refresh
      if (key === "f5") {
        e.preventDefault();
        refresh();
        return;
      }
      // Ctrl+Shift+N: New folder
      if (ctrl && shift && key === "n") {
        e.preventDefault();
        actions.onNewFolder();
        return;
      }
      // Ctrl+A: Select all
      if (ctrl && !shift && key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }
      // Ctrl+F: Search
      if (ctrl && !shift && key === "f") {
        e.preventDefault();
        actions.onSearch();
        return;
      }
      // Ctrl+T: New tab
      if (ctrl && !shift && key === "t") {
        e.preventDefault();
        const home = await getHomeDir();
        addTab(home);
        loadDirectory(home);
        return;
      }
      // Ctrl+W: Close tab
      if (ctrl && !shift && key === "w") {
        e.preventDefault();
        const { tabs, activeTabId } = useTabStore.getState();
        if (tabs.length > 1) closeTab(activeTabId);
        return;
      }
      // Alt+Left: Back
      if (alt && key === "arrowleft") {
        e.preventDefault();
        back();
        return;
      }
      // Alt+Right: Forward
      if (alt && key === "arrowright") {
        e.preventDefault();
        forward();
        return;
      }
      // Alt+Up: Parent
      if (alt && key === "arrowup") {
        e.preventDefault();
        up();
        return;
      }
      // Ctrl+B: Toggle sidebar
      if (ctrl && !shift && key === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      // Ctrl+H: Toggle hidden
      if (ctrl && !shift && key === "h") {
        e.preventDefault();
        toggleHidden();
        return;
      }
      // Ctrl+1: List view
      if (ctrl && key === "1") {
        e.preventDefault();
        setViewMode("list");
        return;
      }
      // Ctrl+2: Grid view
      if (ctrl && key === "2") {
        e.preventDefault();
        setViewMode("grid");
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions, back, forward, up, refresh, addTab, closeTab, selectAll, toggleSidebar, toggleHidden, setViewMode, loadDirectory]);
}
