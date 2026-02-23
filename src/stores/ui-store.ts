import { create } from "zustand";
import type { ViewMode } from "../types";

interface UISettings {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  showHidden: boolean;
}

interface UIStore extends UISettings {
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleHidden: () => void;
}

const STORAGE_KEY = "tauri-filer-ui-settings";

export function loadSettings(): Partial<UISettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: UISettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const defaults: UISettings = {
  viewMode: "list",
  sidebarVisible: true,
  showHidden: false,
};

const initial: UISettings = { ...defaults, ...loadSettings() };

export const useUIStore = create<UIStore>((set, get) => ({
  ...initial,

  setViewMode: (mode) => {
    set({ viewMode: mode });
    const { viewMode, sidebarVisible, showHidden } = get();
    saveSettings({ viewMode, sidebarVisible, showHidden });
  },
  toggleSidebar: () => {
    set((s) => ({ sidebarVisible: !s.sidebarVisible }));
    const { viewMode, sidebarVisible, showHidden } = get();
    saveSettings({ viewMode, sidebarVisible, showHidden });
  },
  toggleHidden: () => {
    set((s) => ({ showHidden: !s.showHidden }));
    const { viewMode, sidebarVisible, showHidden } = get();
    saveSettings({ viewMode, sidebarVisible, showHidden });
  },
}));
