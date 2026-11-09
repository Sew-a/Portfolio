# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sevak Avetisyan's personal portfolio. Despite the package name (`next-gig`), this is **not Next.js**: it is a Vite 8 + React 18 SPA with React Router 7, Zustand, TanStack Query and SCSS. `README.md` documents pages, features, architecture and deployment; update it when those change.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:3000
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc --noEmit (strict) — the real correctness gate
npm run build      # typecheck + vite build → dist/
```

No test runner. CI (`.github/workflows/main.yml`) runs `npm ci`, lint, typecheck and build on pushes/PRs to `main`, and deploys `main` to Railway. `.npmrc` sets `legacy-peer-deps=true`, which `npm ci` needs.

## Architecture in one pass

- `src/main.tsx` → `BrowserRouter` + `QueryClientProvider`. `src/App.tsx` lazy-loads each `src/pages/<route>/page.tsx` inside `LayoutWrapper` (header, footer, theme sync, auth session).
- All route paths live in `paths` (`src/routes/mainRoutes.ts`); `routeNames` drives the nav.
- Content is data, not markup: personal/professional facts in `src/data/`, section copy in `constants.ts` next to the component or page.
- External pieces: the chat backend (REST + Socket.io, contract in `API.md`) and the Module Federation remote `demos` both live in other repos.

Where each kind of code belongs, and the rules for styling, content, chat and federation, are in `.claude/rules/` (loaded automatically for matching paths).

## Conventions that apply everywhere

- Import with `@/src/...`; ESLint rejects `../` imports. Same-folder `./x` is fine; SCSS `@use` stays relative.
- Page-private components go in `src/pages/<route>/_components/`.
- SCSS only, BEM, typography tokens — see `.claude/rules/styling.md`.
- Remove code, styles, store fields and deps as soon as nothing uses them.
- Finish every change with the `verify` skill (lint + build).

## Project skills

`add-page`, `add-section`, `update-profile`, `verify`, `dead-code` in `.claude/skills/`.

## Gotchas

- Many files use CRLF line endings; scripted multi-line edits must handle them.
- ESLint has most TS strictness rules off; trust `tsc`, not lint, for type errors.
- `/demos` shows an error state when the remote isn't running locally. That is expected.
