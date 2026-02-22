import { useEffect } from "react";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { useNavigation } from "./use-navigation";
import { copyItems, moveItems, getHomeDir } from "../commands/fs-commands";

interface ShortcutActions {
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSearch: () => void;
}

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
        if (paths.length > 0) useClipboardStore.getState().copy(paths);
        return;
      }
      // Ctrl+X: Cut
      if (ctrl && !shift && key === "x") {
        e.preventDefault();
        const paths = Array.from(selectedPaths);
        if (paths.length > 0) useClipboardStore.getState().cut(paths);
        return;
      }
      // Ctrl+V: Paste
      if (ctrl && !shift && key === "v") {
        e.preventDefault();
        const tab = useTabStore.getState().tabs.find(
          (t) => t.id === useTabStore.getState().activeTabId
        );
        if (!tab || clipboardPaths.length === 0) return;
        try {
          if (clipboardMode === "copy") {
            await copyItems(clipboardPaths, tab.path);
          } else if (clipboardMode === "cut") {
            await moveItems(clipboardPaths, tab.path);
            useClipboardStore.getState().clear();
          }
          refresh();
        } catch (err) {
          console.error("Paste failed:", err);
        }
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
