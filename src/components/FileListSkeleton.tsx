import { useTranslation } from "react-i18next";

const SKELETON_ROWS = 15;

const ROW_WIDTHS = [
  "w-32", "w-48", "w-36", "w-56", "w-40", "w-28", "w-52", "w-44",
  "w-32", "w-48", "w-36", "w-56", "w-40", "w-28", "w-52",
];

export function FileListSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="grid grid-cols-[1fr_80px_140px] px-3 py-1.5 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] select-none">
        <span>{t("listView.name")}</span>
        <span className="text-right">{t("listView.size")}</span>
        <span className="text-right">{t("listView.modified")}</span>
      </div>
      <div className="flex-1">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_80px_140px] items-center px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[var(--color-text-muted)]/20" />
              <div className={`h-3.5 rounded bg-[var(--color-text-muted)]/20 ${ROW_WIDTHS[i]}`} />
            </div>
            <div className="flex justify-end">
              <div className="w-10 h-3 rounded bg-[var(--color-text-muted)]/20" />
            </div>
            <div className="flex justify-end">
              <div className="w-20 h-3 rounded bg-[var(--color-text-muted)]/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
