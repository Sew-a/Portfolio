import { useEffect } from "react";
import { getMe } from "@/src/lib/api/api";
import { disconnectChatSocket } from "@/src/lib/api/socket";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useChatStore } from "@/src/store/useChatStore";

/**
 * Keeps the persisted session honest: refreshes the profile for a stored token
 * (an expired token gets cleared by the 401 handler) and wipes chat state on sign-out.
 */
export function useAuthSession() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      disconnectChatSocket();
      useChatStore.getState().reset();
      return;
    }

    let cancelled = false;
    getMe().then((result) => {
      if (!cancelled && result.ok) useAuthStore.getState().setUser(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);
}
