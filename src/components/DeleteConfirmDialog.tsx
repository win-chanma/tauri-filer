interface DeleteConfirmDialogProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, count, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 w-[360px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Delete</h3>
        <p className="text-sm text-slate-400 mb-4">
          Move {count} item{count !== 1 ? "s" : ""} to trash?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
