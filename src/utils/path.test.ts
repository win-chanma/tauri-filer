import { describe, it, expect } from "vitest";
import { getParentPath, getPathLabel, isRootPath } from "./path";

describe("getParentPath", () => {
  it("Unix パスの親を返す", () => {
    expect(getParentPath("/home/user/docs")).toBe("/home/user");
  });

  it("Unix ルートでは null を返す", () => {
    expect(getParentPath("/")).toBe(null);
  });

  it("Unix 2階層目の親はルート", () => {
    expect(getParentPath("/home")).toBe("/");
  });

  it("Windows パスの親を返す", () => {
    expect(getParentPath("C:\\Users\\foo\\bar")).toBe("C:\\Users\\foo");
  });

  it("Windows ドライブルートでは null を返す", () => {
    expect(getParentPath("C:\\")).toBe(null);
  });

  it("Windows 2階層目の親はドライブルート", () => {
    expect(getParentPath("C:\\Users")).toBe("C:\\");
  });

  it("末尾スラッシュを無視する（Unix）", () => {
    expect(getParentPath("/home/user/")).toBe("/home");
  });

  it("末尾バックスラッシュを無視する（Windows）", () => {
    expect(getParentPath("C:\\Users\\foo\\")).toBe("C:\\Users");
  });
});

describe("getPathLabel", () => {
  it("Unix パスの最後のセグメントを返す", () => {
    expect(getPathLabel("/home/user/docs")).toBe("docs");
  });

  it("Unix ルートでは '/' を返す", () => {
    expect(getPathLabel("/")).toBe("/");
  });

  it("Windows パスの最後のセグメントを返す", () => {
    expect(getPathLabel("C:\\Users\\foo\\bar")).toBe("bar");
  });

  it("Windows ドライブルートではドライブ名を返す", () => {
    expect(getPathLabel("C:\\")).toBe("C:\\");
  });
});

describe("isRootPath", () => {
  it("Unix ルートを判定する", () => {
    expect(isRootPath("/")).toBe(true);
  });

  it("Unix 非ルートは false", () => {
    expect(isRootPath("/home")).toBe(false);
  });

  it("Windows ドライブルートを判定する", () => {
    expect(isRootPath("C:\\")).toBe(true);
  });

  it("Windows 非ルートは false", () => {
    expect(isRootPath("C:\\Users")).toBe(false);
  });
});
