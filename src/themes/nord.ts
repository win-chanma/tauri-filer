// Theme: Nord
// Author: Sven Greb (Arctic Ice Studio)
// Source: https://github.com/nordtheme/nord
// License: MIT

import type { Theme } from "../types";

export const nordTheme: Theme = {
  id: "nord",
  name: "Nord",
  nameJa: "Nord",
  isDark: true,
  colors: {
    bg: "#2e3440",
    bgCard: "#3b4252",
    bgHover: "#434c5e",
    border: "#4c566a",
    accent: "#88c0d0",
    accentLight: "#8fbcbb",
    text: "#eceff4",
    textDim: "#d8dee9",
    textMuted: "#7b88a1",
    bgDeep: "#272c36",
    bgTabBar: "#3b4252",
    selectionBg: "rgba(136,192,208,0.2)",
    selectionRing: "rgba(136,192,208,0.5)",
    dropTargetBg: "rgba(136,192,208,0.3)",
    dropTargetRing: "#88c0d0",
    danger: "#bf616a",
    dangerHover: "#d08770",
    sidebarActive: "#88c0d0",
    sidebarActiveBg: "rgba(136,192,208,0.1)",
    pathText: "#8fbcbb",
    dirName: "#81a1c1",
    iconFolder: "#5e81ac",
    iconImage: "#a3be8c",
    iconVideo: "#bf616a",
    iconAudio: "#ebcb8b",
    iconCode: "#88c0d0",
    iconJson: "#ebcb8b",
    iconArchive: "#d08770",
    iconText: "#d8dee9",
    iconDefault: "#7b88a1",
  },
  preview: ["#2e3440", "#88c0d0", "#eceff4"],
};
