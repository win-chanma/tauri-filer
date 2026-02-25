// Theme: Solarized Light
// Author: Ethan Schoonover
// Source: https://github.com/altercation/solarized
// License: MIT

import type { Theme } from "../types";

export const solarizedLightTheme: Theme = {
  id: "solarized-light",
  name: "Solarized Light",
  nameJa: "Solarized Light",
  isDark: false,
  colors: {
    bg: "#fdf6e3",
    bgCard: "#eee8d5",
    bgHover: "#e0dbc5",
    border: "#93a1a1",
    accent: "#268bd2",
    accentLight: "#2aa198",
    text: "#073642",
    textDim: "#586e75",
    textMuted: "#93a1a1",
    bgDeep: "#eee8d5",
    bgTabBar: "#eee8d5",
    selectionBg: "rgba(38,139,210,0.15)",
    selectionRing: "rgba(38,139,210,0.4)",
    dropTargetBg: "rgba(38,139,210,0.2)",
    dropTargetRing: "#268bd2",
    danger: "#dc322f",
    dangerHover: "#cb4b16",
    sidebarActive: "#268bd2",
    sidebarActiveBg: "rgba(38,139,210,0.1)",
    pathText: "#2aa198",
    dirName: "#073642",
    iconFolder: "#268bd2",
    iconImage: "#859900",
    iconVideo: "#d33682",
    iconAudio: "#b58900",
    iconCode: "#2aa198",
    iconJson: "#b58900",
    iconArchive: "#cb4b16",
    iconText: "#586e75",
    iconDefault: "#93a1a1",
  },
  preview: ["#fdf6e3", "#268bd2", "#073642"],
};
