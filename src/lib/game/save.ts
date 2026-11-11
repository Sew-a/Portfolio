import { SAVE_KEY } from "@/src/lib/game/constants";

/** Act checkpoint. Storage can be blocked (private mode), so every access is guarded. */
export function loadSave(): number {
  try {
    const n = Number(localStorage.getItem(SAVE_KEY));
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeSave(act: number) {
  try {
    localStorage.setItem(SAVE_KEY, String(act));
  } catch {}
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}
