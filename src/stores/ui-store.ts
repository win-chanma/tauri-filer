import { create } from "zustand";
import i18n from "i18next";
import type { ViewMode, Language } from "../types";

interface UISettings {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  showHidden: boolean;
  language: Language;
}

interface UIStore extends UISettings {
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleHidden: () => void;
  setLanguage: (lang: Language) => void;
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
  language: "ja",
};

const initial: UISettings = { ...defaults, ...loadSettings() };

function getSettings(state: UIStore): UISettings {
  return {
    viewMode: state.viewMode,
    sidebarVisible: state.sidebarVisible,
    showHidden: state.showHidden,
    language: state.language,
  };
}

export const useUIStore = create<UIStore>((set, get) => ({
  ...initial,

  setViewMode: (mode) => {
    set({ viewMode: mode });
    saveSettings(getSettings(get()));
  },
  toggleSidebar: () => {
    set((s) => ({ sidebarVisible: !s.sidebarVisible }));
    saveSettings(getSettings(get()));
  },
  toggleHidden: () => {
    set((s) => ({ showHidden: !s.showHidden }));
    saveSettings(getSettings(get()));
  },
  setLanguage: (lang) => {
    set({ language: lang });
    saveSettings(getSettings(get()));
    if (i18n.isInitialized) {
      i18n.changeLanguage(lang);
    }
  },
}));
