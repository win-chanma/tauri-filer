import { describe, expect, it, vi, beforeEach } from "vitest";

// Tauri バックエンド層のみモック
vi.mock("../commands/fs-commands", () => ({
  readDirectory: vi.fn(),
  getHomeDir: vi.fn(),
  createDirectory: vi.fn(),
  renameItem: vi.fn(),
  deleteItems: vi.fn(),
  copyItems: vi.fn(),
  moveItems: vi.fn(),
  openFile: vi.fn(),
}));

import { createContextMenuHandlers } from "./context-menu-handlers";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { useClipboardStore } from "../stores/clipboard-store";
import {
  createDirectory,
  renameItem,
  deleteItems,
  copyItems,
  moveItems,
  openFile,
} from "../commands/fs-commands";
import type { FileEntry } from "../types";

const mockCreateDirectory = vi.mocked(createDirectory);
const mockRenameItem = vi.mocked(renameItem);
const mockDeleteItems = vi.mocked(deleteItems);
const mockCopyItems = vi.mocked(copyItems);
const mockMoveItems = vi.mocked(moveItems);
const mockOpenFile = vi.mocked(openFile);

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

// AppLayout と同じ配線でハンドラーを生成する
function createHandlersFromStores(overrides: { navigateTo?: ReturnType<typeof vi.fn>; refresh?: ReturnType<typeof vi.fn> } = {}) {
  const clipState = useClipboardStore.getState();
  const navigateTo = overrides.navigateTo ?? vi.fn();
  const refresh = overrides.refresh ?? vi.fn();

  const handlers = createContextMenuHandlers({
    getActiveTabPath: () => {
      const { tabs, activeTabId } = useTabStore.getState();
      const tab = tabs.find((t) => t.id === activeTabId);
      return tab?.path ?? null;
    },
    getSelectedEntry: () => {
      const { selectedPaths, entries } = useFileStore.getState();
      const paths = Array.from(selectedPaths);
      if (paths.length !== 1) return null;
      return entries.find((e) => e.path === paths[0]) || null;
    },
    getSelectedPaths: () => Array.from(useFileStore.getState().selectedPaths),
    navigateTo,
    openFile,
    createDirectory,
    renameItem,
    deleteItems,
    copyItems,
    moveItems,
    clipboardPaths: clipState.paths,
    clipboardMode: clipState.mode,
    clipboardClear: () => useClipboardStore.getState().clear(),
    clearSelection: () => useFileStore.getState().clearSelection(),
    refresh,
  });

  return { ...handlers, navigateTo, refresh };
}

