import { describe, it, expect, beforeEach } from "vitest";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

describe("i18n", () => {
  beforeEach(async () => {
    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        ja: { translation: ja },
      },
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
  });

  it("英語で翻訳を取得できる", () => {
    expect(i18n.t("settings.title")).toBe("Settings");
  });

  it("日本語に切り替えて翻訳を取得できる", async () => {
    await i18n.changeLanguage("ja");
    expect(i18n.t("settings.title")).toBe("設定");
  });

  it("補間付きの翻訳が動作する", () => {
    expect(i18n.t("statusBar.items", { count: 5 })).toBe("5 items");
  });

  it("複数形が動作する（英語）", () => {
    expect(i18n.t("delete.confirm", { count: 1 })).toBe("Move 1 item to trash?");
    expect(i18n.t("delete.confirm", { count: 3 })).toBe("Move 3 items to trash?");
  });

  it("日本語の複数形が動作する", async () => {
    await i18n.changeLanguage("ja");
    expect(i18n.t("delete.confirm", { count: 1 })).toBe("1 個の項目をゴミ箱に移動しますか？");
    expect(i18n.t("delete.confirm", { count: 3 })).toBe("3 個の項目をゴミ箱に移動しますか？");
  });

  it("英語と日本語のキーが一致する", () => {
    const enKeys = Object.keys(en).sort();
    const jaKeys = Object.keys(ja).sort();
    expect(enKeys).toEqual(jaKeys);
  });
});
