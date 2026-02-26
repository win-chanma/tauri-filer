import { create } from "zustand";
import type { TabState } from "../types";
import { getParentPath, getPathLabel, isRootPath } from "../utils/path";

let nextTabId = 1;

function createTab(path: string): TabState {
  const label = getPathLabel(path);
  return {
    id: String(nextTabId++),
    path,
    label,
    history: [path],
    historyIndex: 0,
  };
}

interface TabStore {
  tabs: TabState[];
  activeTabId: string;

  addTab: (path: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  goUp: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  canGoUp: () => boolean;
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: "",

  addTab: (path) => {
    const tab = createTab(path);
    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1) return;

    const idx = tabs.findIndex((t) => t.id === id);
    const newTabs = tabs.filter((t) => t.id !== id);
    let newActiveId = activeTabId;

    if (activeTabId === id) {
      const newIdx = Math.min(idx, newTabs.length - 1);
      newActiveId = newTabs[newIdx].id;
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  navigate: (path) => {
    set((s) => ({
      tabs: s.tabs.map((tab) => {
        if (tab.id !== s.activeTabId) return tab;
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(path);
        const label = getPathLabel(path);
        return {
          ...tab,
          path,
          label,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),
    }));
  },

  goBack: () => {
    set((s) => ({
      tabs: s.tabs.map((tab) => {
        if (tab.id !== s.activeTabId) return tab;
        if (tab.historyIndex <= 0) return tab;
        const newIndex = tab.historyIndex - 1;
        const path = tab.history[newIndex];
        const label = getPathLabel(path);
        return { ...tab, path, label, historyIndex: newIndex };
      }),
    }));
  },

  goForward: () => {
    set((s) => ({
      tabs: s.tabs.map((tab) => {
        if (tab.id !== s.activeTabId) return tab;
        if (tab.historyIndex >= tab.history.length - 1) return tab;
        const newIndex = tab.historyIndex + 1;
        const path = tab.history[newIndex];
        const label = getPathLabel(path);
        return { ...tab, path, label, historyIndex: newIndex };
      }),
    }));
  },

  goUp: () => {
    const { tabs, activeTabId, navigate } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    const parent = getParentPath(tab.path);
    if (parent === null) return;
    navigate(parent);
  },

  canGoBack: () => {
    const { tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    return !!tab && tab.historyIndex > 0;
  },

  canGoForward: () => {
    const { tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    return !!tab && tab.historyIndex < tab.history.length - 1;
  },

  canGoUp: () => {
    const { tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    return !!tab && !isRootPath(tab.path);
  },
}));
