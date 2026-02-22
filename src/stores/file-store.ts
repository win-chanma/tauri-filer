import { create } from "zustand";
import type { FileEntry, SortConfig } from "../types";
import { readDirectory } from "../commands/fs-commands";

let loadGeneration = 0;

interface FileStore {
  entries: FileEntry[];
  selectedPaths: Set<string>;
  lastSelectedPath: string | null;
  sortConfig: SortConfig;
  loading: boolean;
  error: string | null;

  loadDirectory: (path: string) => Promise<void>;
  setSelectedPaths: (paths: Set<string>) => void;
  toggleSelection: (path: string) => void;
  selectRange: (entries: FileEntry[], targetPath: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSortConfig: (config: SortConfig) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  entries: [],
  selectedPaths: new Set(),
  lastSelectedPath: null,
  sortConfig: { key: "name", order: "asc" },
  loading: false,
  error: null,

  loadDirectory: async (path) => {
    const gen = ++loadGeneration;
    set({ loading: true, error: null, selectedPaths: new Set(), lastSelectedPath: null });
    try {
      const entries = await readDirectory(path);
      // 古いリクエストの結果は無視
      if (gen !== loadGeneration) return;
      set({ entries, loading: false });
    } catch (e) {
      if (gen !== loadGeneration) return;
      set({ entries: [], loading: false, error: String(e) });
    }
  },

  setSelectedPaths: (paths) => {
    const last = Array.from(paths).pop() || null;
    set({ selectedPaths: paths, lastSelectedPath: last });
  },

  toggleSelection: (path) => {
    const { selectedPaths } = get();
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    set({ selectedPaths: next, lastSelectedPath: path });
  },

  selectRange: (entries, targetPath) => {
    const { selectedPaths, lastSelectedPath } = get();
    if (!lastSelectedPath) {
      set({ selectedPaths: new Set([targetPath]), lastSelectedPath: targetPath });
      return;
    }

    const startIdx = entries.findIndex((e) => e.path === lastSelectedPath);
    const endIdx = entries.findIndex((e) => e.path === targetPath);
    if (startIdx === -1 || endIdx === -1) return;

    const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const range = entries.slice(from, to + 1).map((e) => e.path);
    const merged = new Set([...Array.from(selectedPaths), ...range]);
    set({ selectedPaths: merged });
  },

  selectAll: () => {
    const { entries } = get();
    set({ selectedPaths: new Set(entries.map((e) => e.path)) });
  },

  clearSelection: () => set({ selectedPaths: new Set(), lastSelectedPath: null }),

  setSortConfig: (config) => set({ sortConfig: config }),
}));
