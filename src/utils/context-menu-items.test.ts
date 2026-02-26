import { describe, expect, it, vi } from "vitest";
import { buildContextMenuItems, type BuildContextMenuItemsParams } from "./context-menu-items";
import type { FileEntry } from "../types";

function makeEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    name: "test.txt",
    path: "/test.txt",
    isDir: false,
    isSymlink: false,
    isHidden: false,
    size: 100,
    modified: "2026-01-01 00:00",
    mimeType: "text/plain",
    ...overrides,
  };
}

function makeParams(overrides: Partial<BuildContextMenuItemsParams> = {}): BuildContextMenuItemsParams {
  return {
    t: ((key: string) => key) as unknown as BuildContextMenuItemsParams["t"],
    hasSelection: false,
    selectedEntry: null,
    selectedCount: 0,
    hasClipboard: false,
    onOpen: vi.fn(),
    onPreview: vi.fn(),
    onCopy: vi.fn(),
    onCut: vi.fn(),
    onPaste: vi.fn(),
    onNewFolder: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

function labels(params: Partial<BuildContextMenuItemsParams> = {}): string[] {
  return buildContextMenuItems(makeParams(params))
    .filter((item) => !item.separator)
    .map((item) => item.label);
}

describe("buildContextMenuItems", () => {
  it("選択なし・クリップボード空 → New Folder のみ", () => {
    const result = labels();
    expect(result).toEqual(["context.newFolder"]);
  });

  it("ファイル1つ選択 → 全メニュー表示", () => {
    const result = labels({
      hasSelection: true,
      selectedEntry: makeEntry(),
      selectedCount: 1,
    });
    expect(result).toEqual([
      "context.open",
      "context.preview",
      "context.copy",
      "context.cut",
      "context.newFolder",
      "context.rename",
      "context.delete",
    ]);
  });

  it("ディレクトリ選択 → Preview なし", () => {
    const result = labels({
      hasSelection: true,
      selectedEntry: makeEntry({ isDir: true, name: "folder" }),
      selectedCount: 1,
    });
    expect(result).not.toContain("context.preview");
    expect(result).toContain("context.open");
  });

  it("複数選択 → Rename なし", () => {
    const result = labels({
      hasSelection: true,
      selectedEntry: null,
      selectedCount: 3,
    });
    expect(result).not.toContain("context.rename");
    expect(result).toContain("context.copy");
    expect(result).toContain("context.cut");
  });

  it("クリップボードあり → Paste あり", () => {
    const result = labels({ hasClipboard: true });
    expect(result).toContain("context.paste");
  });

  it("クリップボード空 → Paste なし", () => {
    const result = labels({ hasClipboard: false });
    expect(result).not.toContain("context.paste");
  });

  it("選択あり → Delete が danger", () => {
    const items = buildContextMenuItems(makeParams({
      hasSelection: true,
      selectedEntry: makeEntry(),
      selectedCount: 1,
    }));
    const deleteItem = items.find((item) => item.label === "context.delete");
    expect(deleteItem).toBeDefined();
    expect(deleteItem!.danger).toBe(true);
  });

  it("選択なし → Open, Copy, Cut, Delete なし", () => {
    const result = labels();
    expect(result).not.toContain("context.open");
    expect(result).not.toContain("context.copy");
    expect(result).not.toContain("context.cut");
    expect(result).not.toContain("context.delete");
  });
});
