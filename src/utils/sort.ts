import type { FileEntry, SortConfig } from "../types";

export function sortEntries(entries: FileEntry[], config: SortConfig): FileEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;

    let cmp = 0;
    switch (config.key) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "size":
        cmp = a.size - b.size;
        break;
      case "modified":
        cmp = (a.modified || "").localeCompare(b.modified || "");
        break;
    }
    return config.order === "asc" ? cmp : -cmp;
  });
  return sorted;
}
