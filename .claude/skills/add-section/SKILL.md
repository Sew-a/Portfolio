---
name: add-section
description: Scaffold a new UI section/component folder following the repo conventions (BEM SCSS with tokens, constants file, index re-export). Use when creating a new shared component or page section.
argument-hint: "<ComponentName> [page-route if page-private]"
---

# Add a section / component

1. **Decide the location** (see `.claude/rules/structure.md`):
   - Used by one route only → `src/pages/<route>/_components/<Name>/`
   - Shared or used by the layout → `src/components/<Name>/`
2. **Create the files:**
   - `<Name>.tsx`: default export, function component. Copy and lists come from `constants.ts` (or `src/data/` for personal facts), never inline.
   - `index.ts`: `export { default } from "./<Name>";` (shared components only)
   - `constants.ts`: UPPER_SNAKE exported constants.
   - `types.ts`: only if props/types are non-trivial.
   - `styles.scss`:
     ```scss
     @use "../../styles/variables" as *;
     @use "../../styles/mixins" as *;

     .<block> {
       @include section-padding;
       &__title { @include section-title-style; }
     }
     ```
     Block name = kebab-case component name. Tokens only for type sizes and weights.
3. **Import** it with `@/src/...` from its consumer.
4. **Check** light theme (add `--theme-*` overrides in `src/styles/main.scss` if needed), mobile width, keyboard focus, and `prefers-reduced-motion` for any animation.
5. Run the `verify` skill.
