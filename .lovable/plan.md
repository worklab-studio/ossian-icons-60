

# Add Devicon Icon Library

Add **Devicon** (devicons/devicon) — a popular set of programming language, framework, and developer tool logos — as a new icon library in Iconstack.

## What you'll get

- **~200 brands/tools** (React, Vue, Python, Docker, AWS, etc.) each with multiple variants (original, plain, line, with wordmark).
- New sidebar entry: **Devicon** with proper count badge.
- Browseable at `/library/devicon`, with individual icon detail pages, search indexing, sitemap entry, and category filtering — same as every other library.

## What changes

### 1. New data file: `src/data/devicon.ts`
Generated from the official `devicon.json` manifest on the devicons/devicon repo. Each icon variant becomes one `IconItem`:

```ts
{
  id: 'devicon-react-original',
  name: 'react',
  svg: '<svg ...>...</svg>',  // inlined from CDN
  style: 'original' | 'plain' | 'line' | 'original-wordmark' | ...,
  category: 'language' | 'framework' | 'tool' | ...,
  tags: ['react', 'javascript', 'frontend', ...],
}
```

A one-off Node script (`scripts/fetch-devicon.js`) fetches `devicon.json`, downloads each SVG from `cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{name}/{name}-{variant}.svg`, normalizes them (strip width/height, ensure viewBox), and writes the `.ts` file. Script is run once; output is committed.

### 2. `src/data/index.ts`
Add `export * from './devicon';`.

### 3. `src/services/IconLibraryManager.ts`
- Append metadata entry:
  ```ts
  { id: 'devicon', name: 'Devicon', count: <actual>, style: 'brand', description: 'Programming languages, frameworks & developer tools' }
  ```
- Add a case in `importLibrary()` to dynamically import `./devicon`.
- Add `'devicon'` prefix handling in `filterIconsByLibraryId()`.

### 4. `src/components/app-sidebar.tsx`
Add a `Code2` (lucide) entry to `iconMap` for `devicon` so it gets a proper sidebar icon.

### 5. SEO / sitemap
- Add `/public/sitemap-devicon.xml` to the sitemap generation script (`scripts/generate-sitemaps-complete.js`) and reference it from `sitemap.xml`.
- Add Devicon to any library-list arrays used by `seo-categories.ts` if applicable.

## Notes & constraints

- Brand-style library (multi-color SVGs with embedded fills) — color/stroke-width controls in the customize panel will be **disabled** for Devicon, matching how Simple Icons (Brand) is already handled in `isFilledIconLibrary()` / `supportsStrokeWidth()`. I'll add `'devicon-'` to those checks.
- Bundle size: ~200 icons × ~3 variants average ≈ 600 SVGs. Devicon SVGs are small (~1–2 KB each) → roughly 1–1.5 MB added to `devicon.ts`. This is in line with `material.ts` and `tabler.ts` and is loaded lazily via `importLibrary()`, so it won't slow initial page load.
- No changes to mobile drawer needed — it reads from the same metadata.

## Files touched

- `src/data/devicon.ts` (new, generated)
- `src/data/index.ts`
- `src/services/IconLibraryManager.ts`
- `src/components/app-sidebar.tsx`
- `src/lib/icon-utils.ts` (add devicon to filled-library check)
- `scripts/fetch-devicon.js` (new, one-off generator)
- `scripts/generate-sitemaps-complete.js` + `public/sitemap.xml` + new `public/sitemap-devicon.xml`

