import { invoke } from "@tauri-apps/api/core";
import type { FileEntry } from "../types";

export async function readDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("read_directory", { path });
}

export async function getHomeDir(): Promise<string> {
  return invoke<string>("get_home_dir");
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
