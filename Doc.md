# Sevak Avetisyan — Portfolio

Personal portfolio of **Sevak Avetisyan, Frontend Engineer** (5+ years, most recently at Picsart, a 150M+ user creative platform).

Besides presenting experience and projects, the site is itself a working showcase. It's a **Module Federation host** that loads a whiteboard micro-frontend at runtime, and it ships the **React client of a real-time group chat** backed by a NestJS + Socket.io API.

> The folder and package are still named `my-nextjs-app` / `next-gig` for historical reasons. The app is a **Vite + React SPA**, not Next.js.

---

## What's in the portfolio

| Route | Page | What it shows |
| --- | --- | --- |
| `/` | Home | Hero with an open-to-work line, featured work grid, experience timeline, approach, and the "Technologies I work with" grid |
| `/work` | Work | Case-study cards, expertise cards (Full-stack, Game Dev, AI), project gallery, testimonials |
| `/work/micro-canvas` | Case study | Micro Canvas: Miro-like whiteboard shipped as a Module Federation remote |
| `/work/chat-app` | Case study | Real-time Group Chat: React client + NestJS / Socket.io / PostgreSQL backend |
| `/work/ai-agents` | Case study | AI Agents & Prompt Engineering Hub (Next.js 16 on Cloudflare Workers) |
| `/demos` | Demos | Opens the live **Canvas miniapp** (loaded at runtime) and links to the chat demo |
| `/chat` | Chat lobby | Sign in, list your groups, create a group or join one with an invite code |
| `/chat/:groupId` | Chat room | Sidebar with all your groups, live messages, history, copyable invite code |
| `/resume` | Résumé | Résumé generated from the same data as the home timeline |
| `/playground` | Playground | Product search UI (TanStack Query, debounced filtering). Not linked in the nav |

Old `/projects` and `/projects/:slug` URLs redirect to `/work`.

### Chat features
- **Accounts.** Sign up or sign in from a popup. At sign-up you can upload a profile picture from your device (PNG, JPG, WebP, GIF, AVIF, max 10 MB).
- **Account menu.** **Settings** opens a popup to change or remove your profile picture and change your username. **Sign out** ends the session.
- **Groups.** Create a group to get an 8-character invite code, or join with one.
- **Chat room.** Left sidebar with every group you're in. Live messages over Socket.io, "load older" cursor pagination, own messages on the right.
- **Session handling.** The token is persisted in `localStorage`. An expired token (401) signs you out automatically.

The animated character (bottom-right) is hidden on `/demos` and `/chat` so it doesn't cover the apps.

---

## Tech stack

| Area | Tools |
| --- | --- |
| App | React 18, TypeScript (strict), Vite 8, React Router 7 |
| State & data | Zustand, TanStack Query, Zod, Socket.io client |
| Micro-frontends | `@module-federation/vite` (build), `@module-federation/runtime` (runtime loading) |
| Styling | SCSS with design tokens and mixins, BEM class names, light and dark themes |
| Motion & 3D | Framer Motion, Three.js / React Three Fiber |
| Icons | lucide-react, react-icons |
| Images | Cloudinary (URL-based resizing via `src/lib/cloudinaryLoader.ts`) |
| Quality | ESLint 9 (flat config), `tsc --noEmit`, GitHub Actions CI |

