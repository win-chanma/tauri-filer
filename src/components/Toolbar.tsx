import { useTabStore } from "../stores/tab-store";
import { useUIStore } from "../stores/ui-store";
import { useNavigation } from "../hooks/use-navigation";
import { AddressBar } from "./AddressBar";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RefreshCw,
  List,
  LayoutGrid,
  PanelLeftClose,
  PanelLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export function Toolbar() {
  const canGoBack = useTabStore((s) => s.canGoBack);
  const canGoForward = useTabStore((s) => s.canGoForward);
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const showHidden = useUIStore((s) => s.showHidden);
  const toggleHidden = useUIStore((s) => s.toggleHidden);
  const { back, forward, up, refresh } = useNavigation();

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#2a2a3a]">
      <NavButton onClick={toggleSidebar} title="Toggle sidebar">
        {sidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
      </NavButton>
      <NavButton onClick={back} disabled={!canGoBack()} title="Back">
        <ArrowLeft size={16} />
      </NavButton>
      <NavButton onClick={forward} disabled={!canGoForward()} title="Forward">
        <ArrowRight size={16} />
      </NavButton>
      <NavButton onClick={up} title="Parent directory">
        <ArrowUp size={16} />
      </NavButton>
      <NavButton onClick={refresh} title="Refresh">
        <RefreshCw size={16} />
      </NavButton>

      <AddressBar />

      <NavButton onClick={toggleHidden} title="Toggle hidden files">
        {showHidden ? <Eye size={16} /> : <EyeOff size={16} />}
      </NavButton>
      <NavButton
        onClick={() => setViewMode("list")}
        active={viewMode === "list"}
        title="List view"
      >
        <List size={16} />
      </NavButton>
      <NavButton
        onClick={() => setViewMode("grid")}
        active={viewMode === "grid"}
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </NavButton>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-slate-200"
      }`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
