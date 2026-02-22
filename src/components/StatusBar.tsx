import { useFileStore } from "../stores/file-store";
import { useUIStore } from "../stores/ui-store";
import { formatFileSize } from "../utils/format";

export function StatusBar() {
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
    <div className="flex items-center justify-between px-3 py-1 text-xs text-slate-500 border-t border-[#2a2a3a]">
      <span>{visibleCount} items</span>
      {selectedPaths.size > 0 && (
        <span>
          {selectedPaths.size} selected
          {selectedSize > 0 && ` (${formatFileSize(selectedSize)})`}
        </span>
      )}
    </div>
  );
}
