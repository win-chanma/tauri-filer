/**
 * コンテキストメニュー操作のフローテスト
 *
 * ユーザーが実際に行う操作手順を再現し、
 * ストア状態の遷移と Tauri コマンド呼び出しを検証する。
 * Tauri バックエンド（invoke）のみモック、Zustand ストアは実物。
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

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

import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { useClipboardStore } from "../stores/clipboard-store";
import { createContextMenuHandlers } from "./context-menu-handlers";
import {
  createDirectory,
  renameItem,
  deleteItems,
  copyItems,
  moveItems,
  openFile,
} from "../commands/fs-commands";
import type { FileEntry } from "../types";

const mockCopyItems = vi.mocked(copyItems);
const mockMoveItems = vi.mocked(moveItems);
const mockDeleteItems = vi.mocked(deleteItems);
const mockCreateDirectory = vi.mocked(createDirectory);
const mockRenameItem = vi.mocked(renameItem);

function makeEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    name: "file.txt",
    path: "/home/user/file.txt",
    isDir: false,
    isSymlink: false,
    isHidden: false,
    size: 100,
    modified: "2026-01-01 00:00",
    mimeType: "text/plain",
    ...overrides,
  };
}

/**
 * AppLayout と同じ配線でハンドラーを生成する。
 * React の再レンダーをシミュレートするため、呼ぶたびに最新ストア状態を反映する。
 */
