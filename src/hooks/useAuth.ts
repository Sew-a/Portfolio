import { useState } from "react";
import { signIn, signUp } from "@/src/lib/api/api";
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/src/lib/api/schemas";
import type { Result } from "@/src/lib/api/result";
import { useAuthStore } from "@/src/store/useAuthStore";

/** Sign-in / sign-up / sign-out actions with shared pending + error state. */
export function useAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (request: () => Promise<Result<AuthResponse>>) => {
    setIsPending(true);
    setError(null);
    const result = await request();
    setIsPending(false);

    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setSession(result.data.accessToken, result.data.user);
    closeAuthModal();
    return true;
  };

  return {
    isPending,
    error,
    clearError: () => setError(null),
    signIn: (payload: SignInPayload) => run(() => signIn(payload)),
    signUp: (payload: SignUpPayload) => run(() => signUp(payload)),
    signOut: clearSession,
  };
}
