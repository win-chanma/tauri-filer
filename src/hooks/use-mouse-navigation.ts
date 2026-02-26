import { useEffect } from "react";
import { useNavigation } from "./use-navigation";

export function useMouseNavigation() {
  const { back, forward } = useNavigation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        back();
      } else if (e.button === 4) {
        e.preventDefault();
        forward();
      }
    };

    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, [back, forward]);
}
