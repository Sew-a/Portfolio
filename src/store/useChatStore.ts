import { create } from "zustand";
import type { ChatMessage } from "@/src/lib/api/schemas";
import type { ChatState } from "./types";

/** Merges message lists by id, keeping chronological (oldest → newest) order. */
const mergeMessages = (a: ChatMessage[], b: ChatMessage[]): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>();
  for (const m of [...a, ...b]) byId.set(m.id, m);
  return [...byId.values()].sort(
    (x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
  );
};

const initialState = {
  groups: [],
  groupsLoaded: false,
  messagesByGroup: {},
  hasMoreByGroup: {},
};

export const useChatStore = create<ChatState>()((set) => ({
  ...initialState,

  setGroups: (groups) => set({ groups, groupsLoaded: true }),
  upsertGroup: (group) =>
    set((s) => ({
      groups: [group, ...s.groups.filter((g) => g.id !== group.id)],
    })),
  setMessages: (groupId, messages, hasMore) =>
    set((s) => ({
      messagesByGroup: {
        ...s.messagesByGroup,
        // Keep any live messages that arrived while history was loading.
        [groupId]: mergeMessages(s.messagesByGroup[groupId] ?? [], messages),
      },
      hasMoreByGroup: { ...s.hasMoreByGroup, [groupId]: hasMore },
    })),
  prependMessages: (groupId, messages, hasMore) =>
    set((s) => ({
      messagesByGroup: {
        ...s.messagesByGroup,
        [groupId]: mergeMessages(messages, s.messagesByGroup[groupId] ?? []),
      },
      hasMoreByGroup: { ...s.hasMoreByGroup, [groupId]: hasMore },
    })),
  addMessage: (message) =>
    set((s) => ({
      messagesByGroup: {
        ...s.messagesByGroup,
        [message.groupId]: mergeMessages(
          s.messagesByGroup[message.groupId] ?? [],
          [message],
        ),
      },
    })),
  reset: () => set(initialState),
}));