function createHandlers() {
  const clipState = useClipboardStore.getState();
  const navigateTo = vi.fn<(path: string) => void>();
  const refresh = vi.fn<() => void>();

  const handlers = createContextMenuHandlers({
    getActiveTabPath: () => {
      const { tabs, activeTabId } = useTabStore.getState();
      return tabs.find((t) => t.id === activeTabId)?.path ?? null;
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

describe("コンテキストメニュー操作フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe("ファイルをコピーして別フォルダに貼り付け", () => {
    it("コピー → フォルダ移動 → ペースト → ファイルがコピーされる", async () => {
      mockCopyItems.mockResolvedValue(undefined);

      // 1. /home/src フォルダにいる。ファイル一覧がある
      useTabStore.getState().addTab("/home/src");
      const file = makeEntry({ name: "photo.jpg", path: "/home/src/photo.jpg" });
      useFileStore.setState({ entries: [file] });

      // 2. ユーザーがファイルを右クリック → 選択される
      useFileStore.getState().setSelectedPaths(new Set(["/home/src/photo.jpg"]));

      // 3. コンテキストメニューから「コピー」をクリック
      useClipboardStore.getState().copy(Array.from(useFileStore.getState().selectedPaths));

      // 検証: クリップボードにパスがセットされている
      expect(useClipboardStore.getState().paths).toEqual(["/home/src/photo.jpg"]);
      expect(useClipboardStore.getState().mode).toBe("copy");

      // 4. /home/dest フォルダに移動（タブのパスが変わる）
      useTabStore.getState().navigate("/home/dest");

      // 5. 右クリック → 「貼り付け」をクリック（React 再レンダーをシミュレート）
      const { handlePaste, refresh } = createHandlers();
      await handlePaste();

      // 検証: copyItems が正しいソースとデスティネーションで呼ばれた
      expect(mockCopyItems).toHaveBeenCalledWith(["/home/src/photo.jpg"], "/home/dest");
      expect(refresh).toHaveBeenCalled();

      // 検証: コピーモードではクリップボードが維持される（何度でも貼り付け可能）
      expect(useClipboardStore.getState().paths).toEqual(["/home/src/photo.jpg"]);
      expect(useClipboardStore.getState().mode).toBe("copy");
    });
  });

  describe("ファイルを切り取って別フォルダに貼り付け", () => {
    it("切り取り → フォルダ移動 → ペースト → ファイルが移動しクリップボードがクリアされる", async () => {
      mockMoveItems.mockResolvedValue(undefined);

      // 1. ファイルを選択
      useTabStore.getState().addTab("/home/src");
      useFileStore.setState({
        entries: [makeEntry({ name: "doc.pdf", path: "/home/src/doc.pdf" })],
      });
      useFileStore.getState().setSelectedPaths(new Set(["/home/src/doc.pdf"]));

      // 2. 「切り取り」
      useClipboardStore.getState().cut(Array.from(useFileStore.getState().selectedPaths));

      // 3. 移動先に移動
      useTabStore.getState().navigate("/home/dest");

      // 4. 「貼り付け」
      const { handlePaste, refresh } = createHandlers();
      await handlePaste();

      // 検証: moveItems が呼ばれた
      expect(mockMoveItems).toHaveBeenCalledWith(["/home/src/doc.pdf"], "/home/dest");
      expect(refresh).toHaveBeenCalled();

      // 検証: 切り取りモードではクリップボードがクリアされる（二重移動防止）
      expect(useClipboardStore.getState().paths).toEqual([]);
      expect(useClipboardStore.getState().mode).toBeNull();
    });
  });

  describe("複数ファイルを選択してコピー", () => {
    it("Ctrl+クリックで複数選択 → コピー → ペースト", async () => {
      mockCopyItems.mockResolvedValue(undefined);

      useTabStore.getState().addTab("/home/src");
      const files = [
        makeEntry({ name: "a.txt", path: "/home/src/a.txt" }),
        makeEntry({ name: "b.txt", path: "/home/src/b.txt" }),
        makeEntry({ name: "c.txt", path: "/home/src/c.txt" }),
      ];
      useFileStore.setState({ entries: files });

      // Ctrl+クリックで複数選択をシミュレート
      useFileStore.getState().setSelectedPaths(new Set(["/home/src/a.txt", "/home/src/c.txt"]));

      // コピー
      useClipboardStore.getState().copy(Array.from(useFileStore.getState().selectedPaths));

      // 移動 → ペースト
      useTabStore.getState().navigate("/home/dest");
      const { handlePaste } = createHandlers();
      await handlePaste();

      // 検証: 2ファイルがコピーされた
      const calledPaths = mockCopyItems.mock.calls[0][0];
      expect(calledPaths).toHaveLength(2);
      expect(calledPaths).toContain("/home/src/a.txt");
      expect(calledPaths).toContain("/home/src/c.txt");
      expect(mockCopyItems.mock.calls[0][1]).toBe("/home/dest");
    });
  });

  describe("新規フォルダ作成", () => {
    it("コンテキストメニューから新規フォルダを作成", async () => {
      mockCreateDirectory.mockResolvedValue("/home/user/新しいフォルダ");

      useTabStore.getState().addTab("/home/user");

      const { handleCreateFolder, refresh } = createHandlers();
      await handleCreateFolder("新しいフォルダ");

      expect(mockCreateDirectory).toHaveBeenCalledWith("/home/user", "新しいフォルダ");
      expect(refresh).toHaveBeenCalled();
    });
  });

  describe("ファイル名変更", () => {
    it("ファイルを選択 → リネーム → 選択がクリアされる", async () => {
      mockRenameItem.mockResolvedValue("/home/user/new-name.txt");

      useTabStore.getState().addTab("/home/user");
      const file = makeEntry({ name: "old-name.txt", path: "/home/user/old-name.txt" });
      useFileStore.setState({
        entries: [file],
        selectedPaths: new Set(["/home/user/old-name.txt"]),
        lastSelectedPath: "/home/user/old-name.txt",
      });

      const { handleRename, refresh } = createHandlers();
      await handleRename("new-name.txt");

      expect(mockRenameItem).toHaveBeenCalledWith("/home/user/old-name.txt", "new-name.txt");
      expect(refresh).toHaveBeenCalled();
      // リネーム後は選択がクリアされる
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
    });
  });

  describe("ファイル削除", () => {
    it("複数選択 → 削除 → 選択がクリアされる", async () => {
      mockDeleteItems.mockResolvedValue(undefined);

      useTabStore.getState().addTab("/home/user");
      useFileStore.setState({
        selectedPaths: new Set(["/home/user/a.txt", "/home/user/b.txt"]),
      });

      const { handleDelete, refresh } = createHandlers();
      await handleDelete();

      const calledPaths = mockDeleteItems.mock.calls[0][0];
      expect(calledPaths).toHaveLength(2);
      expect(calledPaths).toContain("/home/user/a.txt");
      expect(calledPaths).toContain("/home/user/b.txt");
      expect(refresh).toHaveBeenCalled();
      expect(useFileStore.getState().selectedPaths.size).toBe(0);
    });
  });

  describe("コピー後に同じフォルダで貼り付け（同一フォルダ内コピー）", () => {
    it("コピー元と貼り付け先が同じフォルダの場合も copyItems が呼ばれる", async () => {
      mockCopyItems.mockResolvedValue(undefined);

      useTabStore.getState().addTab("/home/user");
      useFileStore.setState({
        entries: [makeEntry({ path: "/home/user/file.txt" })],
        selectedPaths: new Set(["/home/user/file.txt"]),
      });

      useClipboardStore.getState().copy(["/home/user/file.txt"]);

      // 同じフォルダで貼り付け（フォルダ移動なし）
      const { handlePaste } = createHandlers();
      await handlePaste();

      // バックエンドに委任（重複名の処理はRust側の責務）
      expect(mockCopyItems).toHaveBeenCalledWith(["/home/user/file.txt"], "/home/user");
    });
  });

  describe("ペースト失敗時のフロー", () => {
    it("copyItems が失敗してもクリップボードは維持され、クラッシュしない", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockCopyItems.mockRejectedValue(new Error("disk full"));

      useTabStore.getState().addTab("/home/dest");
      useClipboardStore.getState().copy(["/home/src/file.txt"]);

      const { handlePaste, refresh } = createHandlers();
      await handlePaste();

      // エラー時: refresh は呼ばれない
      expect(refresh).not.toHaveBeenCalled();
      // エラー時: クリップボードは維持される（リトライ可能）
      expect(useClipboardStore.getState().paths).toEqual(["/home/src/file.txt"]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
