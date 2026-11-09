---
paths:
  - "src/**"
---

# Where code belongs

| Kind of code | Location | Notes |
| --- | --- | --- |
| Route page | `src/pages/<route>/page.tsx` | Default export, lazy-loaded in `src/App.tsx`. Path comes from `paths` in `src/routes/mainRoutes.ts`. |
| Page-private parts | `src/pages/<route>/_components/` | Only that route (and its sub-routes) may import them. Page constants and SEO copy go in `src/pages/<route>/constants.ts`. |
| Shared UI used by 2+ pages, or by the layout | `src/components/<Name>/` | One folder per component (see "Component folder" below). |
| Small generic primitives | `src/components/UI/` | Re-exported from `src/components/UI/index.tsx`. |
| Site content (text, facts, lists) | `src/data/*.ts` | Never hard-code personal or professional facts inside components. |
| Reusable React hooks | `src/hooks/useX.ts(x)` | A hook used by one component only stays in that component's folder. |
| Non-React logic, API clients | `src/lib/` | `src/lib/api/` is the chat API layer. |
| Global client state | `src/store/useXStore.ts` | Zustand. Shared types in `src/store/types.ts`. Server data goes through TanStack Query or the chat hooks, not a store. |
| Pure helpers | `src/utils/` | No React imports. |
| Global SCSS | `src/styles/` | `_variables`, `_mixins`, `main.scss` (loaded once in `main.tsx`), `sections.scss` (hero/experience/skills, imported by the pages that render them). |

## Component folder

```
src/components/<Name>/
  <Name>.tsx       default export
  index.ts         export { default } from "./<Name>";
  constants.ts     copy and config for this component (optional)
  types.ts         props and local types (optional)
  styles.scss      BEM block named after the component (optional)
  useX.ts          hook used only here (optional)
```

## Imports

- Always use `@/src/...` for anything outside the current folder. ESLint rejects parent-relative imports (`../`).
- `./x` is fine for files in the same folder.
- SCSS is the exception: `@use "../../styles/variables" as *;` stays relative.

## Hygiene

- Delete files, exports, store fields and npm deps once nothing uses them. Don't leave "maybe later" code around; git has the history.
- Before deleting, trace the import graph (or run the `dead-code` skill). Dynamic `import()` and `lazy()` count as usage.
