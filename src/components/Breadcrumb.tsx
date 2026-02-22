import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const navigate = useTabStore((s) => s.navigate);
  const loadDirectory = useFileStore((s) => s.loadDirectory);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const parts = activeTab.path.split("/").filter(Boolean);

  const handleClick = (index: number) => {
    const path = "/" + parts.slice(0, index + 1).join("/");
    navigate(path);
    loadDirectory(path);
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-1 text-sm overflow-x-auto">
      <button
        className="text-slate-500 hover:text-slate-200 shrink-0 px-1"
        onClick={() => {
          navigate("/");
          loadDirectory("/");
        }}
      >
        /
      </button>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-0.5 shrink-0">
          <ChevronRight size={12} className="text-slate-600" />
          <button
            className={`hover:text-slate-200 px-0.5 ${
              i === parts.length - 1 ? "text-slate-200" : "text-slate-500"
            }`}
            onClick={() => handleClick(i)}
          >
            {part}
          </button>
        </span>
      ))}
    </div>
  );
}
