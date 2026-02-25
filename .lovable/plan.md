

# Add Collection & Comparison Pages to Sitemap

## Problem
The new ~760 collection and comparison pages exist in code but Google can't find them because:
- `public/sitemap.xml` doesn't reference `sitemap-collections.xml`
- `public/sitemap-collections.xml` doesn't exist as a static file

## Solution

### 1. Update `public/sitemap.xml` (sitemap index)
Add the missing `sitemap-collections.xml` entry:
```xml
<sitemap>
  <loc>https://iconstack.io/sitemap-collections.xml</loc>
  <lastmod>2026-02-25</lastmod>
</sitemap>
```

### 2. Create `public/sitemap-collections.xml`
Generate the static XML file containing all collection and comparison URLs:
- **50 category pages**: `/icons/arrow`, `/icons/navigation`, etc.
- **~1,050 category+library pages**: `/icons/arrow/tabler`, `/icons/arrow/lucide`, etc.
- **210 comparison pages**: `/compare/lucide-vs-feather`, `/compare/tabler-vs-material`, etc.

### 3. Update `scripts/regenerate-sitemaps.js`
Add a function to auto-generate `sitemap-collections.xml` so future regeneration scripts include these pages. This pulls category slugs from `seo-categories.ts` data and generates all comparison pair slugs.

## Files Changed
- **`public/sitemap.xml`** -- Add collections sitemap reference
- **`public/sitemap-collections.xml`** -- New static file with ~1,310 URLs
- **`scripts/regenerate-sitemaps.js`** -- Add collections sitemap generation logic

## After This
Once deployed, submit the updated sitemap to Google Search Console for faster crawling. Google will start indexing the ~760+ new pages.
