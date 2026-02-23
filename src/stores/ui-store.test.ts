import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore, loadSettings } from "./ui-store";

const STORAGE_KEY = "tauri-filer-ui-settings";

describe("uiStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({
      viewMode: "list",
      sidebarVisible: true,
      showHidden: false,
      language: "ja",
    });
  });

  it("初期状態: list, sidebar表示, hidden非表示, 日本語", () => {
    const state = useUIStore.getState();
    expect(state.viewMode).toBe("list");
    expect(state.sidebarVisible).toBe(true);
    expect(state.showHidden).toBe(false);
    expect(state.language).toBe("ja");
  });

  describe("setViewMode", () => {
    it("grid に切り替える", () => {
      useUIStore.getState().setViewMode("grid");
      expect(useUIStore.getState().viewMode).toBe("grid");
    });

    it("list に戻す", () => {
      useUIStore.getState().setViewMode("grid");
      useUIStore.getState().setViewMode("list");
      expect(useUIStore.getState().viewMode).toBe("list");
    });
  });

  describe("toggleSidebar", () => {
    it("非表示にする", () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarVisible).toBe(false);
    });

    it("再度トグルで表示に戻る", () => {
      useUIStore.getState().toggleSidebar();
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarVisible).toBe(true);
    });
  });

  describe("toggleHidden", () => {
    it("表示にする", () => {
      useUIStore.getState().toggleHidden();
      expect(useUIStore.getState().showHidden).toBe(true);
    });

    it("再度トグルで非表示に戻る", () => {
      useUIStore.getState().toggleHidden();
      useUIStore.getState().toggleHidden();
      expect(useUIStore.getState().showHidden).toBe(false);
    });
  });

  describe("setLanguage", () => {
    it("英語に切り替える", () => {
      useUIStore.getState().setLanguage("en");
      expect(useUIStore.getState().language).toBe("en");
    });

    it("日本語に戻す", () => {
      useUIStore.getState().setLanguage("en");
      useUIStore.getState().setLanguage("ja");
      expect(useUIStore.getState().language).toBe("ja");
    });
  });

  describe("localStorage永続化", () => {
    it("setViewModeでlocalStorageに保存される", () => {
      useUIStore.getState().setViewMode("grid");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.viewMode).toBe("grid");
    });

    it("toggleSidebarでlocalStorageに保存される", () => {
      useUIStore.getState().toggleSidebar();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.sidebarVisible).toBe(false);
    });

    it("toggleHiddenでlocalStorageに保存される", () => {
      useUIStore.getState().toggleHidden();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.showHidden).toBe(true);
    });

    it("setLanguageでlocalStorageに保存される", () => {
      useUIStore.getState().setLanguage("en");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.language).toBe("en");
    });

    it("localStorageから設定を復元する", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ viewMode: "grid", sidebarVisible: false, showHidden: true })
      );
      const settings = loadSettings();
      expect(settings.viewMode).toBe("grid");
      expect(settings.sidebarVisible).toBe(false);
      expect(settings.showHidden).toBe(true);
    });

    it("壊れたlocalStorageデータを安全に処理する", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json");
      const settings = loadSettings();
      expect(settings).toEqual({});
    });

    it("部分的なlocalStorageデータをマージする", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: "grid" }));
      const settings = loadSettings();
      expect(settings.viewMode).toBe("grid");
      expect(settings.sidebarVisible).toBeUndefined();
    });
  });
});
