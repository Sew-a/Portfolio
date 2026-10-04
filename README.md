# Portfolio Project Documentation

## Project Overview
This project is a high-end personal portfolio website built with **Next.js**, **TypeScript**, and **SCSS**. It features a sleek modern responsive design with sections for Projects, Experience, and Skills.

---

## Core Features & Implementation

### 1. Core Interface
- A high-fidelity, visually stunning landing page with sections for Projects, Experience, and Skills.
- **Seamless Transitions**: Powered by `framer-motion` for fluid page animations.

### 2. Design System & Aesthetics
- **Premium UI**: Uses a sophisticated dark-themed palette with vibrant purple (`#d494ff`) accents.
- **Glassmorphism**: Integrated across various components for a state-of-the-art look.
- **Micro-animations**: Hover effects, scroll-triggered fade-ins (`FadeIn` component), and interactive project cards.
- **Custom Typography**: Inter (UI/body) with JetBrains Mono for code, driven by a centralized font-size and weight scale. See the [Typography System](#typography-system) section below.

---

## Typography System

All typography is driven by a centralized design-token scale defined in
`src/styles/_variables.scss` under the "Fonts" section. Every `font-size`,
`font-weight`, and site-wide `font-family` across the codebase should reference
these tokens — no hardcoded font values in component SCSS.

### Font Family
| Token | Value | Use |
|-------|-------|-----|
| `$font-family-sans` | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All UI/body text (set globally on `*` in `main.scss`) |
| `$font-family-mono` | `"JetBrains Mono", "Fira Code", monospace` | Code/technical text (code blocks, editor, terminal) |

> Legacy brand font `"Plaster", system-ui` is intentionally preserved only for the
> Header logo element. It is the sole literal `font-family` left in source.

### Font Weight Scale
| Token | Value |
|-------|-------|
| `$fw-regular` | 400 |
| `$fw-medium` | 500 |
| `$fw-semibold` | 600 |
| `$fw-bold` | 700 |

### Font Size & Font Weight Scale
| Role / Element | SCSS Token | px | rem | Tailwind Eq. | Typical Use Case |
|----------------|-----------|-----|-----|--------------|------------------|
| Hero / Display 1 | `$fs-display` | 56px | 3.5rem | `text-6xl/7xl` | Main homepage hero headline |
| Heading 1 (H1) | `$fs-h1` | 40–48px | 2.5–3rem | `text-4xl/5xl` | Section titles, feature highlights |
| Heading 2 (H2) | `$fs-h2` | 30–32px | 1.875–2rem | `text-3xl` | Sub-section headers, feature grid titles |
| Heading 3 (H3) | `$fs-h3` | 24px | 1.5rem | `text-2xl` | Card titles, block headers |
| H4 / Large Subtitle | `$fs-h4` | 20px | 1.25rem | `text-xl` | Lead paragraphs, callouts, modal titles |
| Body Large / Lead | `$fs-lead` | 18px | 1.125rem | `text-lg` | Secondary hero copy, highlighted descriptions |
| Body (Base) | `$fs-body` | 16px | 1rem | `text-base` | Standard body text, main UI content |
| Body Small / Caption | `$fs-sm` | 14px | 0.875rem | `text-sm` | Secondary text, nav items, buttons |
| Micro / Overline | `$fs-micro` | 12px | 0.75rem | `text-xs` | Category tags, badges, footer legal text |

### Shared Typography Mixins (`src/styles/_mixins.scss`)
- `section-label-style` → `$fs-micro`, Medium weight, uppercase overline.
- `section-title-style` → `$fs-h2`, Bold weight.
- `btn-base` → `$fs-sm`, Semi-Bold weight, uppercase, `$font-family-sans`.

### Usage Rules
- Map each element to its **semantic role** (hero, title, body, caption), never copy a raw
  pixel value.
- Use `$fw-bold` (700) for display titles — do not exceed the 700 cap (no 800/900).
- Code/editor/terminal text always uses `$font-family-mono` (typically at `$fs-sm`).
- The root `html { font-size: $base-font-size; }` is 16px; all `rem` tokens scale off it.

---

### 3. Key Components
- **Portfolio/Projects Section**: A modern grid displaying projects with high-quality images sourced directly from the `public/gallery`.
- **Work Experience Section**: A custom-designed vertical timeline with numerical checkpoints (01, 02, 03) and connecting line logic.
- **BandSections Component**: A specialized "About" section refined to highlight core personal and professional identity.
- **Reusable UI Library**: Specialized components like `HeadingText` and `ActionButton` ensure design consistency across the site.

### 4. Technical Stack
- **Framework**: Next.js 15+ with App Router.
- **Language**: TypeScript for robust type safety and improved developer experience.
- **Styling**: Vanilla SCSS with a comprehensive design system utilizing variables and mixins for scaleable styling.
- **Animations**: Framer Motion for complex transition orchestration.
- **Icons**: Lucide-React for crisp, consistent iconography.

---

## Recent Work & Refactoring
- **Gallery Integration**: Successfully mapped the `public/gallery` folder to the portfolio grid, optimizing asset delivery.
- **SCSS Modernization**: Migrated inline styles to dedicated SCSS modules to adhere to best practices and improve maintainability.
- **Content Centralization**: Moved all portfolio-related content into structured data files (`data/portfolioData.ts`) for easy updates.

---

## Deployment

This project has **two independent deploy paths** — be aware which one you are using:

1. **Cloudflare Pages** (primary): `npm run pages:build` (`@cloudflare/next-on-pages`), configured via `wrangler.toml` with `.open-next/` build output. Data via Turso/libSQL + Prisma.
2. **Standalone Node server** (`server/server.ts`): an independent Apollo GraphQL server (port 4000), not wired into the Next.js app. Run separately with `node server/server.ts` and keep it out of the Cloudflare bundle.

Deploying to one path does not deploy the other.

## Future Roadmap
- Integration of a live contact form with server actions.
- Enhanced terminal interactivity for a truly immersive developer experience.
- More project case studies with detailed technical breakdowns.

---
*Created by [Sevak Avetisyan](https://www.linkedin.com/in/sevak-avetisyan-arm/)*
