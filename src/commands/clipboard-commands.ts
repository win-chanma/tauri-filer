import { invoke } from "@tauri-apps/api/core";

export interface OsClipboardFiles {
  paths: string[];
  mode: "copy" | "cut";
}

/** OS クリップボードからファイルパスを読み取り */
export async function readClipboardFiles(): Promise<OsClipboardFiles> {
  const [paths, mode] = await invoke<[string[], string]>(
    "read_clipboard_files"
  );
  return { paths, mode: mode as "copy" | "cut" };
}

/** ファイルパスを OS クリップボードに書き込み */
export async function writeClipboardFiles(
  paths: string[],
  mode: "copy" | "cut"
): Promise<void> {
  await invoke("write_clipboard_files", { paths, mode });
}
