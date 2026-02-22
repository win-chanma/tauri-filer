import { useCallback } from "react";
import { moveItems } from "../commands/fs-commands";
import { useFileStore } from "../stores/file-store";

export function useDragDrop() {
  const selectedPaths = useFileStore((s) => s.selectedPaths);

  const handleDragStart = useCallback(
    (e: React.DragEvent, path: string) => {
      const paths = selectedPaths.has(path)
        ? Array.from(selectedPaths)
        : [path];
      e.dataTransfer.setData("application/json", JSON.stringify(paths));
      e.dataTransfer.effectAllowed = "move";
    },
    [selectedPaths]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetDir: string) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;

      try {
        const sources: string[] = JSON.parse(raw);
        // 自分自身へのドロップは無視
        if (sources.includes(targetDir)) return;
        await moveItems(sources, targetDir);
      } catch (err) {
        console.error("Drop move failed:", err);
      }
    },
    []
  );

  return { handleDragStart, handleDragOver, handleDrop };
}
