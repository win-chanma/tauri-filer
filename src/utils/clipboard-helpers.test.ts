import { describe, expect, it } from "vitest";
import { isCutPath } from "./clipboard-helpers";

describe("isCutPath", () => {
  it("returns false when mode is null", () => {
    expect(isCutPath("/a.txt", ["/a.txt"], null)).toBe(false);
  });

  it("returns false when mode is copy", () => {
    expect(isCutPath("/a.txt", ["/a.txt"], "copy")).toBe(false);
  });

  it("returns false when mode is cut but path does not match", () => {
    expect(isCutPath("/a.txt", ["/b.txt"], "cut")).toBe(false);
  });

  it("returns true when mode is cut and path matches", () => {
    expect(isCutPath("/a.txt", ["/a.txt", "/b.txt"], "cut")).toBe(true);
  });
});
