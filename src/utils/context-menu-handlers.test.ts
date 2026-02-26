import { describe, expect, it, vi, beforeEach } from "vitest";
import { createContextMenuHandlers, type ContextMenuDeps } from "./context-menu-handlers";
import type { FileEntry } from "../types";

function makeEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    name: "test.txt",
    path: "/home/test.txt",
    isDir: false,
    isSymlink: false,
    isHidden: false,
    size: 100,
    modified: "2026-01-01 00:00",
    mimeType: "text/plain",
    ...overrides,
  };
}

function makeDeps(overrides: Partial<ContextMenuDeps> = {}): ContextMenuDeps {
  return {
    getActiveTabPath: vi.fn(() => "/home"),
    getSelectedEntry: vi.fn(() => null),
    getSelectedPaths: vi.fn(() => []),
    navigateTo: vi.fn(),
    openFile: vi.fn(() => Promise.resolve()),
    createDirectory: vi.fn(() => Promise.resolve("/home/new-folder")),
    renameItem: vi.fn(() => Promise.resolve("/home/renamed.txt")),
    deleteItems: vi.fn(() => Promise.resolve()),
    copyItems: vi.fn(() => Promise.resolve()),
    moveItems: vi.fn(() => Promise.resolve()),
    clipboardPaths: [],
    clipboardMode: null,
    clipboardClear: vi.fn(),
    clearSelection: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  };
}

describe("createContextMenuHandlers", () => {
  describe("handleFileOpen", () => {
    it("ディレクトリ → navigateTo が呼ばれる", async () => {
      const deps = makeDeps();
      const { handleFileOpen } = createContextMenuHandlers(deps);
      const dirEntry = makeEntry({ isDir: true, path: "/home/docs", name: "docs" });

      await handleFileOpen(dirEntry);

      expect(deps.navigateTo).toHaveBeenCalledWith("/home/docs");
      expect(deps.openFile).not.toHaveBeenCalled();
    });

    it("ファイル → openFile が呼ばれる", async () => {
      const deps = makeDeps();
      const { handleFileOpen } = createContextMenuHandlers(deps);
      const fileEntry = makeEntry({ path: "/home/test.txt" });

      await handleFileOpen(fileEntry);

      expect(deps.openFile).toHaveBeenCalledWith("/home/test.txt");
      expect(deps.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe("handlePaste", () => {
    it("copy モード → copyItems が呼ばれ refresh される", async () => {
      const deps = makeDeps({
        clipboardPaths: ["/a.txt"],
        clipboardMode: "copy",
      });
      const { handlePaste } = createContextMenuHandlers(deps);

      await handlePaste();

      expect(deps.copyItems).toHaveBeenCalledWith(["/a.txt"], "/home");
      expect(deps.refresh).toHaveBeenCalled();
      expect(deps.clipboardClear).not.toHaveBeenCalled();
    });

    it("cut モード → moveItems + clipboardClear が呼ばれる", async () => {
      const deps = makeDeps({
        clipboardPaths: ["/a.txt"],
        clipboardMode: "cut",
      });
      const { handlePaste } = createContextMenuHandlers(deps);

      await handlePaste();

      expect(deps.moveItems).toHaveBeenCalledWith(["/a.txt"], "/home");
      expect(deps.clipboardClear).toHaveBeenCalled();
      expect(deps.refresh).toHaveBeenCalled();
    });

    it("クリップボード空 → 何もしない", async () => {
      const deps = makeDeps({
        clipboardPaths: [],
        clipboardMode: null,
      });
      const { handlePaste } = createContextMenuHandlers(deps);

      await handlePaste();

      expect(deps.copyItems).not.toHaveBeenCalled();
      expect(deps.moveItems).not.toHaveBeenCalled();
      expect(deps.refresh).not.toHaveBeenCalled();
    });
  });

  describe("handleCreateFolder", () => {
    it("createDirectory + refresh が呼ばれる", async () => {
      const deps = makeDeps();
      const { handleCreateFolder } = createContextMenuHandlers(deps);

      await handleCreateFolder("new-folder");

      expect(deps.createDirectory).toHaveBeenCalledWith("/home", "new-folder");
      expect(deps.refresh).toHaveBeenCalled();
    });
  });

  describe("handleRename", () => {
    it("renameItem + clearSelection + refresh が呼ばれる", async () => {
      const entry = makeEntry({ path: "/home/old.txt" });
      const deps = makeDeps({
        getSelectedEntry: vi.fn(() => entry),
      });
      const { handleRename } = createContextMenuHandlers(deps);

      await handleRename("new.txt");

      expect(deps.renameItem).toHaveBeenCalledWith("/home/old.txt", "new.txt");
      expect(deps.clearSelection).toHaveBeenCalled();
      expect(deps.refresh).toHaveBeenCalled();
    });
  });

  describe("handleDelete", () => {
    it("deleteItems + clearSelection + refresh が呼ばれる", async () => {
      const deps = makeDeps({
        getSelectedPaths: vi.fn(() => ["/home/a.txt", "/home/b.txt"]),
      });
      const { handleDelete } = createContextMenuHandlers(deps);

      await handleDelete();

      expect(deps.deleteItems).toHaveBeenCalledWith(["/home/a.txt", "/home/b.txt"]);
      expect(deps.clearSelection).toHaveBeenCalled();
      expect(deps.refresh).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("createDirectory 失敗 → console.error、クラッシュしない", async () => {
      const deps = makeDeps({
        createDirectory: vi.fn(() => Promise.reject(new Error("permission denied"))),
      });
      const { handleCreateFolder } = createContextMenuHandlers(deps);

      await expect(handleCreateFolder("test")).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("Create folder failed:", expect.any(Error));
      expect(deps.refresh).not.toHaveBeenCalled();
    });

    it("deleteItems 失敗 → console.error、クラッシュしない", async () => {
      const deps = makeDeps({
        getSelectedPaths: vi.fn(() => ["/a.txt"]),
        deleteItems: vi.fn(() => Promise.reject(new Error("delete failed"))),
      });
      const { handleDelete } = createContextMenuHandlers(deps);

      await expect(handleDelete()).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("Delete failed:", expect.any(Error));
      expect(deps.clearSelection).not.toHaveBeenCalled();
    });

    it("openFile 失敗 → console.error、クラッシュしない", async () => {
      const deps = makeDeps({
        openFile: vi.fn(() => Promise.reject(new Error("open failed"))),
      });
      const { handleFileOpen } = createContextMenuHandlers(deps);

      await expect(handleFileOpen(makeEntry())).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("Open file failed:", expect.any(Error));
    });
  });
});
