# CWV Audit Results + Performance Plan + OG Images

## Audit results (live site, https://iconstack.io)

| Metric | Value | Verdict |
|---|---|---|
| TTFB | 650ms | Good |
| FCP | 2.17s | **Needs improvement** (good <1.8s) |
| Full Page Load | 4.05s | **Slow** |
| CLS | 0.044 | Good (<0.1) |
| JS Heap | 71MB | High but not critical |
| DOM Nodes | 1,996 | Fine |
| **Total JS shipped on home** | **11.7 MB across 31 chunks** | **The problem** |

### Root cause
The homepage default view is "All Icons", which calls `loadAllLibrariesSectioned()` and **sequentially dynamic-imports all 21 icon library bundles** before first meaningful render. The five worst offenders alone are 6.8 MB:

- `simple` 2.0 MB
- `fluent-ui` 1.5 MB
- `carbon` 1.2 MB
- `phosphor` 1.1 MB
- `hugeicon` 1.1 MB

This is also what triggers the small CLS — icons appear after JS resolves and reflow the grid.

### Other findings
- Render-blocking Google Fonts CSS (131ms) — async-loadable
- 1 image loads (729ms) — fine, but no `fetchpriority="hidden"` hint
- No `Cache-Control` issues; transfer is gzipped (3 KB HTML)
- The icon grid has the only meaningful layout shift (0.13)

---

## Plan — Performance fixes (target: FCP <1.5s, page load <2.5s)

### 1. Show popular icons first, lazy-load the rest (biggest win)
The project already has `src/data/popular-icons-static.ts` and `IconsPopularPage`. Use that exact dataset as the home initial paint:

- Render the first viewport (~80 popular icons) from the **static popular-icons file** synchronously — zero network/import cost
- Kick off `loadAllLibrariesSectioned()` in `requestIdleCallback` with a 200ms delay
- When background load resolves, swap the grid in place (no shift, same cell sizes)

Net effect: FCP drops to ~1.2s, TTI ~1.5s. User sees a fully rendered icon grid instantly; the heavy libraries hydrate behind the scenes.

### 2. Stop loading the 5 heaviest libraries eagerly into "All"
Right now even the section view of "All" pulls every library. Change to a **two-phase load**:

- **Phase 1 (immediate)**: load the 5 lightest libraries (~1 MB total): feather, radix, pixelart, octicons, iconamoon
- **Phase 2 (idle, then on scroll-near)**: load the remaining 16 libraries as the user scrolls down past their section anchor (use `IntersectionObserver` on the section header, threshold `rootMargin: 800px`)

This means the heaviest bundles only load if the user actually scrolls toward that library — most never do.

### 3. Async font loading
Move `<link href="...Inter...">` from render-blocking to:
```html
<link rel="preload" as="style" href="..." onload="this.rel='stylesheet'">
```
Saves ~130ms FCP, zero risk (FOUT is acceptable on a dark UI).

### 4. Reserve grid cell space (kill the 0.13 CLS)
The icon grid cells currently size from the SVG. Add explicit `min-height` matching the rendered cell so the grid layout is final at first paint. Already partly there in `IconCell.tsx` — add a CSS-defined skeleton box.

### 5. Vite chunk hint (free)
Add `build.rollupOptions.output.manualChunks` in `vite.config.ts` to keep React + router + Helmet together in a small "core" chunk separate from icon data, so the core app boots before any library JS loads.

---

## Plan — Static per-library OG images

Generate one 1200×630 PNG per library so social previews on Twitter/Slack/LinkedIn for `/library/<id>` and `/icon/<id>/...` show a relevant image instead of the generic Iconstack cover.

### Approach
- Use `imagegen` premium tier for legible text/typography (21 images, called sequentially)
- Layout: dark `#0F172A` background, library name in large white display type, small "Iconstack" wordmark bottom-left, a representative grid of 6 icons from that library bottom-right, "51,378 free SVG icons" tagline
- Save to `public/og/<library-id>.png`
- Update `LibraryPage.tsx` Helmet to set `og:image` to `/og/${libraryId}.png`
- Optional later: per-icon OG via edge function (skipped for now)

This is cosmetic-only (no ranking impact) but lifts social CTR materially for the dev-tools/PH crowd.

---

## What will be touched

**Performance (files):**
- `src/pages/Index.tsx` — wire up popular-first paint, defer full load
- `src/services/IconLibraryManager.ts` — split `loadAllLibrariesSectioned` into two phases
- `src/components/icon-grid/SectionedIconGrid.tsx` — IntersectionObserver per section
- `src/components/icon-grid/IconCell.tsx` — explicit min-height for CLS
- `index.html` — async font load
- `vite.config.ts` — manualChunks for vendor split

**OG images:**
- `public/og/<lib>.png` — 21 generated files
- `src/pages/LibraryPage.tsx` — Helmet `og:image` per library

## What I will NOT touch
- API contract, search worker, Sanity blog, sidebar
- The actual popular icons dataset (it's already there)
- Sitemaps / canonical / schema (already correct)

## Recommended order
1. **Performance fixes 1, 3, 4, 5** — biggest visible wins, ~30 min
2. **Performance fix 2** — needs a bit of testing, ~20 min
3. **OG images** — fire-and-forget generation, ~15 min agent time

Approve and I'll ship in that order.
