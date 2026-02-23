import { useTranslation } from "react-i18next";

interface DeleteConfirmDialogProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, count, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 w-[360px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-3">{t("delete.title")}</h3>
        <p className="text-sm text-slate-400 mb-4">
          {t("delete.confirm", { count })}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
            onClick={onClose}
          >
            {t("delete.cancel")}
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t("delete.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
