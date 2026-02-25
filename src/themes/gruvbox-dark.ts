// Theme: Gruvbox Dark
// Author: Pavel Pertsev (morhetz)
// Source: https://github.com/morhetz/gruvbox
// License: MIT

import type { Theme } from "../types";

export const gruvboxDarkTheme: Theme = {
  id: "gruvbox-dark",
  name: "Gruvbox Dark",
  nameJa: "Gruvbox Dark",
  isDark: true,
  colors: {
    bg: "#282828",
    bgCard: "#1d2021",
    bgHover: "#3c3836",
    border: "#504945",
    accent: "#458588",
    accentLight: "#83a598",
    text: "#ebdbb2",
    textDim: "#d5c4a1",
    textMuted: "#928374",
    bgDeep: "#1d2021",
    bgTabBar: "#1d2021",
    selectionBg: "rgba(69,133,136,0.25)",
    selectionRing: "rgba(69,133,136,0.5)",
    dropTargetBg: "rgba(69,133,136,0.3)",
    dropTargetRing: "#83a598",
    danger: "#cc241d",
    dangerHover: "#fb4934",
    sidebarActive: "#83a598",
    sidebarActiveBg: "rgba(131,165,152,0.1)",
    pathText: "#8ec07c",
    dirName: "#d3869b",
    iconFolder: "#83a598",
    iconImage: "#b8bb26",
    iconVideo: "#fb4934",
    iconAudio: "#fabd2f",
    iconCode: "#8ec07c",
    iconJson: "#fabd2f",
    iconArchive: "#fe8019",
    iconText: "#d5c4a1",
    iconDefault: "#928374",
  },
  preview: ["#282828", "#83a598", "#ebdbb2"],
};
