# SEO Status & Next Steps

## What's already strong ✅

- Rich `index.html` meta (title, description, OG, Twitter, JSON-LD WebApplication)
- `robots.txt` explicitly allows all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- `llms.txt` is comprehensive — lists API, MCP, sitemaps, libraries
- 26 sitemap files, **38,669 URLs** indexed, sitemap index references all
- Per-page `SchemaMarkup` (Breadcrumb, ItemList, CreativeWork, ImageObject, FAQ, Dataset)
- Programmatic SEO: ~760 collection + comparison pages already in `sitemap-collections.xml` (1,354 URLs) and `sitemap-categories.xml` (1,188 URLs)
- Public API + MCP server discoverable via `llms.txt` (huge AI-era win)

## Gaps worth fixing 🔧

### 1. Broken sitemaps (HIGH priority — losing ~9k indexed URLs)
- `sitemap-material.xml`: **0 URLs**
- `sitemap-simple.xml`: **0 URLs**
- Total is 38.6k vs expected 47k+
- Root cause: `scripts/generate-sitemaps.js` failing for these libraries. Need to debug + regenerate.

### 2. Blog not in sitemap index
- `BlogIndexPage` exists with Helmet meta, but no `sitemap-blog.xml` and not in `sitemap.xml` index
- Sanity blog posts won't be discovered by Google

### 3. Missing `<link rel="canonical">`
- `index.html` has no canonical tag
- Per-page canonicals via Helmet not consistently set (need to verify on IconDetailPage, LibraryPage, CollectionPage)
- Risk: duplicate content penalties on category × library overlap pages

### 4. MCP / API discoverability for humans
- `ApiDocsPage` exists but no link from homepage / footer to the new API + MCP
- Add a "Developers" or "API & MCP" entry visible from `/`

### 5. Minor wins
- `index.html` JSON-LD doesn't include `aggregateRating` or `offers` (free) — both boost SERP appearance
- No `BreadcrumbList` in static `index.html` (only client-side via Helmet, slower for crawlers)
- `sitemap-collections.xml` lastmod is missing (uses default)

## Proposed plan

### Phase A — Fix what's broken (must do)
1. Debug `generate-sitemaps.js` for material + simple libraries; regenerate full set
2. Add `sitemap-blog.xml` generator pulling from Sanity, register in `sitemap.xml` index
3. Add `<link rel="canonical">` to `index.html` and verify per-route canonicals via Helmet on IconDetailPage, LibraryPage, CategoryLibraryPage, ComparisonPage

### Phase B — High-leverage AI-SEO wins
4. Expand `index.html` JSON-LD: add `offers` (free), `aggregateRating` (if real reviews exist — otherwise skip), `featureList` mentioning MCP + API
5. Add a homepage section / footer link "For developers — API & MCP" to surface `/api` page (also helps PH launch story)
6. Add `<link rel="alternate" type="application/json" href="/api/icons-index.json">` in `index.html` so AI crawlers find the index file directly

### Phase C — Optional polish
7. Add `og:image` per library/icon detail page (dynamic OG via existing SVG)
8. Generate `humans.txt` and `security.txt`
9. Add Article schema to blog posts (BlogPostPage)

## Recommendation

Do **Phase A immediately** — you're losing ~20% of potential indexed pages and have no canonicals (real SEO risk). Phase B is the AI-era moat that complements the MCP launch. Phase C is nice-to-have.

Approve Phase A, or A+B together?
