---
name: update-work-projects
description: Add or update a project in Work / Projects, its case-study page, the home featured grid, and the Demos page, reusing the existing blocks. Use when a new project (app, game, library) should appear on the portfolio or an existing project's info, image, links or tech changes. Not for new features or new kinds of sections.
---

# Update work and projects

Content work only: reuse the blocks that already exist. Don't add new components, layouts or styles. If the project needs something the existing blocks can't show, stop and ask.

## 1. Collect the facts

Ask for anything missing; never invent metrics or links.

- Title, one-line tagline, status (`Live`, `In progress`, `Demo`...), year, role.
- Cover image (Cloudinary URL, `.webp` preferred) plus alt text. Optional extra screenshots.
- Live link (internal route like `/game` or an external URL) and repo URL.
- Tech stack. Check the code (`package.json`, `src/lib/...`, `assets-src/`) to confirm it rather than guessing.
- Any honest framing the owner wants (e.g. "demo; full game coming in Unity").

## 2. Edit every place a project appears

| Where | What to do |
| --- | --- |
| `src/data/portfolioData.ts` → `PROJECTS` | Add or update the full `Project` entry (summary, description, highlights, architecture, features, techStack, accent, icon). This drives the `/work` cards and the case-study page. |
| `src/data/portfolioData.ts` → `FEATURED_WORK` | Add or update the home grid card. Entries reuse `PROJECTS[i].image` / `.links` by index, so if you insert or reorder `PROJECTS`, fix every index. Put live projects before the `comingSoon` ones. `result` is one concrete line. |
| `src/constants/projectIcons.ts` | If `icon` is a new lucide name, import it and add it to `PROJECT_ICONS`. |
| `src/routes/mainRoutes.ts` → `paths` | New project only: add `<camelSlug>: '/work/<slug>'`. Not in `routeNames` (case studies aren't in the nav). |
| `src/pages/work/<slug>/page.tsx` | New project only: copy `src/pages/work/chat-app/page.tsx`, change slug and `<Seo>` title/description. |
| `src/App.tsx` | New project only: lazy import of that page plus a `<Route path={paths.<camelSlug>}>`. |
| `src/pages/work/page.tsx` | Update the `<Seo>` description if it lists the case studies. |
| `src/pages/demos/` | If the project has a playable demo: add `<NAME>_TECHNOLOGIES` and `<NAME>_DEMO` to `constants.ts`, add `_components/<Name>Demo/<Name>Demo.tsx` by copying `ChatDemo` (copy + tech tags + `Link` button + screenshot window), and render it in `DemosExperience.tsx` as another `motion.section` with `demos-page__banner demos-page__banner--chat`. Update `DEMOS_SEO.description`. |
| `README.md` | Add or update the `/work/<slug>` row in the routes table and the `/demos` row. Add or refresh a "<Project> features" block if the project lives in this repo. |
| `src/components/ExpertiseSection/constants.ts` | Only if the owner asks or the project changes a stated claim there. |

## 3. Check

1. Search for the old value or slug to catch stale copies:
   ```bash
   grep -rn "<old value or slug>" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .
   ```
2. Run the `verify` skill.
3. List every changed file and how to see the result: `/work`, `/work/<slug>`, `/`, `/demos`.
