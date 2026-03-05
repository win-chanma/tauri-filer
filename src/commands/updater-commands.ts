import { check, type Update } from "@tauri-apps/plugin-updater";

export type { Update };

export async function checkForUpdate(): Promise<Update | null> {
  return await check();
}
