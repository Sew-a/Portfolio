import { useState } from "react";
import { updateProfile, uploadAvatar } from "@/src/lib/api/api";
import type { ChatUser } from "@/src/lib/api/schemas";
import type { Result } from "@/src/lib/api/result";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useChatStore } from "@/src/store/useChatStore";

/** Profile edits for the signed-in user: avatar upload/remove and username change. */
export function useProfileSettings() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (request: () => Promise<Result<ChatUser>>, successNotice: string) => {
    setIsPending(true);
    setError(null);
    setNotice(null);
    const result = await request();
    setIsPending(false);

    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    const user = result.data;
    useAuthStore.getState().setUser(user);
    // Messages carry an author snapshot; refresh it so the chat shows the change right away.
    useChatStore.getState().updateMessageAuthor({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
    setNotice(successNotice);
    return true;
  };

  return {
    isPending,
    error,
    notice,
    changeAvatar: (file: File) => run(() => uploadAvatar(file), "Profile picture updated."),
    removeAvatar: () => run(() => updateProfile({ avatarUrl: null }), "Profile picture removed."),
    changeUsername: (username: string) =>
      run(() => updateProfile({ username }), "Username updated."),
  };
}
