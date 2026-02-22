import { describe, it, expect } from "vitest";
import { sortEntries } from "./sort";
import type { FileEntry } from "../types";

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

describe("sortEntries", () => {
  describe("ディレクトリ優先", () => {
    const entries = [
      makeEntry({ name: "file.txt", path: "/file.txt", isDir: false }),
      makeEntry({ name: "docs", path: "/docs", isDir: true, size: 0 }),
    ];

    it("asc でもディレクトリが先頭", () => {
      const result = sortEntries(entries, { key: "name", order: "asc" });
      expect(result[0].name).toBe("docs");
      expect(result[1].name).toBe("file.txt");
    });

    it("desc でもディレクトリが先頭", () => {
      const result = sortEntries(entries, { key: "name", order: "desc" });
      expect(result[0].name).toBe("docs");
      expect(result[1].name).toBe("file.txt");
    });
  });

  describe("名前ソート", () => {
    const entries = [
      makeEntry({ name: "Charlie", path: "/c" }),
      makeEntry({ name: "alpha", path: "/a" }),
      makeEntry({ name: "Bravo", path: "/b" }),
    ];

    it("asc: 大文字小文字無視で昇順", () => {
      const result = sortEntries(entries, { key: "name", order: "asc" });
      expect(result.map((e) => e.name)).toEqual(["alpha", "Bravo", "Charlie"]);
    });

    it("desc: 大文字小文字無視で降順", () => {
      const result = sortEntries(entries, { key: "name", order: "desc" });
      expect(result.map((e) => e.name)).toEqual(["Charlie", "Bravo", "alpha"]);
    });
  });

  describe("サイズソート", () => {
    const entries = [
      makeEntry({ name: "big", path: "/big", size: 3000 }),
      makeEntry({ name: "small", path: "/small", size: 100 }),
      makeEntry({ name: "medium", path: "/medium", size: 1000 }),
    ];

    it("asc: 小さい順", () => {
      const result = sortEntries(entries, { key: "size", order: "asc" });
      expect(result.map((e) => e.name)).toEqual(["small", "medium", "big"]);
    });

    it("desc: 大きい順", () => {
      const result = sortEntries(entries, { key: "size", order: "desc" });
      expect(result.map((e) => e.name)).toEqual(["big", "medium", "small"]);
    });
  });

  describe("日付ソート", () => {
    const entries = [
      makeEntry({ name: "new", path: "/new", modified: "2024-03-01 00:00" }),
      makeEntry({ name: "old", path: "/old", modified: "2024-01-01 00:00" }),
      makeEntry({ name: "mid", path: "/mid", modified: "2024-02-01 00:00" }),
    ];

    it("asc: 古い順", () => {
      const result = sortEntries(entries, { key: "modified", order: "asc" });
      expect(result.map((e) => e.name)).toEqual(["old", "mid", "new"]);
    });

    it("desc: 新しい順", () => {
      const result = sortEntries(entries, { key: "modified", order: "desc" });
      expect(result.map((e) => e.name)).toEqual(["new", "mid", "old"]);
    });

    it("null は先頭に来る（asc時の特徴テスト）", () => {
      const withNull = [
        makeEntry({ name: "dated", path: "/dated", modified: "2024-01-01 00:00" }),
        makeEntry({ name: "nodate", path: "/nodate", modified: null }),
      ];
      const result = sortEntries(withNull, { key: "modified", order: "asc" });
      expect(result[0].name).toBe("nodate");
    });
  });

  describe("非破壊", () => {
    it("元配列を変更しない", () => {
      const entries = [
        makeEntry({ name: "b", path: "/b" }),
        makeEntry({ name: "a", path: "/a" }),
      ];
      const original = [...entries];
      sortEntries(entries, { key: "name", order: "asc" });
      expect(entries).toEqual(original);
    });
  });
});
