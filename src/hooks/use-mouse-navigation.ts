import { useEffect } from "react";
import { useNavigation } from "./use-navigation";

export function useMouseNavigation() {
  const { back, forward } = useNavigation();

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        back();
      } else if (e.button === 4) {
        e.preventDefault();
        forward();
      }
    };

    // mousedown でも preventDefault してブラウザのデフォルトナビゲーションを抑制
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault();
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [back, forward]);
}
