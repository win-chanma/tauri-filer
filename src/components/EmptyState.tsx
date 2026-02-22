import { FolderOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
      <FolderOpen size={48} strokeWidth={1} />
      <p className="text-sm">This folder is empty</p>
    </div>
  );
}
