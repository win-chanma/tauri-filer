import type { Theme, ThemeId } from "../types";
import { defaultTheme } from "./default";

type ThemeLoader = () => Promise<Theme>;

const themeLoaders: Record<ThemeId, ThemeLoader> = {
  default: () => Promise.resolve(defaultTheme),
  dracula: () => import("./dracula").then((m) => m.draculaTheme),
  "catppuccin-mocha": () => import("./catppuccin-mocha").then((m) => m.catppuccinMochaTheme),
  "catppuccin-latte": () => import("./catppuccin-latte").then((m) => m.catppuccinLatteTheme),
  "catppuccin-frappe": () => import("./catppuccin-frappe").then((m) => m.catppuccinFrappeTheme),
  "catppuccin-macchiato": () => import("./catppuccin-macchiato").then((m) => m.catppuccinMacchiatoTheme),
  nord: () => import("./nord").then((m) => m.nordTheme),
  "solarized-dark": () => import("./solarized-dark").then((m) => m.solarizedDarkTheme),
  "solarized-light": () => import("./solarized-light").then((m) => m.solarizedLightTheme),
  "one-dark": () => import("./one-dark").then((m) => m.oneDarkTheme),
  "atom-one-light": () => import("./atom-one-light").then((m) => m.atomOneLightTheme),
  "tokyo-night": () => import("./tokyo-night").then((m) => m.tokyoNightTheme),
  "gruvbox-dark": () => import("./gruvbox-dark").then((m) => m.gruvboxDarkTheme),
  "gruvbox-light": () => import("./gruvbox-light").then((m) => m.gruvboxLightTheme),
  "github-dark": () => import("./github-dark").then((m) => m.githubDarkTheme),
  "github-light": () => import("./github-light").then((m) => m.githubLightTheme),
  "rose-pine": () => import("./rose-pine").then((m) => m.rosePineTheme),
  "rose-pine-moon": () => import("./rose-pine-moon").then((m) => m.rosePineMoonTheme),
  "rose-pine-dawn": () => import("./rose-pine-dawn").then((m) => m.rosePineDawnTheme),
  everforest: () => import("./everforest").then((m) => m.everforestTheme),
  kanagawa: () => import("./kanagawa").then((m) => m.kanagawaTheme),
  "ayu-dark": () => import("./ayu-dark").then((m) => m.ayuDarkTheme),
  "ayu-light": () => import("./ayu-light").then((m) => m.ayuLightTheme),
  "ayu-mirage": () => import("./ayu-mirage").then((m) => m.ayuMirageTheme),
  palenight: () => import("./palenight").then((m) => m.palenightTheme),
  "synthwave-84": () => import("./synthwave-84").then((m) => m.synthwave84Theme),
  horizon: () => import("./horizon").then((m) => m.horizonTheme),
};

const themeCache = new Map<ThemeId, Theme>();
themeCache.set("default", defaultTheme);

export function getTheme(id: ThemeId): Theme {
  return themeCache.get(id) ?? defaultTheme;
}

export async function loadTheme(id: ThemeId): Promise<Theme> {
  const cached = themeCache.get(id);
  if (cached) return cached;

  const loader = themeLoaders[id];
  if (!loader) return defaultTheme;

  const theme = await loader();
  themeCache.set(id, theme);
  return theme;
}

export async function loadAllThemes(): Promise<Theme[]> {
  const ids = Object.keys(themeLoaders) as ThemeId[];
  const themes = await Promise.all(ids.map((id) => loadTheme(id)));
  return themes;
}

export { defaultTheme };
