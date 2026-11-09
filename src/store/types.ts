import type { ChatGroup, ChatMessage, ChatUser } from "@/src/lib/api/schemas";

export type Theme = "dark" | "light";

// ─── App store ───────────────────────────────────
export interface AppState {
  theme: Theme;

  toggleTheme: () => void;
}

// ─── Auth store ──────────────────────────────────
export type AuthMode = "signin" | "signup";

export interface AuthState {
  token: string | null;
  user: ChatUser | null;
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  isSettingsOpen: boolean;

  setSession: (token: string, user: ChatUser) => void;
  setUser: (user: ChatUser) => void;
  clearSession: () => void;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

// ─── Chat store ──────────────────────────────────
export interface ChatState {
  groups: ChatGroup[];
  groupsLoaded: boolean;
  messagesByGroup: Record<string, ChatMessage[]>;
  hasMoreByGroup: Record<string, boolean>;

  setGroups: (groups: ChatGroup[]) => void;
  upsertGroup: (group: ChatGroup) => void;
  setMessages: (groupId: string, messages: ChatMessage[], hasMore: boolean) => void;
  prependMessages: (groupId: string, messages: ChatMessage[], hasMore: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  /** Refreshes the author snapshot (name, avatar) on a user's already-loaded messages. */
  updateMessageAuthor: (user: ChatMessage["user"]) => void;
  reset: () => void;
}
