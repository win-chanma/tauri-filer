import { useState, useCallback } from "react";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });

  const show = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.clientX, y: e.clientY });
  }, []);

  const hide = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return { menu, show, hide };
}
