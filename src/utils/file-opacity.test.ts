import { describe, expect, it } from "vitest";
import { getFileOpacity } from "./file-opacity";

describe("getFileOpacity", () => {
  it("returns undefined for normal file", () => {
    expect(getFileOpacity({ isHidden: false, isCut: false })).toBeUndefined();
  });

  it("returns opacity-[0.55] for hidden file", () => {
    expect(getFileOpacity({ isHidden: true, isCut: false })).toBe(
      "opacity-[0.55]"
    );
  });

  it("returns opacity-[0.4] for cut file", () => {
    expect(getFileOpacity({ isHidden: false, isCut: true })).toBe(
      "opacity-[0.4]"
    );
  });

  it("returns opacity-[0.22] for hidden + cut file", () => {
    expect(getFileOpacity({ isHidden: true, isCut: true })).toBe(
      "opacity-[0.22]"
    );
  });
});
