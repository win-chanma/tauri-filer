import { useState, useRef, useEffect } from "react";

interface NewFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderDialog({ open, onClose, onCreate }: NewFolderDialogProps) {
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
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 w-[360px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-3">New Folder</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="w-full px-3 py-2 text-sm bg-[#0a0a14] border border-[#2a2a3a] rounded text-slate-200 outline-none focus:border-indigo-500"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
