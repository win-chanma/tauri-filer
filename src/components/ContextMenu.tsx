import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
}

export function ContextMenu({ x, y, visible, onClose, items }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  // 画面端でのはみ出し補正
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-lg shadow-2xl py-1"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 border-t border-[var(--color-border)]" />
        ) : (
          <button
            key={i}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-white/10 ${
              item.danger ? "text-[var(--color-danger-hover)]" : "text-[var(--color-text-dim)]"
            }`}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-[var(--color-text-muted)] ml-4">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>,
    document.body
  );
}
