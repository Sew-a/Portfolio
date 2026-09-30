import type { SetStateAction } from "react";
import type { ChatGroup, ChatMessage, ChatUser } from "@/src/lib/api/schemas";

//  Actions list types
export const ACTION_NAMES = {
  OPEN: "OPEN",
  RENAME: "RENAME",
  DELETE: "DELETE",
  DOWNLOAD: "DOWNLOAD",
  UPLOAD: "UPLOAD",
};

export type ActionType = typeof ACTION_NAMES[keyof typeof ACTION_NAMES];

export type ImageItemProps = {
  id: string;
  name: string;
  url: string;
  type: string;
  handleClick: (action: ActionType, id: string, url: string) => void;
};

export type Theme = "dark" | "light";

// ─── App store ───────────────────────────────────
export interface AppState {
  imageFiles: ImageItemProps[];
  currentFile: string;
  isHacked: boolean;
  isLoading: boolean;
  theme: Theme;

  setImageFiles: (value: SetStateAction<ImageItemProps[]>) => void;
  setCurrentFile: (value: SetStateAction<string>) => void;
  setIsHacked: (value: SetStateAction<boolean>) => void;
  setIsLoading: (value: SetStateAction<boolean>) => void;
  setTheme: (value: SetStateAction<Theme>) => void;
  toggleTheme: () => void;
}

// ─── Auth store ──────────────────────────────────
export type AuthMode = "signin" | "signup";

export interface AuthState {
  token: string | null;
  user: ChatUser | null;
  isAuthModalOpen: boolean;
  authMode: AuthMode;

  setSession: (token: string, user: ChatUser) => void;
  setUser: (user: ChatUser) => void;
  clearSession: () => void;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
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
  reset: () => void;
}
