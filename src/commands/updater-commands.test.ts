import { describe, it, expect, vi } from "vitest";

const mockCheck = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: mockCheck,
}));

import { checkForUpdate } from "./updater-commands";

describe("checkForUpdate", () => {
  it("更新がある場合 Update オブジェクトを返す", async () => {
    const fakeUpdate = {
      version: "1.0.0",
      body: "release notes",
      downloadAndInstall: vi.fn(),
    };
    mockCheck.mockResolvedValue(fakeUpdate);

    const result = await checkForUpdate();
    expect(result).toBe(fakeUpdate);
    expect(mockCheck).toHaveBeenCalled();
  });

  it("更新がない場合 null を返す", async () => {
    mockCheck.mockResolvedValue(null);

    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it("エラーをそのまま投げる", async () => {
    mockCheck.mockRejectedValue(new Error("network error"));

    await expect(checkForUpdate()).rejects.toThrow("network error");
  });
});
