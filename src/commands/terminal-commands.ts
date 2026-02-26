import { invoke } from "@tauri-apps/api/core";

export async function terminalSpawn(options?: {
  cwd?: string;
  shell?: string;
  cols?: number;
  rows?: number;
}): Promise<number> {
  return invoke<number>("terminal_spawn", {
    cwd: options?.cwd ?? null,
    shell: options?.shell ?? null,
    cols: options?.cols ?? null,
    rows: options?.rows ?? null,
  });
}

export async function terminalWrite(
  sessionId: number,
  data: string
): Promise<void> {
  return invoke("terminal_write", { sessionId, data });
}

export async function terminalResize(
  sessionId: number,
  cols: number,
  rows: number
): Promise<void> {
  return invoke("terminal_resize", { sessionId, cols, rows });
}

export async function terminalKill(sessionId: number): Promise<void> {
  return invoke("terminal_kill", { sessionId });
}
