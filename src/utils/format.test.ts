import { describe, it, expect } from "vitest";
import { formatFileSize, formatDate } from "./format";

describe("formatFileSize", () => {
  it("0 は '---' を返す", () => {
    expect(formatFileSize(0)).toBe("---");
  });

  it("1B をフォーマットする", () => {
    expect(formatFileSize(1)).toBe("1 B");
  });

  it("512B をフォーマットする", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("1024 は '1.0 KB' を返す", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("1MB をフォーマットする", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
  });

  it("1GB をフォーマットする", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
  });

  it("1TB をフォーマットする", () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe("1.0 TB");
  });

  it("負数の振る舞いを記録する（特徴テスト）", () => {
    // 負数はNaNになる（log of negative）
    const result = formatFileSize(-1);
    expect(result).toBe("NaN undefined");
  });
});

describe("formatDate", () => {
  it("正常な日付文字列をそのまま返す", () => {
    expect(formatDate("2024-01-15 10:30")).toBe("2024-01-15 10:30");
  });

  it("null は '---' を返す", () => {
    expect(formatDate(null)).toBe("---");
  });

  it("空文字は '---' を返す", () => {
    expect(formatDate("")).toBe("---");
  });
});
