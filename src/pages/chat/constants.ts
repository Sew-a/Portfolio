import type { ChatGroup } from "@/src/lib/api/schemas";

export const COPY_FEEDBACK_MS = 1500;

export const groupDisplayName = (group: Pick<ChatGroup, "name" | "inviteCode">) =>
  group.name || `Group ${group.inviteCode}`;

export const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
