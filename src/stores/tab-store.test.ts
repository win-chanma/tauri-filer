import { describe, it, expect, beforeEach } from "vitest";
import { useTabStore } from "./tab-store";

function getActiveTab() {
  const { tabs, activeTabId } = useTabStore.getState();
  return tabs.find((t) => t.id === activeTabId);
}

describe("tabStore", () => {
  beforeEach(() => {
    useTabStore.setState({ tabs: [], activeTabId: "" });
  });

  describe("addTab", () => {
    it("タブを追加してactiveにする", () => {
      useTabStore.getState().addTab("/home");
      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].path).toBe("/home");
      expect(state.activeTabId).toBe(state.tabs[0].id);
    });

    it("パスからラベルを導出する", () => {
      useTabStore.getState().addTab("/home/user/docs");
      expect(useTabStore.getState().tabs[0].label).toBe("docs");
    });

    it("ルートパスのラベルは '/'", () => {
      useTabStore.getState().addTab("/");
      expect(useTabStore.getState().tabs[0].label).toBe("/");
    });

    it("Windows パスからラベルを導出する", () => {
      useTabStore.getState().addTab("C:\\Users\\foo\\bar");
      expect(useTabStore.getState().tabs[0].label).toBe("bar");
    });

    it("Windows ドライブルートのラベルは 'C:\\'", () => {
      useTabStore.getState().addTab("C:\\");
      expect(useTabStore.getState().tabs[0].label).toBe("C:\\");
    });

    it("履歴が初期化される", () => {
      useTabStore.getState().addTab("/home");
      const tab = useTabStore.getState().tabs[0];
      expect(tab.history).toEqual(["/home"]);
      expect(tab.historyIndex).toBe(0);
    });
  });

  describe("closeTab", () => {
    it("最後の1つは閉じない", () => {
      useTabStore.getState().addTab("/home");
      const id = useTabStore.getState().tabs[0].id;
      useTabStore.getState().closeTab(id);
      expect(useTabStore.getState().tabs).toHaveLength(1);
    });

    it("非activeタブを閉じる", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().addTab("/b");
      const state = useTabStore.getState();
      const nonActiveId = state.tabs.find((t) => t.id !== state.activeTabId)!.id;
      useTabStore.getState().closeTab(nonActiveId);
      expect(useTabStore.getState().tabs).toHaveLength(1);
      expect(useTabStore.getState().activeTabId).toBe(state.activeTabId);
    });

    it("activeタブを閉じると隣接に切り替わる", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().addTab("/b");
      useTabStore.getState().addTab("/c");
      // /c がactive
      const activeId = useTabStore.getState().activeTabId;
      useTabStore.getState().closeTab(activeId);
      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(2);
      // 閉じた位置(末尾)の隣接タブがactiveになる
      expect(state.tabs.some((t) => t.id === state.activeTabId)).toBe(true);
    });
  });

  describe("navigate", () => {
    it("パスを変更する", () => {
      useTabStore.getState().addTab("/home");
      useTabStore.getState().navigate("/home/docs");
      expect(getActiveTab()!.path).toBe("/home/docs");
    });

    it("履歴に追加する", () => {
      useTabStore.getState().addTab("/home");
      useTabStore.getState().navigate("/home/docs");
      const tab = getActiveTab()!;
      expect(tab.history).toEqual(["/home", "/home/docs"]);
      expect(tab.historyIndex).toBe(1);
    });

    it("ラベルを更新する", () => {
      useTabStore.getState().addTab("/home");
      useTabStore.getState().navigate("/home/docs");
      expect(getActiveTab()!.label).toBe("docs");
    });

    it("goBack後のナビゲートで前方履歴を切り捨てる", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().navigate("/b");
      useTabStore.getState().navigate("/c");
      useTabStore.getState().goBack(); // /b
      useTabStore.getState().navigate("/d");
      const tab = getActiveTab()!;
      expect(tab.history).toEqual(["/a", "/b", "/d"]);
      expect(tab.historyIndex).toBe(2);
    });
  });

  describe("goBack", () => {
    it("履歴を戻る", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().navigate("/b");
      useTabStore.getState().goBack();
      expect(getActiveTab()!.path).toBe("/a");
    });

    it("先頭で何もしない", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().goBack();
      expect(getActiveTab()!.path).toBe("/a");
      expect(getActiveTab()!.historyIndex).toBe(0);
    });
  });

  describe("goForward", () => {
    it("履歴を進む", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().navigate("/b");
      useTabStore.getState().goBack();
      useTabStore.getState().goForward();
      expect(getActiveTab()!.path).toBe("/b");
    });

    it("末尾で何もしない", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().goForward();
      expect(getActiveTab()!.path).toBe("/a");
    });
  });

  describe("goUp", () => {
    it("親ディレクトリに移動する", () => {
      useTabStore.getState().addTab("/home/user/docs");
      useTabStore.getState().goUp();
      expect(getActiveTab()!.path).toBe("/home/user");
    });

    it("ルートで何もしない", () => {
      useTabStore.getState().addTab("/");
      useTabStore.getState().goUp();
      expect(getActiveTab()!.path).toBe("/");
    });

    it("Windows パスで親ディレクトリに移動する", () => {
      useTabStore.getState().addTab("C:\\Users\\foo\\bar");
      useTabStore.getState().goUp();
      expect(getActiveTab()!.path).toBe("C:\\Users\\foo");
    });

    it("Windows ドライブルートで何もしない", () => {
      useTabStore.getState().addTab("C:\\");
      useTabStore.getState().goUp();
      expect(getActiveTab()!.path).toBe("C:\\");
    });

    it("Windows で2階層目からドライブルートに移動する", () => {
      useTabStore.getState().addTab("C:\\Users");
      useTabStore.getState().goUp();
      expect(getActiveTab()!.path).toBe("C:\\");
    });

    it("goUp で履歴に追加される", () => {
      useTabStore.getState().addTab("/home/user/docs");
      useTabStore.getState().goUp();
      const tab = getActiveTab()!;
      expect(tab.history).toEqual(["/home/user/docs", "/home/user"]);
      expect(tab.historyIndex).toBe(1);
    });
  });

  describe("canGoUp", () => {
    it("ルートでは false", () => {
      useTabStore.getState().addTab("/");
      expect(useTabStore.getState().canGoUp()).toBe(false);
    });

    it("非ルートでは true", () => {
      useTabStore.getState().addTab("/home/user");
      expect(useTabStore.getState().canGoUp()).toBe(true);
    });

    it("Windows ドライブルートでは false", () => {
      useTabStore.getState().addTab("C:\\");
      expect(useTabStore.getState().canGoUp()).toBe(false);
    });

    it("Windows 非ルートでは true", () => {
      useTabStore.getState().addTab("C:\\Users");
      expect(useTabStore.getState().canGoUp()).toBe(true);
    });
  });

  describe("canGoBack / canGoForward", () => {
    it("初期状態ではどちらもfalse", () => {
      useTabStore.getState().addTab("/a");
      expect(useTabStore.getState().canGoBack()).toBe(false);
      expect(useTabStore.getState().canGoForward()).toBe(false);
    });

    it("navigate後はcanGoBackがtrue", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().navigate("/b");
      expect(useTabStore.getState().canGoBack()).toBe(true);
      expect(useTabStore.getState().canGoForward()).toBe(false);
    });

    it("goBack後はcanGoForwardがtrue", () => {
      useTabStore.getState().addTab("/a");
      useTabStore.getState().navigate("/b");
      useTabStore.getState().goBack();
      expect(useTabStore.getState().canGoBack()).toBe(false);
      expect(useTabStore.getState().canGoForward()).toBe(true);
    });
  });
});
