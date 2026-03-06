import { invoke } from "@tauri-apps/api/core";
import { check, type Update } from "@tauri-apps/plugin-updater";

export type { Update };

/** Lightweight version check via custom Rust command (no UI freeze) */
export async function checkUpdateVersion(): Promise<string | null> {
  return await invoke<string | null>("check_update_version");
}

/** Full updater check — only call when user wants to install */
export async function checkForUpdate(): Promise<Update | null> {
  return await check();
}
