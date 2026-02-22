import { describe, it, expect, vi } from "vitest";

vi.mock("@tauri-apps/plugin-shell", () => ({
  open: vi.fn(),
}));

import { openFile } from "./fs-commands";
import { open } from "@tauri-apps/plugin-shell";

const mockOpen = vi.mocked(open);

describe("openFile", () => {
  it("shell の open を呼び出す", async () => {
    mockOpen.mockResolvedValue(undefined);
    await openFile("/home/user/document.pdf");
    expect(mockOpen).toHaveBeenCalledWith("/home/user/document.pdf");
  });

  it("open のエラーをそのまま投げる", async () => {
    mockOpen.mockRejectedValue(new Error("failed to open"));
    await expect(openFile("/bad/path")).rejects.toThrow("failed to open");
  });
});
