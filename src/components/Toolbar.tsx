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
  Settings,
} from "lucide-react";

interface ToolbarProps {
  onSettingsOpen?: () => void;
}

export function Toolbar({ onSettingsOpen }: ToolbarProps) {
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
    <div className="flex items-center gap-2 px-4 h-12 border-b border-[var(--color-border)]">
      {/* Navigation group */}
      <div className="flex items-center gap-1">
        <NavButton onClick={toggleSidebar} title="Toggle sidebar">
          {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </NavButton>
        <NavButton onClick={back} disabled={!canGoBack()} title="Back">
          <ArrowLeft size={18} />
        </NavButton>
        <NavButton onClick={forward} disabled={!canGoForward()} title="Forward">
          <ArrowRight size={18} />
        </NavButton>
        <NavButton onClick={up} title="Parent directory">
          <ArrowUp size={18} />
        </NavButton>
        <NavButton onClick={refresh} title="Refresh">
          <RefreshCw size={18} />
        </NavButton>
      </div>

      <AddressBar />

      {/* Action group */}
      <div className="flex items-center gap-1">
        {onSettingsOpen && (
          <NavButton onClick={onSettingsOpen} title="Settings">
            <Settings size={18} />
          </NavButton>
        )}
        <NavButton onClick={toggleHidden} title="Toggle hidden files">
          {showHidden ? <Eye size={18} /> : <EyeOff size={18} />}
        </NavButton>
        <NavButton
          onClick={() => setViewMode("list")}
          active={viewMode === "list"}
          title="List view"
        >
          <List size={18} />
        </NavButton>
        <NavButton
          onClick={() => setViewMode("grid")}
          active={viewMode === "grid"}
          title="Grid view"
        >
          <LayoutGrid size={18} />
        </NavButton>
      </div>
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
      className={`p-2 rounded-lg hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
        active
          ? "text-[var(--color-accent-light)] bg-[var(--color-accent)]/10"
          : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
      }`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
