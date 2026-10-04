# Chat Integration — Status

Integration of the Railway chat backend (see `API.md`) into the portfolio:
authentication popup, header sign-in/avatar, Zustand state, and a `/chat` page.

Backend: `https://chat-app-production-79fb.up.railway.app`
(REST `…/api`, Socket.io namespace `…/chat`).

---

## ✅ Implemented

### 1. State management: React Context → Zustand
`src/contexts/` was removed. All state now lives in `src/store/`:

| Store | Holds | Persisted |
|-------|-------|-----------|
| `useAppStore` | `imageFiles`, `currentFile`, `isHacked`, `isLoading`, `theme` (+ `toggleTheme`) | `theme` → `localStorage["theme"]` (same key as before) |
| `useAuthStore` | `token`, `user`, auth popup state (`isAuthModalOpen`, `authMode`) | `token` + `user` → `localStorage["chat-auth"]` |
| `useChatStore` | `groups`, `messagesByGroup`, `hasMoreByGroup` | no (refetched) |

- Setters keep the React `setX(prev => …)` signature (`store/utils.ts → resolveUpdate`), so existing callers (`useActions`, `useCommandHandler`) only changed their import.
- Types moved from `contexts/types.ts` to `store/types.ts`.
- `QueryClientProvider` (still used by Playground) moved into `main.tsx`.
- The theme class is applied by `useThemeSync()` in `LayoutWrapper`.

### 2. API layer (`src/lib/api/`)
- `config.ts`: backend URLs. In **dev**, REST goes through the Vite proxy `/chat-api → <backend>/api` (`vite.config.mts`). In **prod**, it calls the backend directly.
- `schemas.ts`: zod schemas and types for user, auth response, group, message, socket exception.
- `api.ts`: every REST call: `signUp`, `signIn`, `getMe`, `getGroups`, `createGroup`, `joinGroup`, `getMessages(groupId, cursor?)`. Authenticated calls attach `Bearer <token>`, and a 401 signs the user out automatically.
- `socket.ts`: a single shared Socket.io connection per token.
- `fetchJson.ts`: now shows the backend's `message` (string or string[]) in errors instead of a generic "status 4xx".

### 3. Hooks (`src/hooks/`)
- `useAuth`: sign in, sign up, sign out, plus pending and error state.
- `useAuthSession` (mounted in `LayoutWrapper`): refreshes the profile for a stored token (an expired token gets cleared), and on sign-out disconnects the socket and clears chat state.
- `useGroups`: loads groups into the store and exposes `createGroup` / `joinGroup`.
- `useChatRoom(groupId)`: loads history, loads older pages (`cursor`), joins the room over the socket (re-joins after reconnect), handles live `new_message`, `send_message` and `exception` (401 → sign out).
- `useThemeSync`: applies the theme class.

### 4. Auth popup + header
- `src/components/Auth/`: `AuthModal` (Sign in / Sign up tabs, Esc/backdrop to close), `SignInForm`, `SignUpForm` (username, email, password ≥ 8, optional `https://` avatar URL), `UserMenu`.
- Header: next to the theme toggle there is a **Sign in** button when signed out, or the **avatar** when signed in (avatar image or initial; dropdown with name, email, Sign out). It also shows on mobile, next to the burger menu.
- Shared `UI/Avatar` component.

### 5. Chat pages (`src/pages/chat/`)
- **Chat** nav link → `/chat`.
  - Signed out: a "Sign in to chat" prompt, and the auth popup opens automatically.
  - No groups: an explanation plus **Create a group** (optional name) and **Join with invite code**.
  - Has groups: a group list (name, member count, invite code) plus the same forms.
  - Create or join takes you to `/chat/:groupId`.
- `/chat/:groupId`: header with back link, group name and a copyable invite code; message list (own messages on the right, avatars, time, images rendered if present, "Load older messages"); composer (Enter to send). Auto-scrolls on new messages.
- Minimal styling built on the existing design tokens and `--theme-*` variables, so light and dark themes both work.

### Verification done
- `npm run typecheck` ✅, `eslint src` ✅ (0 warnings; the old `appContext` warning is gone), `npm run build` ✅.
- Dev-server smoke test: `/chat` serves, and the proxy reaches the live backend (`/chat-api/groups` → 401 without a token, validation errors come through).

---

## ⚠️ Backend issues found (must be fixed on the Railway chat app)

1. **CORS is broken for browsers.** The backend always returns
   `Access-Control-Allow-Origin: https://sevavetisyan.up.railway.app/`, **with a trailing slash**.
   Browsers compare origins exactly, so no browser origin can match it and **every production REST call will be blocked**.
   Fix: remove the trailing slash from the allowed-origin env var. Ideally allow a list of origins (prod domain, plus `http://localhost:3000` if you want to call it directly).
   Socket.io already allows `*`, so it isn't affected. Local dev isn't affected either, because it uses the Vite proxy.
2. **`POST /api/auth/signin` returns 500** for a well-formed request with unknown credentials (it should be 401). Validation errors (400) work. Check the backend logs. Sign-up wasn't tested, to avoid creating a real account.

---

## ✅ Added later

- **Avatar upload.** Sign-up has a picture picker (upload from device). The backend gained `POST /api/users/me/avatar`.
- **Settings.** The account menu has Settings (change or remove avatar, change username) and Sign out.
- **Chat sidebar.** `/chat/:groupId` shows every group you're in on the left, with the open one highlighted.

---

## 🔜 Remaining / not implemented

- **Image messages (upload).** `POST /groups/:id/messages/image` + `send_message { imageUrl }` isn't wired into the composer yet. Received images already render.
- **Optimistic sending and delivery state.** A message appears when the server broadcasts `new_message` back. There's no pending or failed indicator.
- **Unread counts / notifications** for groups other than the one that's open.
- **Leaving a group / member list.** The API doesn't offer these yet.
- **Token security.** The token is in `localStorage` (as agreed). There's no refresh endpoint, so an expired token just signs the user out.
- **Env config in hosting.** Optionally set `VITE_CHAT_API_URL` in the frontend's hosting env. The code falls back to the Railway URL above.
- **Tests.** There are no automated tests for the stores and hooks yet.
- **Design polish.** The styling is intentionally minimal.

### Other small behaviour change
- Header nav links are now also highlighted on nested routes (e.g. **Chat** on `/chat/:id`, **Work** on `/work/form-builder`).
