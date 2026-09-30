import { useEffect } from "react";
import { applyThemeClass, useAppStore } from "@/src/store/useAppStore";

/** Mirrors the store's theme onto the layout wrapper. Mount once, inside the wrapper. */
export function useThemeSync() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);
}
