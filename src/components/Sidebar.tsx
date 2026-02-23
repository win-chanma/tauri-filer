import { useTranslation } from "react-i18next";
import { useTabStore } from "../stores/tab-store";
import { useNavigation } from "../hooks/use-navigation";
import {
  Home,
  Monitor,
  FileText,
  Download,
  ImageIcon,
  HardDrive,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getHomeDir } from "../commands/fs-commands";

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const { t } = useTranslation();
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const { navigateTo } = useNavigation();
  const [homeDir, setHomeDir] = useState("/home");

  useEffect(() => {
    getHomeDir().then(setHomeDir).catch(() => {});
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentPath = activeTab?.path || "";

  const items: SidebarItem[] = [
    { label: t("sidebar.home"), path: homeDir, icon: <Home size={16} /> },
    { label: t("sidebar.desktop"), path: `${homeDir}/Desktop`, icon: <Monitor size={16} /> },
    { label: t("sidebar.documents"), path: `${homeDir}/Documents`, icon: <FileText size={16} /> },
    { label: t("sidebar.downloads"), path: `${homeDir}/Downloads`, icon: <Download size={16} /> },
    { label: t("sidebar.pictures"), path: `${homeDir}/Pictures`, icon: <ImageIcon size={16} /> },
  ];

  const drives: SidebarItem[] = [
    { label: "/", path: "/", icon: <HardDrive size={16} /> },
  ];

  const handleClick = (path: string) => {
    navigateTo(path);
  };

  return (
    <aside className="w-[180px] shrink-0 border-r border-[#2a2a3a] py-2 overflow-y-auto">
      <div className="px-3 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
          {t("sidebar.places")}
        </span>
      </div>
      {items.map((item) => (
        <button
          key={item.path}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-white/5 ${
            currentPath === item.path
              ? "text-indigo-400 bg-indigo-500/10"
              : "text-slate-400"
          }`}
          onClick={() => handleClick(item.path)}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </button>
      ))}

      <div className="px-3 mt-4 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
          {t("sidebar.drives")}
        </span>
      </div>
      {drives.map((item) => (
        <button
          key={item.path}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-white/5 ${
            currentPath === item.path
              ? "text-indigo-400 bg-indigo-500/10"
              : "text-slate-400"
          }`}
          onClick={() => handleClick(item.path)}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
