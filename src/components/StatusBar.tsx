import { useTranslation } from "react-i18next";
import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { formatFileSize } from "../utils/format";

export function StatusBar() {
  const { t } = useTranslation();
  const entries = useFileStore((s) => s.entries);
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const showHidden = useUIStore((s) => s.showHidden);

  const visibleCount = showHidden
    ? entries.length
    : entries.filter((e) => !e.isHidden).length;

  const selectedSize = entries
    .filter((e) => selectedPaths.has(e.path))
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <div className="flex items-center justify-between px-3 py-1 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
      <span>{t("statusBar.items", { count: visibleCount })}</span>
      {selectedPaths.size > 0 && (
        <span>
          {t("statusBar.selected", { count: selectedPaths.size })}
          {selectedSize > 0 && ` (${formatFileSize(selectedSize)})`}
        </span>
      )}
    </div>
  );
}
