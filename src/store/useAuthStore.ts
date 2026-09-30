import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthState } from "./types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthModalOpen: false,
      authMode: "signin",

      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
      openAuthModal: (mode = "signin") =>
        set({ isAuthModalOpen: true, authMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      setAuthMode: (mode) => set({ authMode: mode }),
    }),
    {
      name: "chat-auth",
      storage: createJSONStorage(() => localStorage),
      // Only the session is persisted; modal UI state stays in memory.
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
);
