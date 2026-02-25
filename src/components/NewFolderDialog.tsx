import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface NewFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderDialog({ open, onClose, onCreate }: NewFolderDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 w-[360px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">{t("newFolder.title")}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="w-full px-3 py-2 text-sm bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            placeholder={t("newFolder.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-3 py-1.5 text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              onClick={onClose}
            >
              {t("newFolder.cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent-light)]"
            >
              {t("newFolder.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
