import type { Theme } from "../types";

const VAR_MAP: Record<string, string> = {
  bg: "--color-bg",
  bgCard: "--color-bg-card",
  bgHover: "--color-bg-hover",
  border: "--color-border",
  accent: "--color-accent",
  accentLight: "--color-accent-light",
  text: "--color-text",
  textDim: "--color-text-dim",
  textMuted: "--color-text-muted",
  bgDeep: "--color-bg-deep",
  bgTabBar: "--color-bg-tab-bar",
  selectionBg: "--color-selection-bg",
  selectionRing: "--color-selection-ring",
  dropTargetBg: "--color-drop-target-bg",
  dropTargetRing: "--color-drop-target-ring",
  danger: "--color-danger",
  dangerHover: "--color-danger-hover",
  sidebarActive: "--color-sidebar-active",
  sidebarActiveBg: "--color-sidebar-active-bg",
  pathText: "--color-path-text",
  dirName: "--color-dir-name",
  iconFolder: "--color-icon-folder",
  iconImage: "--color-icon-image",
  iconVideo: "--color-icon-video",
  iconAudio: "--color-icon-audio",
  iconCode: "--color-icon-code",
  iconJson: "--color-icon-json",
  iconArchive: "--color-icon-archive",
  iconText: "--color-icon-text",
  iconDefault: "--color-icon-default",
};

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const colors = theme.colors;
  for (const [key, cssVar] of Object.entries(VAR_MAP)) {
    root.style.setProperty(cssVar, colors[key as keyof typeof colors]);
  }
}
