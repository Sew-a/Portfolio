---
paths:
  - "src/**/*.scss"
  - "src/**/*.tsx"
---

# Styling

- SCSS only. No Tailwind, CSS modules or CSS-in-JS.
- Start component stylesheets with:
  ```scss
  @use "../../styles/variables" as *;
  @use "../../styles/mixins" as *;
  ```
  (adjust the depth; Sass paths stay relative).
- BEM class names: block = component (`hero`, `resume`), elements `hero__sub`, modifiers `hero__sub--muted`.
- Typography only via tokens from `_variables.scss`: `$fs-display` … `$fs-micro`, `$fw-regular` … `$fw-bold`, `$font-family-sans` / `$font-family-mono`. No raw font sizes or weights, and never above 700.
- Prefer existing mixins over re-implementing them: `content-wrapper`, `section-padding`, `section-label-style`, `section-title-style`, `btn-base` / `btn-primary` / `btn-ghost`, `hover-lift`, `card-hover-glow`, `themed-scrollbar`.
- Theme colours come from `--theme-*` CSS variables. Light-theme overrides live in `src/styles/main.scss` under `.light-theme`. Check new UI in both themes.
- No inline `style={{...}}` except for runtime values: CSS custom properties (`--project-accent`), framer-motion values, or measured sizes.
