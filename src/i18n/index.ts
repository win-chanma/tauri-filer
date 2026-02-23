import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

const STORAGE_KEY = "tauri-filer-ui-settings";

function getStoredLanguage(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.language === "en" || parsed.language === "ja") {
        return parsed.language;
      }
    }
  } catch {
    // ignore
  }
  return "ja";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
