import { useCallback, useEffect, useState } from "react";
import { createGroup, getGroups, joinGroup } from "@/src/lib/api/api";
import type { ChatGroup } from "@/src/lib/api/schemas";
import type { Result } from "@/src/lib/api/result";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useChatStore } from "@/src/store/useChatStore";

/** Loads the user's groups into the chat store and exposes create/join actions. */
export function useGroups() {
  const token = useAuthStore((s) => s.token);
  const groups = useChatStore((s) => s.groups);
  const groupsLoaded = useChatStore((s) => s.groupsLoaded);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getGroups().then((result) => {
      if (cancelled) return;
      if (result.ok) useChatStore.getState().setGroups(result.data);
      else setError(result.error.message);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const mutate = useCallback(
    async (request: () => Promise<Result<ChatGroup>>) => {
      setIsPending(true);
      setError(null);
      const result = await request();
      setIsPending(false);

      if (!result.ok) {
        setError(result.error.message);
        return null;
      }
      useChatStore.getState().upsertGroup(result.data);
      return result.data;
    },
    [],
  );

  return {
    groups,
    groupsLoaded,
    error,
    isPending,
    createGroup: (name?: string) => mutate(() => createGroup(name)),
    joinGroup: (inviteCode: string) => mutate(() => joinGroup(inviteCode)),
  };
}
