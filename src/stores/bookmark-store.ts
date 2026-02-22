import { create } from "zustand";

interface Bookmark {
  label: string;
  path: string;
}

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (label: string, path: string) => void;
  removeBookmark: (path: string) => void;
}

const STORAGE_KEY = "tauri-filer-bookmarks";

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: loadBookmarks(),

  addBookmark: (label, path) => {
    set((s) => {
      if (s.bookmarks.some((b) => b.path === path)) return s;
      const next = [...s.bookmarks, { label, path }];
      saveBookmarks(next);
      return { bookmarks: next };
    });
  },

  removeBookmark: (path) => {
    set((s) => {
      const next = s.bookmarks.filter((b) => b.path !== path);
      saveBookmarks(next);
      return { bookmarks: next };
    });
  },
}));
