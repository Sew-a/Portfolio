---
paths:
  - "src/lib/api/**"
  - "src/store/**"
  - "src/hooks/useAuth*.ts"
  - "src/hooks/useGroups.ts"
  - "src/hooks/useChatRoom.ts"
  - "src/hooks/useProfileSettings.ts"
  - "src/pages/chat/**"
  - "src/components/Auth/**"
---

# Chat client

- The backend lives in a separate repo. `API.md` is the contract; read it before adding or changing a call. Don't guess endpoints or payloads.
- Every REST call goes through `src/lib/api/api.ts` and validates the response with a zod schema from `schemas.ts`. Add the schema first, then the call.
- `api.ts` attaches the Bearer token and signs the user out on 401. Don't duplicate that in hooks or components.
- REST URLs come from `config.ts`: dev goes through the Vite proxy `/chat-api`, prod hits `VITE_CHAT_API_URL` directly. Never hard-code the backend origin.
- One shared Socket.io connection per token (`socket.ts`, namespace `/chat`). Don't open sockets in components.
- Stores: `useAuthStore` persists to `localStorage["chat-auth"]`; `useChatStore` is in-memory. Setters accept `prev => next` updaters via `store/utils.ts`.
- Hooks return `Result` (`lib/api/result.ts`) for user actions so components can show errors without try/catch.
