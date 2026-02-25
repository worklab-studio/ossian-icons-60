

# Show All Similar Icons + 36px Preview + SEO Review

## Changes

### 1. Primary Icon Size: 36x36 (`src/pages/IconDetailPage.tsx`)

- Line 310: Change `[&>svg]:w-6 [&>svg]:h-6` to `[&>svg]:w-9 [&>svg]:h-9` (36px)
- Line 318: Change `size: 24` to `size: 36`

### 2. Show ALL Similar Icons (remove `.slice(0, 24)`)

- Line 154: Remove `.slice(0, 24)` so all scored icons with score > 0 are shown
- Line 162 (fallback): Remove `.slice(0, 24)` there too

This means if an icon like "arrow" matches 200+ icons across all libraries, they all show. The CSS grid handles any count gracefully.

### 3. SEO/Indexing Assessment

The page is already well-suited for traffic and indexing:

- **Helmet meta tags**: Unique `<title>`, `<meta description>`, Open Graph tags, and Twitter cards per icon page
- **Schema.org JSON-LD**: Structured data via `useSchemaMarkup` hook (BreadcrumbList, CreativeWork, etc.)
- **Sitemaps**: Individual XML sitemaps per library (e.g., `sitemap-phosphor.xml`) with every icon URL listed
- **Canonical URLs**: Clean `/icon/{library}/{icon-name}` structure
- **robots.txt**: Present and configured
- **Breadcrumbs**: Rendered in both UI and schema markup

**What's good:** Every icon has a unique, crawlable URL with proper meta, schema, and sitemap coverage. This is solid for Google indexing.

**Minor improvement opportunities** (not in this plan, but worth noting):
- Add `<link rel="canonical">` explicitly in Helmet to avoid duplicate content issues
- Consider adding `alt` text or `aria-label` descriptions to the SVG preview for accessibility signals

---

## Technical Details

**File: `src/pages/IconDetailPage.tsx`**
- Line 154: `slice(0, 24)` removed
- Line 162: `slice(0, 24)` removed
- Line 310: `w-6 h-6` changed to `w-9 h-9`
- Line 318: `size: 24` changed to `size: 36`

