import { create } from "zustand";
import i18n from "i18next";
import type { ViewMode, Language, ThemeId } from "../types";
import { getTheme } from "../themes";
import { applyTheme } from "../themes/apply-theme";

interface UISettings {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  showHidden: boolean;
  language: Language;
  themeId: ThemeId;
  terminalVisible: boolean;
  terminalShellPath: string;
  terminalFontSize: number;
  terminalPadding: number;
  windowTransparency: boolean;
  windowOpacity: number;
}

interface UIStore extends UISettings {
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleHidden: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (themeId: ThemeId) => void;
  toggleTerminal: () => void;
  setTerminalShellPath: (path: string) => void;
  setTerminalFontSize: (size: number) => void;
  setTerminalPadding: (padding: number) => void;
  setWindowTransparency: (enabled: boolean) => void;
  setWindowOpacity: (opacity: number) => void;
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
  themeId: "default",
  terminalVisible: false,
  terminalShellPath: "",
  terminalFontSize: 14,
  terminalPadding: 8,
  windowTransparency: false,
  windowOpacity: 80,
};

const initial: UISettings = { ...defaults, ...loadSettings() };

function getSettings(state: UIStore): UISettings {
  return {
    viewMode: state.viewMode,
    sidebarVisible: state.sidebarVisible,
    showHidden: state.showHidden,
    language: state.language,
    themeId: state.themeId,
    terminalVisible: state.terminalVisible,
    terminalShellPath: state.terminalShellPath,
    terminalFontSize: state.terminalFontSize,
    terminalPadding: state.terminalPadding,
    windowTransparency: state.windowTransparency,
    windowOpacity: state.windowOpacity,
  };
}

// Apply theme immediately on module load to prevent FOUC
applyTheme(
  getTheme(initial.themeId),
  initial.windowTransparency ? initial.windowOpacity / 100 : undefined,
);

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
  setTheme: (themeId) => {
    set({ themeId });
    saveSettings(getSettings(get()));
    const s = get();
    applyTheme(
      getTheme(themeId),
      s.windowTransparency ? s.windowOpacity / 100 : undefined,
    );
  },
  toggleTerminal: () => {
    set((s) => ({ terminalVisible: !s.terminalVisible }));
    saveSettings(getSettings(get()));
  },
  setTerminalShellPath: (path) => {
    set({ terminalShellPath: path });
    saveSettings(getSettings(get()));
  },
  setTerminalFontSize: (size) => {
    set({ terminalFontSize: size });
    saveSettings(getSettings(get()));
  },
  setTerminalPadding: (padding) => {
    set({ terminalPadding: padding });
    saveSettings(getSettings(get()));
  },
  setWindowTransparency: (enabled) => {
    set({ windowTransparency: enabled });
    saveSettings(getSettings(get()));
    const s = get();
    applyTheme(
      getTheme(s.themeId),
      enabled ? s.windowOpacity / 100 : undefined,
    );
  },
  setWindowOpacity: (opacity) => {
    set({ windowOpacity: opacity });
    saveSettings(getSettings(get()));
    const s = get();
    applyTheme(
      getTheme(s.themeId),
      s.windowTransparency ? opacity / 100 : undefined,
    );
  },
}));
