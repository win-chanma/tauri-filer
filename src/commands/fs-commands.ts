import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import type { FileEntry } from "../types";

export async function readDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("read_directory", { path });
}

let homeDirCache: string | null = null;

export async function getHomeDir(): Promise<string> {
  if (homeDirCache) return homeDirCache;
  homeDirCache = await invoke<string>("get_home_dir");
  return homeDirCache;
}

export async function copyItems(
  sources: string[],
  destination: string
): Promise<void> {
  return invoke("copy_items", { sources, destination });
}

export async function moveItems(
  sources: string[],
  destination: string
): Promise<void> {
  return invoke("move_items", { sources, destination });
}

export async function deleteItems(paths: string[]): Promise<void> {
  return invoke("delete_items", { paths });
}

export async function renameItem(
  path: string,
  newName: string
): Promise<string> {
  return invoke<string>("rename_item", { path, newName });
}

export async function createDirectory(
  path: string,
  name: string
): Promise<string> {
  return invoke<string>("create_directory", { path, name });
}

export async function searchFiles(
  path: string,
  query: string,
  maxResults?: number
): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("search_files", { path, query, maxResults });
}

export async function readFilePreview(
  path: string,
  maxBytes?: number
): Promise<string> {
  return invoke<string>("read_file_preview", { path, maxBytes });
}

export async function openFile(path: string): Promise<void> {
  return open(path);
}

export async function checkCopyConflicts(
  sources: string[],
  destination: string
): Promise<string[]> {
  return invoke<string[]>("check_copy_conflicts", { sources, destination });
}

export async function copyItemsWithStrategy(
  sources: string[],
  destination: string,
  strategy: string
): Promise<void> {
  return invoke("copy_items_with_strategy", { sources, destination, strategy });
}
