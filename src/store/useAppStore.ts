import { create } from "zustand";
import type { AppState, Theme } from "./types";

const THEME_KEY = "theme";

const readSavedTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

export const useAppStore = create<AppState>()((set) => ({
  theme: readSavedTheme(),

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
}));

/** Persists the theme and applies it to the layout wrapper. */
export const applyThemeClass = (theme: Theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document
    .querySelector(".main-theme-wrapper")
    ?.classList.toggle("light-theme", theme === "light");
  // The page scrollbar lives on <html>, outside the wrapper, so it needs the theme too.
  document.documentElement.dataset.theme = theme;
};
