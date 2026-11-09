---
name: dead-code
description: Find unused files, exports, store fields, SCSS and npm dependencies in this repo, then remove them after confirmation. Use when asked to clean up, find unused code, or after removing a feature.
---

# Find and remove dead code

1. **Automated pass** (no install needed):
   ```bash
   npx knip --include files,exports,dependencies,devDependencies
   ```
   Treat its output as candidates, not facts.
2. **Verify each candidate by hand** with Grep:
   - Search for the module path *and* its folder (index re-exports), `lazy(() => import(...))`, and `import(...)` strings.
   - For SCSS: check the stylesheet is imported, then that its BEM block class appears in some `.tsx`.
   - For store fields: search for `useXStore((s) => s.field)` and the setter outside `src/store/`.
   - For deps: also check `vite.config.mts`, `eslint.config.mjs`.
3. **Follow chains.** Removing one file can orphan its hooks, styles and types; re-check after each round.
4. **Show the user the list** (grouped: files, store, deps) before deleting.
5. Delete with `git rm`, uninstall deps with `npm uninstall`, then run the `verify` skill.
