# SEO Status & Phase C Plan

## Already done (Phase A + B)
- 52,830 URLs across 26 sitemaps, including blog from Sanity
- Canonical tags on all major page types (Icon, Library, Comparison, Blog, Collection, Category)
- Rich JSON-LD: WebApplication + offers + featureList + BreadcrumbList
- Article schema on blog posts
- `<link rel="alternate">` for icons-index.json + llms.txt (AI discovery)
- llms.txt, robots.txt fully open to AI crawlers
- Per-page Helmet meta on all 11 page types

## Still pending — Phase C (polish)

### 1. Static discovery files (5 min)
- `public/humans.txt` — credits / team / tech stack
- `public/.well-known/security.txt` — security contact (expected by scanners; small SEO trust signal)

### 2. Footer/homepage link to /api (2 min)
The `/api` page (with MCP server + JSON API docs) is in sitemap but not linked from the homepage. Internal linking = both SEO juice and human discovery for the dev/AI-tools angle we built for PH.
- Add an "API & MCP" link to the footer (RotatingFooter or main footer)

### 3. Dynamic OG images (larger — optional)
Right now every page shares one OG cover. Per-page OG would dramatically lift CTR on social/Slack previews for icon detail pages and library pages.

Two options:
- **Lightweight**: Static per-library OG images (21 PNGs, generated once with imagegen) — covers ~80% of share traffic
- **Full**: Edge function rendering OG on demand from icon SVG + name (best, but more work)

### 4. Misc small wins
- `<meta name="referrer" content="origin-when-cross-origin">` in index.html
- Add `hreflang="x-default"` to canonical (signals language-agnostic)
- Self-referencing canonical on every Helmet instance (verify they're absolute URLs, not relative)

## Recommendation
Do **1 + 2 + 4 now** (15 min, all wins, zero risk). Decide on **3** separately — static per-library OG is the sweet spot.

## What I will NOT touch
- Sitemaps (already complete and verified)
- Existing canonical/schema implementations (already correct)
- robots.txt / llms.txt (already optimal)

Approve and I'll ship 1, 2, 4 — and static per-library OG images if you want #3 included.
