import type { Theme, ThemeId } from "../types";
import { defaultTheme } from "./default";
import { draculaTheme } from "./dracula";
import { catppuccinMochaTheme } from "./catppuccin-mocha";
import { catppuccinLatteTheme } from "./catppuccin-latte";
import { catppuccinFrappeTheme } from "./catppuccin-frappe";
import { catppuccinMacchiatoTheme } from "./catppuccin-macchiato";
import { nordTheme } from "./nord";
import { solarizedDarkTheme } from "./solarized-dark";
import { solarizedLightTheme } from "./solarized-light";
import { oneDarkTheme } from "./one-dark";
import { atomOneLightTheme } from "./atom-one-light";
import { tokyoNightTheme } from "./tokyo-night";
import { gruvboxDarkTheme } from "./gruvbox-dark";
import { gruvboxLightTheme } from "./gruvbox-light";
import { githubDarkTheme } from "./github-dark";
import { githubLightTheme } from "./github-light";
import { rosePineTheme } from "./rose-pine";
import { rosePineMoonTheme } from "./rose-pine-moon";
import { rosePineDawnTheme } from "./rose-pine-dawn";
import { everforestTheme } from "./everforest";
import { kanagawaTheme } from "./kanagawa";
import { ayuDarkTheme } from "./ayu-dark";
import { ayuLightTheme } from "./ayu-light";
import { ayuMirageTheme } from "./ayu-mirage";
import { palenightTheme } from "./palenight";
import { synthwave84Theme } from "./synthwave-84";
import { horizonTheme } from "./horizon";

const themeRegistry: Record<ThemeId, Theme> = {
  default: defaultTheme,
  dracula: draculaTheme,
  "catppuccin-mocha": catppuccinMochaTheme,
  "catppuccin-latte": catppuccinLatteTheme,
  "catppuccin-frappe": catppuccinFrappeTheme,
  "catppuccin-macchiato": catppuccinMacchiatoTheme,
  nord: nordTheme,
  "solarized-dark": solarizedDarkTheme,
  "solarized-light": solarizedLightTheme,
  "one-dark": oneDarkTheme,
  "atom-one-light": atomOneLightTheme,
  "tokyo-night": tokyoNightTheme,
  "gruvbox-dark": gruvboxDarkTheme,
  "gruvbox-light": gruvboxLightTheme,
  "github-dark": githubDarkTheme,
  "github-light": githubLightTheme,
  "rose-pine": rosePineTheme,
  "rose-pine-moon": rosePineMoonTheme,
  "rose-pine-dawn": rosePineDawnTheme,
  everforest: everforestTheme,
  kanagawa: kanagawaTheme,
  "ayu-dark": ayuDarkTheme,
  "ayu-light": ayuLightTheme,
  "ayu-mirage": ayuMirageTheme,
  palenight: palenightTheme,
  "synthwave-84": synthwave84Theme,
  horizon: horizonTheme,
};

export function getTheme(id: ThemeId): Theme {
  return themeRegistry[id] ?? defaultTheme;
}

export const themeList: Theme[] = Object.values(themeRegistry);

export { defaultTheme };
