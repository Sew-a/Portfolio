import { create } from "zustand";
import type { GameUi, GameUiState } from "@/src/lib/game/types";

export interface GameToast {
  id: number;
  text: string;
}

interface GameStore extends GameUiState {
  toasts: GameToast[];
  patch: (state: Partial<GameUiState>) => void;
  toast: (text: string) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const initial: GameUiState = {
  screen: "start",
  act: 1,
  satisfaction: null,
  health: null,
  boss: null,
  tasks: [],
  dialogue: null,
  gameOverReason: "",
  result: null,
  score: 0,
  combo: 0,
  muted: false,
};

const TOAST_MS = 3200;
const MAX_TOASTS = 4;
let toastId = 0;

/** HUD state for `/game`. The engine writes it through the `GameUi` bridge; React only reads. */
export const useGameStore = create<GameStore>()((set, get) => ({
  ...initial,
  toasts: [],
  patch: (state) => set(state),
  toast: (text) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, text }].slice(-MAX_TOASTS) }));
    window.setTimeout(() => get().dismissToast(id), TOAST_MS);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  reset: () => set({ ...initial, toasts: [] }),
}));

export const gameUiBridge: GameUi = {
  patch: (state) => useGameStore.getState().patch(state),
  toast: (text) => useGameStore.getState().toast(text),
};
