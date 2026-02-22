import { create } from "zustand";
import type { ViewMode } from "../types";

interface UIStore {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  showHidden: boolean;

  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleHidden: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  viewMode: "list",
  sidebarVisible: true,
  showHidden: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleHidden: () => set((s) => ({ showHidden: !s.showHidden })),
}));
