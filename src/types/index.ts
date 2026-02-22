export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  isSymlink: boolean;
  isHidden: boolean;
  size: number;
  modified: string | null;
  mimeType: string | null;
}

export type SortKey = "name" | "size" | "modified";
export type SortOrder = "asc" | "desc";
export type ViewMode = "list" | "grid";

export interface TabState {
  id: string;
  path: string;
  label: string;
  history: string[];
  historyIndex: number;
}

export interface SortConfig {
  key: SortKey;
  order: SortOrder;
}
