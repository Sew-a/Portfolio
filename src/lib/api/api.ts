import { z } from "zod";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CHAT_REST_URL } from "./config";
import { fetchJson } from "./fetchJson";
import { Result } from "./result";
import {
  authResponseSchema,
  chatUserSchema,
  groupSchema,
  messageSchema,
  type SignInPayload,
  type SignUpPayload,
} from "./schemas";

const jsonBody = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/** Authenticated request against the chat backend. Signs the user out on 401. */
async function authedRequest<T>(
  path: string,
  schema: z.ZodSchema<T>,
  init: RequestInit = {},
): Promise<Result<T>> {
  const { token, clearSession } = useAuthStore.getState();
  const result = await fetchJson(`${CHAT_REST_URL}${path}`, schema, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token ?? ""}` },
  });
  if (!result.ok && result.error.status === 401) clearSession();
  return result;
}

// ─── Auth ────────────────────────────────────────
export const signUp = (payload: SignUpPayload) =>
  fetchJson(`${CHAT_REST_URL}/auth/signup`, authResponseSchema, {
    method: "POST",
    ...jsonBody(payload),
  });

export const signIn = (payload: SignInPayload) =>
  fetchJson(`${CHAT_REST_URL}/auth/signin`, authResponseSchema, {
    method: "POST",
    ...jsonBody(payload),
  });

// ─── User ────────────────────────────────────────
export const getMe = () => authedRequest("/users/me", chatUserSchema);

// ─── Groups ──────────────────────────────────────
export const getGroups = () => authedRequest("/groups", z.array(groupSchema));

export const createGroup = (name?: string) =>
  authedRequest("/groups", groupSchema, {
    method: "POST",
    ...jsonBody(name ? { name } : {}),
  });

export const joinGroup = (inviteCode: string) =>
  authedRequest("/groups/join", groupSchema, {
    method: "POST",
    ...jsonBody({ inviteCode }),
  });

// ─── Messages ────────────────────────────────────
export const getMessages = (groupId: string, cursor?: string) => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return authedRequest(
    `/groups/${encodeURIComponent(groupId)}/messages${query}`,
    z.array(messageSchema),
  );
};
