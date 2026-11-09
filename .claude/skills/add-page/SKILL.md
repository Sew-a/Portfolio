---
name: add-page
description: Add a new route/page to the portfolio (paths, lazy route, nav entry, page folder, SEO, README). Use when asked to create a new page or route.
argument-hint: "<route-path> [nav label]"
---

# Add a page

Inputs: the route path (e.g. `/talks`) and, if it belongs in the header nav, its label. Ask if unclear.

1. **Path.** Add a camelCase key to `paths` in `src/routes/mainRoutes.ts`. If it should appear in the nav, add `{ name, path }` to `routeNames` (order = nav order). If the footer should link it, add it to `FOOTER_NAV` in `src/data/footerData.ts`.
2. **Page folder.** Create `src/pages/<route>/page.tsx`:
   ```tsx
   import Seo from "@/src/components/Seo";
   import { <ROUTE>_SEO } from "@/src/pages/<route>/constants";
   import "@/src/pages/<route>/styles.scss";

   export default function <Route>Page() {
     return (
       <main className="<route>-page">
         <Seo title={<ROUTE>_SEO.title} description={<ROUTE>_SEO.description} />
         {/* sections */}
       </main>
     );
   }
   ```
   Put SEO copy and page text in `src/pages/<route>/constants.ts`. Page-only components go in `src/pages/<route>/_components/`.
3. **Route.** In `src/App.tsx`, add `const X = lazy(() => import("@/src/pages/<route>/page"));` and a `<Route path={paths.x} element={<X />} />` above the `*` catch-all.
4. **Docs.** Add a row to the pages table in `README.md`.
5. **Verify.** Run the `verify` skill. If a dev server is available, open the route and check both themes and a mobile width.
