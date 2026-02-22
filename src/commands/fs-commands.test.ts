import { describe, it, expect, vi } from "vitest";

vi.mock("@tauri-apps/plugin-opener", () => ({
  openPath: vi.fn(),
}));

import { openFile } from "./fs-commands";
import { openPath } from "@tauri-apps/plugin-opener";

const mockOpenPath = vi.mocked(openPath);

describe("openFile", () => {
  it("openPath を呼び出す", async () => {
    mockOpenPath.mockResolvedValue(undefined);
    await openFile("/home/user/document.pdf");
    expect(mockOpenPath).toHaveBeenCalledWith("/home/user/document.pdf");
  });

  it("openPath のエラーをそのまま投げる", async () => {
    mockOpenPath.mockRejectedValue(new Error("failed to open"));
    await expect(openFile("/bad/path")).rejects.toThrow("failed to open");
  });
});
