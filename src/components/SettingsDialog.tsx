import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUIStore } from "../stores/ui-store";
import {
  X,
  List,
  LayoutGrid,
  ChevronDown,
  Monitor,
  Globe,
  Palette,
  TerminalSquare,
} from "lucide-react";
import type { Language, ThemeId } from "../types";
import { themeList } from "../themes";

type SectionId = "display" | "theme" | "language" | "terminal";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { t } = useTranslation();
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const showHidden = useUIStore((s) => s.showHidden);
  const toggleHidden = useUIStore((s) => s.toggleHidden);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const themeId = useUIStore((s) => s.themeId);
  const setTheme = useUIStore((s) => s.setTheme);
  const terminalShellPath = useUIStore((s) => s.terminalShellPath);
  const setTerminalShellPath = useUIStore((s) => s.setTerminalShellPath);
  const terminalFontSize = useUIStore((s) => s.terminalFontSize);
  const setTerminalFontSize = useUIStore((s) => s.setTerminalFontSize);
  const terminalPadding = useUIStore((s) => s.terminalPadding);
  const setTerminalPadding = useUIStore((s) => s.setTerminalPadding);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("display");

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
      setActiveSection("display");
    }
  }, [open]);

  if (!open) return null;

  const sections: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    {
      id: "display",
      label: t("settings.sectionDisplay"),
      icon: <Monitor size={16} />,
    },
    {
      id: "theme",
      label: t("settings.sectionTheme"),
      icon: <Palette size={16} />,
    },
    {
      id: "language",
      label: t("settings.sectionLanguage"),
      icon: <Globe size={16} />,
    },
    {
      id: "terminal",
      label: t("settings.sectionTerminal"),
      icon: <TerminalSquare size={16} />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-[fade-in_150ms_ease-out]"
      data-testid="settings-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="bg-[var(--color-bg-card)] rounded-xl w-[800px] max-w-[90vw] h-[520px] max-h-[85vh] flex flex-col shadow-2xl shadow-black/40 animate-[dialog-in_200ms_ease-out] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-8 border-b border-[var(--color-border)] shrink-0">
          <h2
            id="settings-title"
            className="text-[15px] font-semibold text-[var(--color-text)]"
          >
            {t("settings.title")}
          </h2>
          <button
            className="p-2 -mr-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            onClick={onClose}
            title={t("settings.close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Two-pane body */}
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar */}
          <nav className="w-[200px] shrink-0 border-r border-[var(--color-border)] py-4 px-5">
            <ul className="space-y-0.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                      activeSection === section.id
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
                    }`}
                  >
                    {section.icon}
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right content pane */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {activeSection === "display" && (
              <SettingsPane title={t("settings.sectionDisplay")}>
                <SettingRow
                  label={t("settings.showHidden")}
                  description={t("settings.showHiddenDesc")}
                >
                  <ToggleSwitch
                    checked={showHidden}
                    onChange={toggleHidden}
                    aria-label="Show hidden files"
                  />
                </SettingRow>

                <SettingRow
                  label={t("settings.sidebar")}
                  description={t("settings.sidebarDesc")}
                >
                  <ToggleSwitch
                    checked={sidebarVisible}
                    onChange={toggleSidebar}
                    aria-label="Sidebar visible"
                  />
                </SettingRow>

                <SettingRow
                  label={t("settings.viewMode")}
                  description={t("settings.viewModeDesc")}
                >
                  <SegmentedControl>
                    <SegmentedButton
                      label={t("settings.viewList")}
                      icon={<List size={15} />}
                      active={viewMode === "list"}
                      onClick={() => setViewMode("list")}
                    />
                    <SegmentedButton
                      label={t("settings.viewGrid")}
                      icon={<LayoutGrid size={15} />}
                      active={viewMode === "grid"}
                      onClick={() => setViewMode("grid")}
                    />
                  </SegmentedControl>
                </SettingRow>
              </SettingsPane>
            )}

            {activeSection === "theme" && (
              <SettingsPane title={t("settings.sectionTheme")}>
                <div className="grid grid-cols-3 gap-3 p-4">
                  {themeList.map((theme) => (
                    <ThemeSwatch
                      key={theme.id}
                      themeId={theme.id}
                      name={language === "ja" ? theme.nameJa : theme.name}
                      preview={theme.preview}
                      active={themeId === theme.id}
                      onClick={() => setTheme(theme.id)}
                    />
                  ))}
                </div>
              </SettingsPane>
            )}

            {activeSection === "language" && (
              <SettingsPane title={t("settings.sectionLanguage")}>
                <SettingRow
                  label={t("settings.language")}
                  description={t("settings.languageDesc")}
                >
                  <LanguageSelect
                    value={language}
                    onChange={(lang) => setLanguage(lang)}
                  />
                </SettingRow>
              </SettingsPane>
            )}

            {activeSection === "terminal" && (
              <SettingsPane title={t("settings.sectionTerminal")}>
                <SettingRow
                  label={t("settings.terminalShellPath")}
                  description={t("settings.terminalShellPathDesc")}
                >
                  <input
                    type="text"
                    value={terminalShellPath}
                    onChange={(e) => setTerminalShellPath(e.target.value)}
                    placeholder={t("settings.terminalShellPathPlaceholder")}
                    className="w-[200px] h-9 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3.5 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                  />
                </SettingRow>

                <SettingRow
                  label={t("settings.terminalFontSize")}
                  description={t("settings.terminalFontSizeDesc")}
                >
                  <input
                    type="number"
                    value={terminalFontSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val >= 8 && val <= 32) {
                        setTerminalFontSize(val);
                      }
                    }}
                    min={8}
                    max={32}
                    className="w-[80px] h-9 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3.5 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-center"
                  />
                </SettingRow>

                <SettingRow
                  label={t("settings.terminalPadding")}
                  description={t("settings.terminalPaddingDesc")}
                >
                  <input
                    type="number"
                    value={terminalPadding}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val >= 0 && val <= 32) {
                        setTerminalPadding(val);
                      }
                    }}
                    min={0}
                    max={32}
                    className="w-[80px] h-9 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3.5 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-center"
                  />
                </SettingRow>
              </SettingsPane>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPane({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mb-4">
        {title}
      </h3>
      <div className="divide-y divide-[var(--color-border)]/50">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 rounded-lg hover:bg-[var(--color-bg-hover)]/50 transition-colors duration-150 px-4">
      <div className="flex flex-col gap-1 min-w-0 mr-8">
        <span className="text-[14px] font-medium text-[var(--color-text)]">
          {label}
        </span>
        {description && (
          <span className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed">
            {description}
          </span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  "aria-label": string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative w-12 h-[26px] rounded-full p-[3px] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)] outline-none ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
      }`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SegmentedControl({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex bg-[var(--color-bg)] rounded-lg p-1 gap-1 w-[160px]"
      role="radiogroup"
    >
      {children}
    </div>
  );
}

function SegmentedButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 ${
        active
          ? "bg-[var(--color-accent)] text-white shadow-sm"
          : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LanguageSelect({
  value,
  onChange,
}: {
  value: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        aria-label="Language"
        className="appearance-none w-[160px] h-9 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg pl-3.5 pr-8 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors cursor-pointer"
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
      />
    </div>
  );
}

function ThemeSwatch({
  themeId: _id,
  name,
  preview,
  active,
  onClick,
}: {
  themeId: ThemeId;
  name: string;
  preview: [string, string, string];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors ${
        active
          ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
          : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
      }`}
      onClick={onClick}
    >
      <div className="flex w-full h-6 rounded overflow-hidden">
        <div className="flex-1" style={{ background: preview[0] }} />
        <div className="flex-1" style={{ background: preview[1] }} />
        <div className="flex-1" style={{ background: preview[2] }} />
      </div>
      <span className="text-xs text-[var(--color-text-dim)] truncate w-full text-center">
        {name}
      </span>
    </button>
  );
}
