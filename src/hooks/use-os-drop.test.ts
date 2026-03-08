import { describe, it, expect } from "vitest";
import { isDropFromSameFolder } from "./use-os-drop";

describe("isDropFromSameFolder", () => {
  it("同一フォルダからのドロップを検出する", () => {
    expect(
      isDropFromSameFolder(["C:/Users/test/file.txt"], "C:/Users/test")
    ).toBe(true);
  });

  it("バックスラッシュのパスでも検出する", () => {
    expect(
      isDropFromSameFolder(["C:\\Users\\test\\file.txt"], "C:\\Users\\test")
    ).toBe(true);
  });

  it("大文字小文字が異なっても検出する", () => {
    expect(
      isDropFromSameFolder(["C:/USERS/Test/file.txt"], "c:/users/test")
    ).toBe(true);
  });

  it("末尾スラッシュがあっても検出する", () => {
    expect(
      isDropFromSameFolder(["C:/Users/test/file.txt"], "C:/Users/test/")
    ).toBe(true);
  });

  it("異なるフォルダからのドロップはfalse", () => {
    expect(
      isDropFromSameFolder(["C:/Users/other/file.txt"], "C:/Users/test")
    ).toBe(false);
  });

  it("複数ファイルが全て同一フォルダならtrue", () => {
    expect(
      isDropFromSameFolder(
        ["C:/Users/test/a.txt", "C:/Users/test/b.txt"],
        "C:/Users/test"
      )
    ).toBe(true);
  });

  it("複数ファイルのうち1つが別フォルダならfalse", () => {
    expect(
      isDropFromSameFolder(
        ["C:/Users/test/a.txt", "C:/Users/other/b.txt"],
        "C:/Users/test"
      )
    ).toBe(false);
  });

  it("空の配列はtrue（コピー不要）", () => {
    expect(isDropFromSameFolder([], "C:/Users/test")).toBe(true);
  });
});
