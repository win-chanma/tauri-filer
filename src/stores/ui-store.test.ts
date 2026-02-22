import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("uiStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      viewMode: "list",
      sidebarVisible: true,
      showHidden: false,
    });
  });

  it("初期状態: list, sidebar表示, hidden非表示", () => {
    const state = useUIStore.getState();
    expect(state.viewMode).toBe("list");
    expect(state.sidebarVisible).toBe(true);
    expect(state.showHidden).toBe(false);
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
});
