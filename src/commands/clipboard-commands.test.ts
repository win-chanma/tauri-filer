import { describe, it, expect, vi } from "vitest";

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

import { readClipboardFiles, writeClipboardFiles } from "./clipboard-commands";

describe("readClipboardFiles", () => {
  it("OS クリップボードからファイルパスと mode を読み取る", async () => {
    mockInvoke.mockResolvedValue([
      ["C:\\Users\\test\\file.txt", "C:\\Users\\test\\image.png"],
      "copy",
    ]);

    const result = await readClipboardFiles();
    expect(result.paths).toEqual([
      "C:\\Users\\test\\file.txt",
      "C:\\Users\\test\\image.png",
    ]);
    expect(result.mode).toBe("copy");
    expect(mockInvoke).toHaveBeenCalledWith("read_clipboard_files");
  });

  it("cut モードを正しく判定する", async () => {
    mockInvoke.mockResolvedValue([["C:\\temp\\file.txt"], "cut"]);

    const result = await readClipboardFiles();
    expect(result.mode).toBe("cut");
  });

  it("クリップボードが空の場合は空配列を返す", async () => {
    mockInvoke.mockResolvedValue([[], "copy"]);

    const result = await readClipboardFiles();
    expect(result.paths).toEqual([]);
  });
});

describe("writeClipboardFiles", () => {
  it("ファイルパスを OS クリップボードに書き込む", async () => {
    mockInvoke.mockResolvedValue(undefined);

    await writeClipboardFiles(
      ["C:\\Users\\test\\file.txt"],
      "copy"
    );
    expect(mockInvoke).toHaveBeenCalledWith("write_clipboard_files", {
      paths: ["C:\\Users\\test\\file.txt"],
      mode: "copy",
    });
  });

  it("cut モードで書き込む", async () => {
    mockInvoke.mockResolvedValue(undefined);

    await writeClipboardFiles(
      ["C:\\Users\\test\\file.txt"],
      "cut"
    );
    expect(mockInvoke).toHaveBeenCalledWith("write_clipboard_files", {
      paths: ["C:\\Users\\test\\file.txt"],
      mode: "cut",
    });
  });
});