describe("createContextMenuHandlers（実ストア連携）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ストアをリセット
    useTabStore.setState({ tabs: [], activeTabId: "" });
    useFileStore.setState({
      entries: [],
      selectedPaths: new Set(),
      lastSelectedPath: null,
      sortConfig: { key: "name", order: "asc" },
      loading: false,
      error: null,
    });
    useClipboardStore.setState({ paths: [], mode: null });
  });

  describe("handleFileOpen", () => {
    it("ディレクトリ → navigateTo が呼ばれる", async () => {
      const { handleFileOpen, navigateTo } = createHandlersFromStores();
      const dir = makeEntry({ isDir: true, path: "/home/docs", name: "docs" });

      await handleFileOpen(dir);

      expect(navigateTo).toHaveBeenCalledWith("/home/docs");
      expect(mockOpenFile).not.toHaveBeenCalled();
    });

    it("ファイル → openFile が呼ばれる", async () => {
      mockOpenFile.mockResolvedValue(undefined);
      const { handleFileOpen, navigateTo } = createHandlersFromStores();

      await handleFileOpen(makeEntry({ path: "/home/test.txt" }));

      expect(mockOpenFile).toHaveBeenCalledWith("/home/test.txt");
      expect(navigateTo).not.toHaveBeenCalled();
    });
  });

  describe("handlePaste", () => {
    it("copy モード → copyItems が正しいパスで呼ばれ、クリップボードは維持される", async () => {
      // タブとクリップボードをセットアップ
      useTabStore.getState().addTab("/home/dest");
      useClipboardStore.getState().copy(["/home/src/a.txt"]);
      mockCopyItems.mockResolvedValue(undefined);

      const { handlePaste, refresh } = createHandlersFromStores();
      await handlePaste();

      expect(mockCopyItems).toHaveBeenCalledWith(["/home/src/a.txt"], "/home/dest");
      expect(refresh).toHaveBeenCalled();
      // copy モードではクリップボードを維持
      expect(useClipboardStore.getState().paths).toEqual(["/home/src/a.txt"]);
      expect(useClipboardStore.getState().mode).toBe("copy");
    });

    it("cut モード → moveItems が呼ばれ、クリップボードがクリアされる", async () => {
      useTabStore.getState().addTab("/home/dest");
      useClipboardStore.getState().cut(["/home/src/b.txt"]);
      mockMoveItems.mockResolvedValue(undefined);

      const { handlePaste, refresh } = createHandlersFromStores();
      await handlePaste();

      expect(mockMoveItems).toHaveBeenCalledWith(["/home/src/b.txt"], "/home/dest");
      expect(refresh).toHaveBeenCalled();
      // cut モードではクリップボードがクリアされる
      expect(useClipboardStore.getState().paths).toEqual([]);
      expect(useClipboardStore.getState().mode).toBeNull();
    });

    it("クリップボード空 → 何もしない", async () => {
      useTabStore.getState().addTab("/home/dest");
      // クリップボードは空のまま

      const { handlePaste, refresh } = createHandlersFromStores();
      await handlePaste();

      expect(mockCopyItems).not.toHaveBeenCalled();
      expect(mockMoveItems).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });

    it("アクティブタブがない → 何もしない", async () => {
      // タブを追加しない
      useClipboardStore.getState().copy(["/file.txt"]);

      const { handlePaste } = createHandlersFromStores();
      await handlePaste();

      expect(mockCopyItems).not.toHaveBeenCalled();
    });
  });

  describe("handleCreateFolder", () => {
    it("アクティブタブのパスで createDirectory が呼ばれる", async () => {
      useTabStore.getState().addTab("/home/user");
      mockCreateDirectory.mockResolvedValue("/home/user/new-folder");

      const { handleCreateFolder, refresh } = createHandlersFromStores();
      await handleCreateFolder("new-folder");

      expect(mockCreateDirectory).toHaveBeenCalledWith("/home/user", "new-folder");
      expect(refresh).toHaveBeenCalled();
    });
  });

  describe("handleRename", () => {
    it("選択中ファイルが renameItem で改名され、選択がクリアされる", async () => {
      const entry = makeEntry({ path: "/home/old.txt", name: "old.txt" });
      useFileStore.setState({
        entries: [entry],
        selectedPaths: new Set(["/home/old.txt"]),
        lastSelectedPath: "/home/old.txt",
      });
      mockRenameItem.mockResolvedValue("/home/new.txt");

      const { handleRename, refresh } = createHandlersFromStores();
      await handleRename("new.txt");

      expect(mockRenameItem).toHaveBeenCalledWith("/home/old.txt", "new.txt");
      expect(refresh).toHaveBeenCalled();
      // 選択がクリアされている
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
    });

    it("選択なし → 何もしない", async () => {
      // selectedPaths は空
      const { handleRename } = createHandlersFromStores();
      await handleRename("new.txt");

      expect(mockRenameItem).not.toHaveBeenCalled();
    });
  });

  describe("handleDelete", () => {
    it("選択中ファイルが deleteItems で削除され、選択がクリアされる", async () => {
      useFileStore.setState({
        selectedPaths: new Set(["/home/a.txt", "/home/b.txt"]),
      });
      mockDeleteItems.mockResolvedValue(undefined);

      const { handleDelete, refresh } = createHandlersFromStores();
      await handleDelete();

      expect(mockDeleteItems).toHaveBeenCalledWith(["/home/a.txt", "/home/b.txt"]);
      expect(refresh).toHaveBeenCalled();
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
    });

    it("選択なし → 何もしない", async () => {
      const { handleDelete, refresh } = createHandlersFromStores();
      await handleDelete();

      expect(mockDeleteItems).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("copyItems 失敗 → console.error、クラッシュしない", async () => {
      useTabStore.getState().addTab("/home/dest");
      useClipboardStore.getState().copy(["/file.txt"]);
      mockCopyItems.mockRejectedValue(new Error("permission denied"));

      const { handlePaste, refresh } = createHandlersFromStores();
      await expect(handlePaste()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith("Paste failed:", expect.any(Error));
      expect(refresh).not.toHaveBeenCalled();
    });

    it("deleteItems 失敗 → 選択はクリアされない", async () => {
      useFileStore.setState({
        selectedPaths: new Set(["/a.txt"]),
      });
      mockDeleteItems.mockRejectedValue(new Error("delete failed"));

      const { handleDelete } = createHandlersFromStores();
      await expect(handleDelete()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith("Delete failed:", expect.any(Error));
      // エラー時は選択がクリアされない
      expect(useFileStore.getState().selectedPaths.size).toBe(1);
    });

    it("openFile 失敗 → console.error、クラッシュしない", async () => {
      mockOpenFile.mockRejectedValue(new Error("open failed"));

      const { handleFileOpen } = createHandlersFromStores();
      await expect(handleFileOpen(makeEntry())).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith("Open file failed:", expect.any(Error));
    });
  });

  describe("ストア状態更新後のハンドラー再生成", () => {
    it("クリップボード更新後、新ハンドラーは最新の値を使う", async () => {
      useTabStore.getState().addTab("/home/dest");
      mockCopyItems.mockResolvedValue(undefined);

      // クリップボード空でハンドラー生成 → paste しても何も起きない
      const handlers1 = createHandlersFromStores();
      await handlers1.handlePaste();
      expect(mockCopyItems).not.toHaveBeenCalled();

      // クリップボードにコピー → 新しいハンドラー生成（React の再レンダーをシミュレート）
      useClipboardStore.getState().copy(["/file.txt"]);
      const handlers2 = createHandlersFromStores();
      await handlers2.handlePaste();

      expect(mockCopyItems).toHaveBeenCalledWith(["/file.txt"], "/home/dest");
    });
  });
});
