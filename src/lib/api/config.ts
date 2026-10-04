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

/** Image uploads (avatars, message images): mirrors the backend's whitelist and size cap. */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Returns an error message for files the backend would reject, or null if the file is fine. */
export function validateImageFile(file: File): string | null {
  if (!IMAGE_MIME_TYPES.includes(file.type)) return "Use a JPEG, PNG, WebP, GIF or AVIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 10 MB or smaller.";
  return null;
}
