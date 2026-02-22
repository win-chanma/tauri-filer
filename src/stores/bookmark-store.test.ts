import { describe, it, expect, beforeEach } from "vitest";
import { useBookmarkStore } from "./bookmark-store";

const STORAGE_KEY = "tauri-filer-bookmarks";

describe("bookmarkStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useBookmarkStore.setState({ bookmarks: [] });
  });

  describe("addBookmark", () => {
    it("ブックマークを追加する", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toEqual([{ label: "Home", path: "/home" }]);
    });

    it("localStorageに永続化する", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual([{ label: "Home", path: "/home" }]);
    });

    it("重複パスを拒否する", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      useBookmarkStore.getState().addBookmark("Home2", "/home");
      expect(useBookmarkStore.getState().bookmarks).toHaveLength(1);
    });
  });

  describe("removeBookmark", () => {
    it("ブックマークを削除する", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      useBookmarkStore.getState().removeBookmark("/home");
      expect(useBookmarkStore.getState().bookmarks).toEqual([]);
    });

    it("localStorageを更新する", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      useBookmarkStore.getState().removeBookmark("/home");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual([]);
    });

    it("存在しないパスで何もしない", () => {
      useBookmarkStore.getState().addBookmark("Home", "/home");
      useBookmarkStore.getState().removeBookmark("/nonexistent");
      expect(useBookmarkStore.getState().bookmarks).toHaveLength(1);
    });
  });
});
