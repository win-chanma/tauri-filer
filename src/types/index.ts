export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  isSymlink: boolean;
  isHidden: boolean;
  size: number;
  modified: string | null;
  mimeType: string | null;
}

export type SortKey = "name" | "size" | "modified";
export type SortOrder = "asc" | "desc";
export type ViewMode = "list" | "grid";
export type Language = "ja" | "en";

export interface TabState {
  id: string;
  path: string;
  label: string;
  history: string[];
  historyIndex: number;
}

export interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

export type ThemeId =
  | "default"
  | "dracula"
  | "catppuccin-mocha"
  | "catppuccin-latte"
  | "catppuccin-frappe"
  | "catppuccin-macchiato"
  | "nord"
  | "solarized-dark"
  | "solarized-light"
  | "one-dark"
  | "atom-one-light"
  | "tokyo-night"
  | "gruvbox-dark"
  | "gruvbox-light"
  | "github-dark"
  | "github-light"
  | "rose-pine"
  | "rose-pine-moon"
  | "rose-pine-dawn"
  | "everforest"
  | "kanagawa"
  | "ayu-dark"
  | "ayu-light"
  | "ayu-mirage"
  | "palenight"
  | "synthwave-84"
  | "horizon";

export interface ThemeColors {
  // Base
  bg: string;
  bgCard: string;
  bgHover: string;
  border: string;
  accent: string;
  accentLight: string;
  text: string;
  textDim: string;
  textMuted: string;
  // Surface
  bgDeep: string;
  bgTabBar: string;
  // Selection
  selectionBg: string;
  selectionRing: string;
  dropTargetBg: string;
  dropTargetRing: string;
  // Semantic
  danger: string;
  dangerHover: string;
  // Sidebar
  sidebarActive: string;
  sidebarActiveBg: string;
  // File-specific
  pathText: string;
  dirName: string;
  // Icons
  iconFolder: string;
  iconImage: string;
  iconVideo: string;
  iconAudio: string;
  iconCode: string;
  iconJson: string;
  iconArchive: string;
  iconText: string;
  iconDefault: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  nameJa: string;
  isDark: boolean;
  colors: ThemeColors;
  preview: [string, string, string];
}
