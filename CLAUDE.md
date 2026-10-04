# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sevak Avetisyan's personal portfolio. Despite the folder/package name (`my-nextjs-app` / `next-gig`), this is **not a Next.js app**: it is a Vite 8 + React 18 SPA using React Router 7. `README.md` (mirrored in `Doc.md`) documents the pages, features, architecture and deployment. Keep both in sync when they change.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:3000
npm run server     # Local Express (4001, /api/images) + Apollo GraphQL (4000) from server/server.ts
npm run lint       # ESLint (flat config, eslint.config.mjs)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build → dist/
npm run preview    # serve dist/
```

There is no test runner configured. CI (`.github/workflows/`) runs `npm ci`, then lint, typecheck and build on pushes and PRs to `main`, and deploys `main` with `railway up`. `.npmrc` sets `legacy-peer-deps=true`, which `npm ci` depends on.

Hosting: `wrangler.jsonc` serves `dist/` as static assets with SPA fallback (Cloudflare).

## Architecture

**Routing.** `src/main.tsx` sets up `BrowserRouter` and the TanStack `QueryClientProvider`. `src/App.tsx` lazy-loads every page from `src/pages/<route>/page.tsx` inside `LayoutWrapper`, which holds the header, footer, theme sync and auth session. All route paths come from `paths` in `src/routes/mainRoutes.ts`. Add new routes there and in `App.tsx`; `routeNames` drives the nav. `src/pages/` is plain React Router pages, not Next.js file routing. Folders prefixed with `_` (e.g. `work/_components`) are page-private components.

**Content lives in data files, not components.** Personal and professional facts (hero text, experience timeline, résumé, skills, projects, featured work) are in `src/data/portfolioData.ts`. Footer links are in `src/data/footerData.ts`, testimonials in `src/data/testimonialsData.ts`, and some section copy in `src/components/<Section>/constants.ts`. The `EXPERIENCE` array feeds both the home timeline (`components/ExperienceTimeline`, flattened per role) and the résumé page (`components/Resume`), so one edit updates both. Some facts are duplicated as hard-coded strings, such as the LinkedIn URL in `components/FollowSection` and in README/Doc. When changing personal info, grep the whole repo. That info has to match the owner's LinkedIn exactly (official job titles, dates, metrics), because recruiters compare the two.

**Module Federation host.** `vite.config.mts` registers this app as host `main_app` with a remote `demos`, whose URL comes from `VITE_REMOTE_DEMOS_URL` (default `http://localhost:3001/remoteEntry.js`, a separate repo). React, react-dom and react-router-dom are shared singletons. At runtime, `src/pages/demos/federation.ts` (`@module-federation/runtime`) and `hooks/useRemoteComponent.tsx` load the remote Konva canvas miniapp and mount it into its own React root. If the remote isn't running locally, `/demos` shows an error state, and that's expected.

**Chat feature.** `/chat` and `/chat/:groupId` talk to an external backend (Railway; REST at `<VITE_CHAT_API_URL>/api`, Socket.io namespace `/chat`). The contract is in `API.md` and integration notes are in `CHAT_INTEGRATION.md`.
- `src/lib/api/`: `config.ts` holds the URLs. In dev, REST goes through the Vite proxy `/chat-api` to get around backend CORS; in prod it calls the backend directly. `schemas.ts` holds the zod schemas. `api.ts` holds the REST calls (Bearer token; a 401 signs the user out). `socket.ts` keeps a single shared socket per token.
- `src/store/`: Zustand stores. `useAuthStore` persists to `localStorage["chat-auth"]`, `useChatStore` is not persisted, and `useAppStore` holds the theme and gallery state. Setters accept React-style `prev => next` updaters via `store/utils.ts`.
- `src/hooks/`: `useAuth`, `useAuthSession` (mounted in `LayoutWrapper`), `useGroups`, `useChatRoom`.

**Path aliases.** `@/src/...` and `@/...` both resolve to `src/` (Vite config + tsconfig). The codebase uses `@/src/...`.

## Styling

SCSS only, no Tailwind in this repo. Global partials live in `src/styles/` (`_variables.scss`, `_mixins.scss`, `main.scss`, plus per-section files like `hero.scss`). Components use BEM class names (`hero__sub`, `resume__role`). Use the typography tokens from `_variables.scss` (`$fs-display`…`$fs-micro`, `$fw-regular`…`$fw-bold`, `$font-family-sans` / `$font-family-mono`) and the mixins (`section-label-style`, `section-title-style`, `btn-base`). Don't hard-code font sizes or weights, and don't go above weight 700. Light-theme overrides are in `main.scss` and use `--theme-*` CSS variables.

## Gotchas

- Some files use CRLF line endings. Scripted multi-line find/replace has to account for that.
- ESLint has most TS strictness rules turned off. `tsc --noEmit` (strict mode) is the real correctness gate.
- `server/server.ts` is a standalone demo server and isn't part of the SPA bundle.