Related repositories:
- **Chat backend:** [Sew-a/Chat-app](https://github.com/Sew-a/Chat-app). NestJS 12, Prisma + PostgreSQL, Socket.io, Passport JWT, Cloudflare R2 for images, deployed on Railway.
- **Canvas remote:** [Sew-a/micro-canvas-app](https://github.com/Sew-a/micro-canvas-app). React, Konva, Zustand, exposes `./DemosApp` from `remoteEntry.js`.

---

## Getting started

Requirements: Node.js 22 (same as CI) and npm. `.npmrc` sets `legacy-peer-deps=true`.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run server` | Optional local demo server (`server/server.ts`): Apollo GraphQL on 4000, Express on 4001 |

There is no automated test suite yet.

### Environment variables

Copy `.env.example` to `.env.local`. The app reads two variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_CHAT_API_URL` | `https://chat-app-production-79fb.up.railway.app` | Chat backend origin. REST is at `<url>/api`, Socket.io at `<url>/chat` |
| `VITE_REMOTE_DEMOS_URL` | `http://localhost:3001/remoteEntry.js` | Where the canvas remote's `remoteEntry.js` is served |

To see the canvas on `/demos` locally, run the micro-canvas-app repo too (`npm run dev` there serves port 3001). Without it, `/demos` shows a "Failed to load miniapp" message, which is expected.

In development, chat REST calls go through the Vite proxy (`/chat-api` → `<VITE_CHAT_API_URL>/api`) to avoid the backend's CORS allow-list. Production calls the backend directly.

---

## Architecture

```
src/
  main.tsx, App.tsx       Router + QueryClient; every page is lazy-loaded
  routes/mainRoutes.ts    All route paths (paths) and nav entries (routeNames)
  pages/<route>/page.tsx  One folder per route; "_components" = page-private parts
  components/             Shared UI (Header, Footer, LayoutWrapper, Auth, ProjectCard, ...)
  data/                   Site content: portfolioData.ts, footerData.ts, testimonialsData.ts
  lib/api/                Chat API layer: config, zod schemas, REST calls, socket
  hooks/                  useAuth, useAuthSession, useGroups, useChatRoom, useProfileSettings, ...
  store/                  Zustand stores: app (theme), auth (session + popups), chat (groups, messages)
  styles/                 Design tokens (_variables), mixins (_mixins), global and section styles
```

**Content is data-driven.** Hero, experience, résumé, skills, projects and featured work all live in `src/data/portfolioData.ts`. The `EXPERIENCE` array feeds both the home timeline and the résumé, and `PROJECTS` feeds the work cards and the case-study pages. Some copy lives in `components/<Section>/constants.ts`. When updating personal details, keep them consistent with LinkedIn (titles, dates, metrics).

**Layout.** `LayoutWrapper` renders the header, page transitions, the "Follow me" bar, the footer, the animated character, and the auth and settings popups. It also mounts `useThemeSync` and `useAuthSession`.

**Module Federation.** `vite.config.mts` registers the app as host `main_app` with the remote `demos`, sharing React, ReactDOM and React Router as singletons. On `/demos`, `useRemoteComponent` loads `demos/DemosApp` through `@module-federation/runtime` and mounts it in its own React root.

**Chat client.**
- `lib/api/api.ts` wraps every REST call. It validates responses with Zod, attaches the Bearer token, and signs the user out on 401.
- `lib/api/socket.ts` keeps one shared socket per token.
- `useChatRoom` loads history, rejoins the room after reconnects, and merges live `new_message` events into `useChatStore`.
- Avatars upload as `multipart/form-data` to `POST /api/users/me/avatar`. At sign-up the account is created first, then the picture is uploaded with the new token.

**SEO.** `index.html` holds default title, description, Open Graph and Twitter tags. Each page renders `<Seo title description />`, which updates the title, description, `og:*` and `twitter:*` tags on navigation.

---

## Design system

- **Tokens** live in `src/styles/_variables.scss`: colors (accent `#00f0ff`), radii, breakpoints (`$tablet` 768px, `$desktop` 1024px) and typography.
- **Theming.** Components use `--theme-*` CSS variables defined on `.main-theme-wrapper`. `.light-theme` overrides them. The theme is also set as `data-theme` on `<html>` so the page scrollbar can follow it.
- **Mixins** live in `src/styles/_mixins.scss`: `content-wrapper`, `section-padding`, `section-label-style`, `section-title-style`, `btn-base` / `btn-primary` / `btn-ghost`, `hover-lift`, `card-hover-glow`, `dot-pattern`, and `themed-scrollbar` (the thin scrollbar used on the page and in the chat panels).

### Typography

| Token | Size | Use |
| --- | --- | --- |
| `$fs-display` | 56px | Home hero headline |
| `$fs-h1` | 44px | Page titles |
| `$fs-h2` | 32px | Section titles |
| `$fs-h3` | 24px | Card titles |
| `$fs-h4` | 20px | Lead text, modal titles |
| `$fs-lead` | 18px | Highlighted descriptions |
| `$fs-body` | 16px | Body text |
| `$fs-sm` | 14px | Secondary text, nav, buttons |
| `$fs-micro` | 12px | Labels, tags, captions |

- **Fonts.** `$font-family-sans` (Inter) for UI and body text, `$font-family-mono` (JetBrains Mono) for code and labels.
- **Weights.** `$fw-regular` 400, `$fw-medium` 500, `$fw-semibold` 600, `$fw-bold` 700. Don't go above 700.
- **No hard-coded values.** Use the tokens rather than raw font sizes or weights in component SCSS.

---

## CI / deployment

`.github/workflows/main.yml` runs on pushes and pull requests to `main`:

1. `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, then upload `dist/` as an artifact.
2. On pushes to `main` only: build again and deploy with `railway up --ci`. This needs a `RAILWAY_TOKEN` repository secret (a Railway **project** token).

`wrangler.jsonc` also configures `dist/` as a Cloudflare static-assets deployment with single-page-app fallback.

The chat backend and the canvas remote are deployed separately from their own repositories.

---

## More docs

- [CHAT_INTEGRATION.md](CHAT_INTEGRATION.md): chat integration notes and history.
- [API.md](API.md): chat backend REST and WebSocket reference.
- [CLAUDE.md](CLAUDE.md): guidance for AI coding assistants working in this repo.

---

*Created by [Sevak Avetisyan](https://www.linkedin.com/in/sevak-avetisyan-arm/)*
