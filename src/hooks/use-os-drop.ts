import { useEffect, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";
import { copyItems } from "../commands/fs-commands";

export function isDropFromSameFolder(droppedPaths: string[], tabPath: string): boolean {
  const norm = (p: string) => p.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase();
  const tabNorm = norm(tabPath);
  return droppedPaths.every((p) => {
    const normalized = norm(p);
    const lastSlash = normalized.lastIndexOf("/");
    const parent = lastSlash > 0 ? normalized.substring(0, lastSlash) : normalized;
    return parent === tabNorm;
  });
}

export function useOsDrop() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    let webview;
    try {
      webview = getCurrentWebview();
    } catch {
      // not in Tauri context
      return;
    }

    webview
      .onDragDropEvent((event) => {
        const payload = event.payload;

        if (payload.type === "enter") {
          setIsDraggingOver(true);
        } else if (payload.type === "leave") {
          setIsDraggingOver(false);
        } else if (payload.type === "drop") {
          setIsDraggingOver(false);
          const droppedPaths: string[] = payload.paths;
          if (droppedPaths.length === 0) return;

          const tab = useTabStore
            .getState()
            .tabs.find(
              (t) => t.id === useTabStore.getState().activeTabId
            );
          if (!tab) return;

          if (isDropFromSameFolder(droppedPaths, tab.path)) return;

          copyItems(droppedPaths, tab.path)
            .then(() => {
              useFileStore.getState().loadDirectory(tab.path);
            })
            .catch((err) => {
              console.error("OS drop failed:", err);
            });
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);

  return { isDraggingOver };
}
