import { describe, it, expect, beforeEach, vi } from "vitest";
import type { FileEntry } from "../types";

vi.mock("../commands/fs-commands", () => ({
  readDirectory: vi.fn(),
}));

import { useFileStore } from "./file-store";
import { readDirectory } from "../commands/fs-commands";

const mockReadDirectory = vi.mocked(readDirectory);

function makeEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    name: "file.txt",
    path: "/file.txt",
    isDir: false,
    isSymlink: false,
    isHidden: false,
    size: 100,
    modified: "2024-01-01 00:00",
    mimeType: "text/plain",
    ...overrides,
  };
}

describe("fileStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFileStore.setState({
      entries: [],
      selectedPaths: new Set(),
      lastSelectedPath: null,
      sortConfig: { key: "name", order: "asc" },
      loading: false,
      error: null,
    });
  });

  describe("loadDirectory", () => {
    it("loading状態を遷移する", async () => {
      const entries = [makeEntry()];
      mockReadDirectory.mockResolvedValue(entries);

      const promise = useFileStore.getState().loadDirectory("/home");
      expect(useFileStore.getState().loading).toBe(true);
      expect(useFileStore.getState().error).toBeNull();

      await promise;
      expect(useFileStore.getState().loading).toBe(false);
    });

    it("entriesを設定する", async () => {
      const entries = [makeEntry({ name: "a.txt", path: "/a.txt" })];
      mockReadDirectory.mockResolvedValue(entries);

      await useFileStore.getState().loadDirectory("/home");
      expect(useFileStore.getState().entries).toEqual(entries);
    });

    it("エラー時はerrorを設定する", async () => {
      mockReadDirectory.mockRejectedValue(new Error("permission denied"));

      await useFileStore.getState().loadDirectory("/root");
      expect(useFileStore.getState().error).toBe("Error: permission denied");
      expect(useFileStore.getState().entries).toEqual([]);
      expect(useFileStore.getState().loading).toBe(false);
    });

    it("選択をクリアする", async () => {
      useFileStore.setState({
        selectedPaths: new Set(["/old"]),
        lastSelectedPath: "/old",
      });
      mockReadDirectory.mockResolvedValue([]);

      await useFileStore.getState().loadDirectory("/home");
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
      expect(useFileStore.getState().lastSelectedPath).toBeNull();
    });
  });

  describe("toggleSelection", () => {
    it("パスを追加する", () => {
      useFileStore.getState().toggleSelection("/a");
      expect(useFileStore.getState().selectedPaths.has("/a")).toBe(true);
      expect(useFileStore.getState().lastSelectedPath).toBe("/a");
    });

    it("既存パスを削除する", () => {
      useFileStore.setState({ selectedPaths: new Set(["/a"]) });
      useFileStore.getState().toggleSelection("/a");
      expect(useFileStore.getState().selectedPaths.has("/a")).toBe(false);
    });

    it("lastSelectedPathを更新する", () => {
      useFileStore.getState().toggleSelection("/a");
      useFileStore.getState().toggleSelection("/b");
      expect(useFileStore.getState().lastSelectedPath).toBe("/b");
    });
  });

  describe("selectRange", () => {
    const entries = [
      makeEntry({ name: "a", path: "/a" }),
      makeEntry({ name: "b", path: "/b" }),
      makeEntry({ name: "c", path: "/c" }),
      makeEntry({ name: "d", path: "/d" }),
    ];

    it("lastSelectedPathがない場合、ターゲットのみ選択", () => {
      useFileStore.getState().selectRange(entries, "/c");
      const state = useFileStore.getState();
      expect(state.selectedPaths).toEqual(new Set(["/c"]));
      expect(state.lastSelectedPath).toBe("/c");
    });

    it("範囲を選択する", () => {
      useFileStore.setState({ lastSelectedPath: "/a" });
      useFileStore.getState().selectRange(entries, "/c");
      expect(useFileStore.getState().selectedPaths).toEqual(
        new Set(["/a", "/b", "/c"]),
      );
    });

    it("既存選択とマージする", () => {
      useFileStore.setState({
        selectedPaths: new Set(["/d"]),
        lastSelectedPath: "/a",
      });
      useFileStore.getState().selectRange(entries, "/b");
      expect(useFileStore.getState().selectedPaths).toEqual(
        new Set(["/d", "/a", "/b"]),
      );
    });
  });

  describe("selectAll", () => {
    it("全entriesを選択する", () => {
      const entries = [
        makeEntry({ path: "/a" }),
        makeEntry({ path: "/b" }),
      ];
      useFileStore.setState({ entries });
      useFileStore.getState().selectAll();
      expect(useFileStore.getState().selectedPaths).toEqual(
        new Set(["/a", "/b"]),
      );
    });
  });

  describe("clearSelection", () => {
    it("全クリアする", () => {
      useFileStore.setState({
        selectedPaths: new Set(["/a", "/b"]),
        lastSelectedPath: "/b",
      });
      useFileStore.getState().clearSelection();
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
      expect(useFileStore.getState().lastSelectedPath).toBeNull();
    });
  });

  describe("setSortConfig", () => {
    it("ソート設定を更新する", () => {
      useFileStore.getState().setSortConfig({ key: "size", order: "desc" });
      expect(useFileStore.getState().sortConfig).toEqual({
        key: "size",
        order: "desc",
      });
    });
  });
});
