// Theme: Kanagawa
// Author: rebelot
// Source: https://github.com/rebelot/kanagawa.nvim
// License: MIT

import type { Theme } from "../types";

export const kanagawaTheme: Theme = {
  id: "kanagawa",
  name: "Kanagawa",
  nameJa: "Kanagawa",
  isDark: true,
  colors: {
    bg: "#1f1f28",
    bgCard: "#2a2a37",
    bgHover: "#363646",
    border: "#54546d",
    accent: "#7e9cd8",
    accentLight: "#7fb4ca",
    text: "#dcd7ba",
    textDim: "#c8c093",
    textMuted: "#727169",
    bgDeep: "#16161d",
    bgTabBar: "#2a2a37",
    selectionBg: "rgba(126,156,216,0.15)",
    selectionRing: "rgba(126,156,216,0.4)",
    dropTargetBg: "rgba(126,156,216,0.25)",
    dropTargetRing: "#7e9cd8",
    danger: "#e82424",
    dangerHover: "#ff5d62",
    sidebarActive: "#7e9cd8",
    sidebarActiveBg: "rgba(126,156,216,0.1)",
    pathText: "#6a9589",
    dirName: "#957fb8",
    iconFolder: "#7e9cd8",
    iconImage: "#98bb6c",
    iconVideo: "#ff5d62",
    iconAudio: "#e6c384",
    iconCode: "#7fb4ca",
    iconJson: "#e6c384",
    iconArchive: "#ffa066",
    iconText: "#c8c093",
    iconDefault: "#727169",
  },
  preview: ["#1f1f28", "#7e9cd8", "#dcd7ba"],
};
