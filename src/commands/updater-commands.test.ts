import { describe, it, expect, vi } from "vitest";

const mockCheck = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: mockCheck,
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

import { checkForUpdate, checkUpdateVersion } from "./updater-commands";

describe("checkUpdateVersion", () => {
  it("新しいバージョンがある場合バージョン文字列を返す", async () => {
    mockInvoke.mockResolvedValue("0.3.0");

    const result = await checkUpdateVersion();
    expect(result).toBe("0.3.0");
    expect(mockInvoke).toHaveBeenCalledWith("check_update_version");
  });

  it("更新がない場合 null を返す", async () => {
    mockInvoke.mockResolvedValue(null);

    const result = await checkUpdateVersion();
    expect(result).toBeNull();
  });
});

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
