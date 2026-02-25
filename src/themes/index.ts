import type { Theme, ThemeId } from "../types";
import { defaultTheme } from "./default";
import { draculaTheme } from "./dracula";
import { catppuccinMochaTheme } from "./catppuccin-mocha";
import { nordTheme } from "./nord";
import { solarizedDarkTheme } from "./solarized-dark";
import { solarizedLightTheme } from "./solarized-light";
import { oneDarkTheme } from "./one-dark";

const themeRegistry: Record<ThemeId, Theme> = {
  default: defaultTheme,
  dracula: draculaTheme,
  "catppuccin-mocha": catppuccinMochaTheme,
  nord: nordTheme,
  "solarized-dark": solarizedDarkTheme,
  "solarized-light": solarizedLightTheme,
  "one-dark": oneDarkTheme,
};

export function getTheme(id: ThemeId): Theme {
  return themeRegistry[id] ?? defaultTheme;
}

export const themeList: Theme[] = Object.values(themeRegistry);

export { defaultTheme };
