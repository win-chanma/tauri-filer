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

const BG_KEYS = new Set(["bg", "bgCard", "bgHover", "bgDeep", "bgTabBar"]);

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function relativeBgOverlay(
  base: string,
  target: string,
): string {
  const [br, bg, bb] = parseHex(base);
  const [tr, tg, tb] = parseHex(target);
  const dr = tr - br;
  const dg = tg - bg;
  const db = tb - bb;
  const avg = (dr + dg + db) / 3;
  if (avg >= 0) {
    // target が base より明るい → 白の薄い overlay
    const a = Math.min(Math.round(Math.abs(avg) / 255 * 100) / 100, 0.15);
    return `rgba(255, 255, 255, ${Math.max(a, 0.02)})`;
  } else {
    // target が base より暗い → 黒の薄い overlay
    const a = Math.min(Math.round(Math.abs(avg) / 255 * 100) / 100, 0.15);
    return `rgba(0, 0, 0, ${Math.max(a, 0.02)})`;
  }
}

export function applyTheme(theme: Theme, opacity?: number): void {
  const root = document.documentElement;
  const colors = theme.colors;
  const baseBg = colors.bg;

  for (const [key, cssVar] of Object.entries(VAR_MAP)) {
    const value = colors[key as keyof typeof colors];

    if (opacity !== undefined && BG_KEYS.has(key) && value.startsWith("#")) {
      // 常に solid 版を保持
      root.style.setProperty(`${cssVar}-solid`, value);

      if (key === "bg") {
        // ルート背景のみ本体の rgba 不透明度を持つ
        root.style.setProperty(cssVar, hexToRgba(value, opacity));
      } else if (key === "bgHover") {
        // hover は白の薄い overlay
        root.style.setProperty(cssVar, "rgba(255, 255, 255, 0.08)");
      } else {
        // 内側コンポーネントは、ルートからの相対差分を薄い overlay で表現
        root.style.setProperty(cssVar, relativeBgOverlay(baseBg, value));
      }
    } else {
      root.style.setProperty(cssVar, value);
      if (BG_KEYS.has(key)) {
        root.style.setProperty(`${cssVar}-solid`, value);
      }
    }
  }
}
