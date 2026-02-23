import { useTranslation } from "react-i18next";
import { useUIStore } from "../stores/ui-store";
import { X, List, LayoutGrid, ChevronDown } from "lucide-react";
import type { Language } from "../types";

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      data-testid="settings-overlay"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl w-[480px] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-5 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">{t("settings.title")}</h2>
          <button
            className="p-1.5 -mr-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            onClick={onClose}
            title={t("settings.close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Display section */}
          <SettingsSection title={t("settings.sectionDisplay")}>
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
                  icon={<List size={14} />}
                  active={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                />
                <SegmentedButton
                  label={t("settings.viewGrid")}
                  icon={<LayoutGrid size={14} />}
                  active={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                />
              </SegmentedControl>
            </SettingRow>
          </SettingsSection>

          {/* Language section */}
          <SettingsSection title={t("settings.sectionLanguage")}>
            <SettingRow
              label={t("settings.language")}
              description={t("settings.languageDesc")}
            >
              <LanguageSelect
                value={language}
                onChange={(lang) => setLanguage(lang)}
              />
            </SettingRow>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2 px-1">
        {title}
      </h3>
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]">
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
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-card)]">
      <div className="flex flex-col gap-0.5 min-w-0 mr-4">
        <span className="text-[13px] font-medium text-[var(--color-text)]">{label}</span>
        {description && (
          <span className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{description}</span>
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
      className={`relative w-10 h-[22px] rounded-full p-[2px] transition-colors duration-200 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
      }`}
    >
      <span
        className={`block w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SegmentedControl({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex rounded-md overflow-hidden border border-[var(--color-border)]"
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
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
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
        className="appearance-none bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md pl-3 pr-7 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors cursor-pointer"
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
      />
    </div>
  );
}
