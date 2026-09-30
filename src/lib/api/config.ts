const DEFAULT_CHAT_ORIGIN = "https://chat-app-production-79fb.up.railway.app";

/** Chat backend origin (no trailing slash). */
export const CHAT_ORIGIN = (
  import.meta.env.VITE_CHAT_API_URL || DEFAULT_CHAT_ORIGIN
).replace(/\/+$/, "");

/**
 * REST base. In dev, requests go through the Vite proxy (`/chat-api` → `<origin>/api`)
 * so local development isn't blocked by the backend's CORS allow-list.
 */
export const CHAT_REST_URL = import.meta.env.DEV ? "/chat-api" : `${CHAT_ORIGIN}/api`;

/** Socket.io `chat` namespace. */
export const CHAT_SOCKET_URL = `${CHAT_ORIGIN}/chat`;

export const MESSAGES_PAGE_SIZE = 30;
