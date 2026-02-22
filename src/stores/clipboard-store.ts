import { create } from "zustand";

type ClipboardMode = "copy" | "cut" | null;

interface ClipboardStore {
  paths: string[];
  mode: ClipboardMode;
  copy: (paths: string[]) => void;
  cut: (paths: string[]) => void;
  clear: () => void;
}

export const useClipboardStore = create<ClipboardStore>((set) => ({
  paths: [],
  mode: null,

  copy: (paths) => set({ paths, mode: "copy" }),
  cut: (paths) => set({ paths, mode: "cut" }),
  clear: () => set({ paths: [], mode: null }),
}));
