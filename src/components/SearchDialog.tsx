import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { searchFiles } from "../commands/fs-commands";
import { useTabStore } from "../stores/tab-store";
import { useNavigation } from "../hooks/use-navigation";
import { FileIcon } from "./FileIcon";
import type { FileEntry } from "../types";
import { Search, Loader2 } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const { navigateTo } = useNavigation();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !activeTab) return;

    setSearching(true);
    try {
      const res = await searchFiles(activeTab.path, trimmed, 100);
      setResults(res);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (entry: FileEntry) => {
    if (entry.isDir) {
      navigateTo(entry.path);
    } else {
      const parent = entry.path.replace(/\/[^/]+$/, "");
      navigateTo(parent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl w-[500px] max-h-[60vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <Search size={16} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <Loader2 size={16} className="text-[var(--color-accent-light)] animate-spin" />}
        </form>

        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !searching && query && (
            <div className="text-sm text-[var(--color-text-muted)] text-center py-8">
              {t("search.noResults")}
            </div>
          )}
          {results.map((entry) => (
            <button
              key={entry.path}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-white/5"
              onClick={() => handleResultClick(entry)}
            >
              <FileIcon entry={entry} />
              <div className="min-w-0 flex-1">
                <div className="text-[var(--color-text)] truncate">{entry.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">{entry.path}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
