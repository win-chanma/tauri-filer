import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export type ConflictStrategy = "overwrite" | "skip" | "rename";

interface CopyConflictDialogProps {
  open: boolean;
  conflicts: string[];
  onResolve: (strategy: ConflictStrategy) => void;
  onCancel: () => void;
}

export function CopyConflictDialog({
  open,
  conflicts,
  onResolve,
  onCancel,
}: CopyConflictDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className="bg-[var(--color-bg-card-solid)] rounded-xl w-[420px] max-w-[90vw] p-6 shadow-2xl shadow-black/40 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-[var(--color-danger-hover)] shrink-0" />
          <h2 className="text-[15px] font-semibold text-[var(--color-text)]">
            {t("conflict.title")}
          </h2>
        </div>

        <p className="text-[13px] text-[var(--color-text-dim)] mb-3">
          {t("conflict.message", { count: conflicts.length })}
        </p>

        <div className="max-h-[120px] overflow-y-auto mb-5 rounded bg-[var(--color-bg)] p-2">
          {conflicts.map((name) => (
            <div
              key={name}
              className="text-[12px] text-[var(--color-text-muted)] py-0.5 px-1 truncate"
            >
              {name}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[var(--color-text-dim)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            {t("conflict.cancel")}
          </button>
          <button
            onClick={() => onResolve("skip")}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            {t("conflict.skip")}
          </button>
          <button
            onClick={() => onResolve("rename")}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            {t("conflict.rename")}
          </button>
          <button
            onClick={() => onResolve("overwrite")}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] transition-colors"
          >
            {t("conflict.overwrite")}
          </button>
        </div>
      </div>
    </div>
  );
}
