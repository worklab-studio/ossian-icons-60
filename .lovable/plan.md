

# Programmatic SEO: Collection & Comparison Pages

## Scale
- **Collection pages** ("Best arrow icons for UI design"): ~50 categories = **50 pages**
- **Comparison pages** ("Lucide vs Feather Icons"): 21 libraries = **210 unique pairs**
- **Category-per-library pages** ("Best arrow icons in Tabler"): ~50 categories x 21 libraries = up to **1,050 pages** (filtered to those with 3+ icons = ~500 useful pages)
- **Total: ~760 high-quality pages** targeting mid-funnel search queries

## Architecture

### New Files

1. **`src/data/seo-categories.ts`** -- Static list of ~50 curated tag-based categories with SEO metadata
   ```text
   { slug: "arrow", title: "Arrow", searchTags: ["arrow", "pointer", "direction", "chevron"],
     seoTitle: "Best Arrow Icons for UI Design",
     seoDescription: "Browse {count} free arrow SVG icons across {libs} libraries..." }
   ```

2. **`src/services/CollectionService.ts`** -- Service to programmatically match icons to categories by scanning tags/names, and to generate comparison data between two libraries (shared icon names, unique counts, style differences)

3. **`src/pages/CollectionPage.tsx`** -- Renders `/icons/:category` (e.g., `/icons/arrow`)
   - Layout matches home page (left info panel, center grid, right control panel)
   - Left panel: category name, description, icon count, links to related categories
   - Center: icons from ALL libraries matching that category, grouped by library using `SectionedIconGrid`
   - SEO title: "Best Arrow Icons for UI Design - Free SVG Download | Iconstack"
   - Helmet meta tags, schema markup, canonical URL

4. **`src/pages/ComparisonPage.tsx`** -- Renders `/compare/:libraryA-vs-:libraryB` (e.g., `/compare/lucide-vs-feather`)
   - Left panel: comparison summary (counts, styles, overlap stats)
   - Center: side-by-side icon samples, shared icons shown together, unique icons per library
   - SEO title: "Lucide vs Feather Icons - Which SVG Library is Better? | Iconstack"
   - Internal links to both library pages

5. **`src/pages/CategoryLibraryPage.tsx`** -- Renders `/icons/:category/:libraryId` (e.g., `/icons/arrow/tabler`)
   - Similar to CollectionPage but filtered to one library
   - SEO title: "Best Arrow Icons in Tabler - Free SVG Download | Iconstack"
   - Only generated for library+category combos with 3+ matching icons

### Modified Files

6. **`src/App.tsx`** -- Add 3 new routes:
   - `/icons/:category` -> CollectionPage
   - `/icons/:category/:libraryId` -> CategoryLibraryPage
   - `/compare/:slug` -> ComparisonPage

7. **`src/services/SitemapService.ts`** -- Add methods to generate sitemaps for collection and comparison pages

## Category Definition (in `seo-categories.ts`)

~50 curated categories derived from the most common tags across all 51k icons:

```text
arrows, navigation, user/people, communication, media, files/documents,
weather, shopping/commerce, social, devices, charts/data, editing,
security/lock, calendar/time, map/location, settings/gear, notification,
heart/favorite, star/rating, home, search, download/upload, cloud,
code/development, education, food/drink, health/medical, finance,
transport/vehicle, animals, sports, building, music/audio, camera/photo,
power/energy, layout/grid, text/typography, shapes/geometry, toggle/switch,
flag, gift, tools/wrench, database/server, wifi/signal, battery, clipboard,
bookmark, filter/sort, refresh/sync, link/chain
```

Each category maps to multiple tag keywords for broad matching.

## URL Structure

```text
/icons/arrow                    -> All arrow icons across all libraries
/icons/arrow/tabler             -> Arrow icons in Tabler specifically
/compare/lucide-vs-feather      -> Side-by-side comparison
```

## SEO Titles

| Page Type | Title Format |
|-----------|-------------|
| Collection | "Best {Category} Icons for UI Design - Free SVG Download \| Iconstack" |
| Category+Library | "Best {Category} Icons in {Library} - Free SVG Download \| Iconstack" |
| Comparison | "{LibA} vs {LibB} Icons - Which SVG Icon Library is Better? \| Iconstack" |

## Internal Linking Strategy

- Collection pages link to: individual icon pages, library pages, related categories
- Comparison pages link to: both library pages, shared icon detail pages
- Library pages: add "Browse by category" links to relevant collection pages
- Home page footer or nav: link to popular collections and comparisons

## Implementation Order

1. Create `seo-categories.ts` (static data)
2. Create `CollectionService.ts` (matching logic)
3. Create `CollectionPage.tsx` (category page)
4. Create `ComparisonPage.tsx` (comparison page)
5. Create `CategoryLibraryPage.tsx` (category+library page)
6. Update `App.tsx` routes
7. Update `SitemapService.ts` for new URLs

