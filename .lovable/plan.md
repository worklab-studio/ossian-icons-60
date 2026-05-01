## Goals

1. Make `/api` (Iconstack API & MCP) feel deliberate at wide viewports — no empty left/right gutters.
2. Make navigation between `/` and `/api` (and other pages) feel near-instant.

---

## Part 1 — UI: fill the empty sides on `/api`

Today the page uses `max-w-6xl mx-auto` with a 2-column grid `[1fr_180px]`. On a 1442px viewport that leaves ~200px of empty background on each side and a thin underused TOC on the right. We'll switch to a true 3-column app shell.

### New layout (desktop ≥ lg)

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Sticky top bar (full width): ← Back · Iconstack/API · status pill   │
├──────────────┬───────────────────────────────────┬───────────────────┤
│              │                                   │                   │
│  LEFT RAIL   │   MAIN CONTENT (centered, prose)  │   RIGHT RAIL      │
│  240px       │   max-w-3xl, generous padding     │   260px           │
│  sticky      │                                   │   sticky          │
│              │                                   │                   │
│  • Brand     │   Hero (compact, no longer        │   On this page    │
│    block     │    full-bleed)                    │   (active section │
│  • Section   │   Quickstart                      │    highlighted)   │
│    nav       │   MCP                             │                   │
│  • "Built    │   Try it                          │   Endpoint card   │
│    with      │   …                               │   (base URL +     │
│    MCP"      │                                   │    copy)          │
│    badge     │                                   │                   │
│  • Links:    │                                   │   "Try a query"   │
│    Home,     │                                   │   mini playground │
│    Library,  │                                   │   (q + Run)       │
│    Blog,     │                                   │                   │
│    License   │                                   │   Status pill     │
│  • X-Auto-   │                                   │   + GitHub/npm    │
│    pilot ad  │                                   │   links           │
│              │                                   │                   │
└──────────────┴───────────────────────────────────┴───────────────────┘
```

### Concrete changes to `src/pages/ApiDocsPage.tsx`

- Replace the outer wrapper grid with:
  - Container: `max-w-[1400px] mx-auto px-4 sm:px-6`
  - Body grid (≥lg): `lg:grid-cols-[240px_minmax(0,1fr)_260px] lg:gap-10`
- **Left rail (new)** — sticky `top-16`, hidden on `<lg`:
  - Small Iconstack logo + "API & MCP" label
  - Vertical section nav reusing the existing `SECTIONS` array, with active-section highlight via IntersectionObserver
  - Divider
  - "Useful links" group: Back to icons, Browse libraries, Blog, License (uses `react-router-dom` `Link` for SPA nav)
  - X-Autopilot promo card (matches existing cross-promotion style from sidebar/footer per project memory)
- **Main column** — keep current sections, but constrain to `max-w-3xl` so line length stays readable; remove the inner `lg:grid-cols-[1fr_180px]` (right rail is now outside).
- **Right rail (new/expanded)** — sticky `top-16`, hidden on `<lg`:
  - "Endpoint" card: base URL with copy button
  - Mini "Try a query" — single input + Run, reuses `runTryIt` logic, links full results down to `#try-it`
  - "Status" card with the operational pill
  - Resource links: GitHub, npm (`iconstack-mcp`), llms.txt, JSON index
- Keep the existing rich Hero, but change its background to a subtle full-bleed gradient/border so the page feels intentional even though content is centered.
- Mobile (`<lg`): everything stacks; left rail collapses into a "Jump to section" `<details>` above the hero; right rail content (endpoint card, mini playground, status, links) is dropped — all that info already exists in the main flow on mobile.

No changes to design tokens; reuse `bg-card`, `border-border/60`, `bg-muted/30`, `text-muted-foreground`, etc.

---

## Part 2 — Faster page navigation

`src/App.tsx` eagerly imports every page (Index, Library, IconDetail, Blog, ApiDocs, …). Index in particular pulls the icon library bundles, so when the user clicks "API" the browser has to render a brand-new tree while the old one is still in memory — feels slow, especially on the first navigation.

### Changes

1. **Code-split routes in `src/App.tsx`**
   - Convert all page imports (Index, LibraryPage, IconDetailPage, IconsPopularPage, LicensePage, ApiDocsPage, CollectionPage, ComparisonPage, CategoryLibraryPage, BlogIndexPage, BlogPostPage, NotFound, IconsDemo) to `React.lazy(() => import('...'))`.
   - Wrap `<Routes>` in `<Suspense fallback={null}>` (per project memory: no artificial loading screens — render nothing during the brief chunk fetch rather than a spinner).
   - Effect: navigating to `/api` no longer drags the icon-library code with it; the ApiDocsPage chunk is small and loads fast.

2. **Prefetch on hover/intent**
   - Add a tiny helper `src/lib/prefetch.ts` exporting `prefetchApi()`, `prefetchLibrary()`, etc., each doing `import('../pages/ApiDocsPage')` etc.
   - In `src/components/app-sidebar.tsx` (and any `<Link to="/api">` in header/footer), add `onMouseEnter` / `onFocus` handlers that fire the matching prefetch. By the time the user actually clicks, the chunk is already cached.

3. **Use SPA navigation everywhere**
   - Audit `src/pages/ApiDocsPage.tsx` and the sidebar for any `<a href="/...">` pointing at internal routes; convert them to `<Link to="/...">` so the browser doesn't do a full document reload (which is the worst case for "slow navigation").

4. **Vite chunking touch-up in `vite.config.ts`**
   - Extend the existing `manualChunks` to put `react-helmet-async`, `@radix-ui/*`, and `lucide-react` into a shared `ui-vendor` chunk (already partially done) so route chunks stay small.
   - Add a `docs` chunk for `ApiDocsPage` + `LicensePage` (low-traffic, infrequently updated) so they share one cached download.

5. **Scroll restoration**
   - Add a small `<ScrollToTop />` component in `App.tsx` that calls `window.scrollTo(0, 0)` on `pathname` change, so navigating to `/api` doesn't appear "stuck" mid-scroll.

---

## Files touched

- `src/pages/ApiDocsPage.tsx` — new 3-column shell, left rail, expanded right rail, active-section tracking.
- `src/App.tsx` — `React.lazy` for all routes, `Suspense`, `ScrollToTop`.
- `src/lib/prefetch.ts` — **new**, tiny prefetch helpers.
- `src/components/app-sidebar.tsx` — wire `onMouseEnter` prefetch on the API/Library/Blog links; ensure all internal links use `Link`.
- `src/components/header.tsx` (if it links to `/api`) — same SPA-link + prefetch treatment.
- `vite.config.ts` — extend `manualChunks` with `ui-vendor` + `docs` groupings.

## Out of scope

- No backend / edge function changes.
- No copy changes to the API docs body content (only structural/layout).
- No design-token changes; everything uses existing semantic colors.
