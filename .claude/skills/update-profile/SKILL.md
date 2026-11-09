---
name: update-profile
description: Update personal or professional info on the portfolio (job titles, dates, metrics, contact details, links, summary) everywhere it appears. Use when the owner's CV, LinkedIn, or contact info changes.
---

# Update profile info

The site must match the owner's LinkedIn exactly; recruiters compare them.

1. **Collect the exact new values** from the user (official title, dates, metric wording). Don't paraphrase or round. If they paste LinkedIn text, use it verbatim.
2. **Search for the old value everywhere** before editing:
   ```bash
   grep -rn "<old value>" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .
   ```
   Typical hits: `src/data/portfolioData.ts` (`HERO_DATA`, `EXPERIENCE`, `RESUME`, `PROJECTS`, `FEATURED_WORK`), `src/data/footerData.ts`, `index.html` meta/OG/Twitter tags, `README.md`, page `constants.ts` SEO copy.
3. **Edit the source of truth first** (`portfolioData.ts`), then every other hit. `EXPERIENCE` feeds both the home timeline and `/resume`, so one edit covers both.
4. **Re-run the search** for the old value; it should return nothing.
5. Run the `verify` skill, then list every file changed so the user can compare against LinkedIn.
