import { useState } from "react";
import { signIn, signUp, uploadAvatar } from "@/src/lib/api/api";
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/src/lib/api/schemas";
import type { Result } from "@/src/lib/api/result";
import { useAuthStore } from "@/src/store/useAuthStore";

/** Sign-in / sign-up / sign-out actions with shared pending + error state. */
export function useAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs the auth request, stores the session, then an optional follow-up step that
   * needs the new token. A failed follow-up keeps the popup open with its message.
   */
  const run = async (
    request: () => Promise<Result<AuthResponse>>,
    afterSession?: () => Promise<string | null>,
  ) => {
    setIsPending(true);
    setError(null);
    const result = await request();

    if (!result.ok) {
      setIsPending(false);
      setError(result.error.message);
      return false;
    }
    setSession(result.data.accessToken, result.data.user);

    const followUpError = afterSession ? await afterSession() : null;
    setIsPending(false);
    if (followUpError) {
      setError(followUpError);
      return false;
    }
    closeAuthModal();
    return true;
  };

  // The avatar can only be uploaded with a token, so it goes up right after sign-up.
  const uploadSignUpAvatar = (avatar: File) => async () => {
    const result = await uploadAvatar(avatar);
    if (!result.ok) {
      return `Your account is ready, but the picture didn't upload (${result.error.message}). You can add it later in Settings.`;
    }
    setUser(result.data);
    return null;
  };

  return {
    isPending,
    error,
    clearError: () => setError(null),
    signIn: (payload: SignInPayload) => run(() => signIn(payload)),
    signUp: (payload: SignUpPayload, avatar?: File | null) =>
      run(() => signUp(payload), avatar ? uploadSignUpAvatar(avatar) : undefined),
    signOut: clearSession,
  };
}
