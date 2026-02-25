// Theme: Gruvbox Light
// Author: Pavel Pertsev (morhetz)
// Source: https://github.com/morhetz/gruvbox
// License: MIT

import type { Theme } from "../types";

export const gruvboxLightTheme: Theme = {
  id: "gruvbox-light",
  name: "Gruvbox Light",
  nameJa: "Gruvbox Light",
  isDark: false,
  colors: {
    bg: "#fbf1c7",
    bgCard: "#f2e5bc",
    bgHover: "#ebdbb2",
    border: "#d5c4a1",
    accent: "#458588",
    accentLight: "#076678",
    text: "#3c3836",
    textDim: "#504945",
    textMuted: "#928374",
    bgDeep: "#f2e5bc",
    bgTabBar: "#f2e5bc",
    selectionBg: "rgba(69,133,136,0.15)",
    selectionRing: "rgba(69,133,136,0.4)",
    dropTargetBg: "rgba(69,133,136,0.2)",
    dropTargetRing: "#458588",
    danger: "#cc241d",
    dangerHover: "#9d0006",
    sidebarActive: "#076678",
    sidebarActiveBg: "rgba(7,102,120,0.1)",
    pathText: "#427b58",
    dirName: "#8f3f71",
    iconFolder: "#076678",
    iconImage: "#79740e",
    iconVideo: "#9d0006",
    iconAudio: "#b57614",
    iconCode: "#427b58",
    iconJson: "#b57614",
    iconArchive: "#af3a03",
    iconText: "#504945",
    iconDefault: "#928374",
  },
  preview: ["#fbf1c7", "#458588", "#3c3836"],
};
