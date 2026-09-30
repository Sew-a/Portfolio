import { useCallback, useEffect, useState } from "react";
import { getMessages } from "@/src/lib/api/api";
import { MESSAGES_PAGE_SIZE } from "@/src/lib/api/config";
import {
  messageSchema,
  socketExceptionSchema,
  type ChatMessage,
} from "@/src/lib/api/schemas";
import { getChatSocket } from "@/src/lib/api/socket";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useChatStore } from "@/src/store/useChatStore";

// Stable fallback so the selector doesn't return a new array every render.
const NO_MESSAGES: ChatMessage[] = [];

/** History (REST) + live messages (socket) for one group. */
export function useChatRoom(groupId: string) {
  const token = useAuthStore((s) => s.token);
  const messages = useChatStore((s) => s.messagesByGroup[groupId] ?? NO_MESSAGES);
  const hasMore = useChatStore((s) => s.hasMoreByGroup[groupId] ?? false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial history
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsLoadingHistory(true);
    setError(null);
    getMessages(groupId).then((result) => {
      if (cancelled) return;
      setIsLoadingHistory(false);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      useChatStore
        .getState()
        .setMessages(groupId, result.data, result.data.length === MESSAGES_PAGE_SIZE);
    });
    return () => {
      cancelled = true;
    };
  }, [groupId, token]);

  // Live room
  useEffect(() => {
    if (!token) return;
    const socket = getChatSocket(token);

    // Rooms are lost on reconnect, so (re)join on every connect.
    const join = () => socket.emit("join_group", { groupId });
    const onMessage = (raw: unknown) => {
      const parsed = messageSchema.safeParse(raw);
      if (parsed.success) useChatStore.getState().addMessage(parsed.data);
    };
    const onException = (raw: unknown) => {
      const parsed = socketExceptionSchema.safeParse(raw);
      const err = parsed.success ? parsed.data : {};
      if (err.statusCode === 401) {
        useAuthStore.getState().clearSession();
        return;
      }
      const message = Array.isArray(err.message) ? err.message.join(", ") : err.message;
      setError(message ?? "Something went wrong");
    };

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("new_message", onMessage);
    socket.on("exception", onException);
    return () => {
      socket.off("connect", join);
      socket.off("new_message", onMessage);
      socket.off("exception", onException);
    };
  }, [groupId, token]);

  const loadOlder = useCallback(async () => {
    const oldest = useChatStore.getState().messagesByGroup[groupId]?.[0];
    if (!oldest) return;
    setIsLoadingOlder(true);
    const result = await getMessages(groupId, oldest.id);
    setIsLoadingOlder(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    useChatStore
      .getState()
      .prependMessages(groupId, result.data, result.data.length === MESSAGES_PAGE_SIZE);
  }, [groupId]);

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();
      if (!token || !text) return;
      setError(null);
      getChatSocket(token).emit("send_message", { groupId, content: text });
    },
    [groupId, token],
  );

  return {
    messages,
    hasMore,
    isLoadingHistory,
    isLoadingOlder,
    error,
    loadOlder,
    sendMessage,
  };
}
