import { useTranslation } from "react-i18next";
import { useUIStore } from "../stores/ui-store";
import { X, List, LayoutGrid } from "lucide-react";
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

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="settings-overlay"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl w-[520px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text)]">{t("settings.title")}</h2>
          <button
            className="p-2 -mr-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            onClick={onClose}
            title={t("settings.close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Display section */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
              {t("settings.sectionDisplay")}
            </h3>

            <div className="rounded-lg border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]">
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
                <div
                  className="flex rounded-lg overflow-hidden border border-[var(--color-border)]"
                  role="radiogroup"
                >
                  <ViewModeButton
                    label={t("settings.viewList")}
                    icon={<List size={14} />}
                    active={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                  />
                  <div className="w-px bg-[var(--color-border)]" />
                  <ViewModeButton
                    label={t("settings.viewGrid")}
                    icon={<LayoutGrid size={14} />}
                    active={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                  />
                </div>
              </SettingRow>
            </div>
          </div>

          {/* Language section */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
              {t("settings.sectionLanguage")}
            </h3>

            <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
              <div className="flex items-center justify-between min-h-[64px] px-5 py-4 bg-[var(--color-bg)]/30">
                <div
                  className="flex rounded-lg overflow-hidden border border-[var(--color-border)]"
                  role="radiogroup"
                >
                  <ViewModeButton
                    label="日本語"
                    active={language === "ja"}
                    onClick={() => handleLanguageChange("ja")}
                  />
                  <div className="w-px bg-[var(--color-border)]" />
                  <ViewModeButton
                    label="English"
                    active={language === "en"}
                    onClick={() => handleLanguageChange("en")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="flex items-center justify-between min-h-[64px] px-5 py-4 bg-[var(--color-bg)]/30">
      <div className="flex flex-col gap-1 min-w-0 mr-6">
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
        {description && (
          <span className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</span>
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
      className={`relative w-12 h-7 rounded-full p-[3px] transition-colors duration-200 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-text-muted)]/40"
      }`}
    >
      <span
        className={`block w-[22px] h-[22px] rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[21px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ViewModeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-150 ${
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
