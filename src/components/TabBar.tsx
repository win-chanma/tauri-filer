import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { Plus, X } from "lucide-react";
import { getHomeDir } from "../commands/fs-commands";

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const addTab = useTabStore((s) => s.addTab);
  const loadDirectory = useFileStore((s) => s.loadDirectory);

  const handleTabClick = (id: string, path: string) => {
    setActiveTab(id);
    loadDirectory(path);
  };

  const handleNewTab = async () => {
    const home = await getHomeDir();
    addTab(home);
    loadDirectory(home);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeTab(id);
  };

  return (
    <div className="flex items-center bg-[var(--color-bg-tab-bar)] border-b border-[var(--color-border)] overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-r border-[var(--color-border)] shrink-0 ${
            tab.id === activeTabId
              ? "bg-[var(--color-bg-card)] text-[var(--color-text)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dim)] hover:bg-white/5"
          }`}
          onClick={() => handleTabClick(tab.id, tab.path)}
        >
          <span className="truncate max-w-[120px]">{tab.label}</span>
          {tabs.length > 1 && (
            <X
              size={14}
              className="shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => handleCloseTab(e, tab.id)}
            />
          )}
        </button>
      ))}
      <button
        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-dim)]"
        onClick={handleNewTab}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
