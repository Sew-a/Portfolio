---
paths:
  - "src/data/**"
  - "src/components/*/constants.ts"
  - "src/pages/**/constants.ts"
  - "index.html"
  - "README.md"
---

# Personal and professional content

- Facts about Sevak (titles, companies, dates, metrics, contact links) must match his LinkedIn exactly. Recruiters compare the two. Never invent or round metrics; ask if unsure.
- `src/data/portfolioData.ts` is the source of truth. `EXPERIENCE` feeds both the home timeline and the résumé page; `PROJECTS` feeds the work cards and case-study pages.
- Facts are still duplicated in a few places (contact data, SEO meta tags in `index.html`, README). After any change, search the whole repo for the old value (excluding `node_modules`, `dist`) and update every hit.
- Section copy that is not personal fact lives in the owning component's or page's `constants.ts`.
- Use the `update-profile` skill for multi-place edits.
