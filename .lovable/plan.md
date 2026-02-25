

# Fix Icon Detail Page + Redesign Library Page

## 3 Issues to Fix

### 1. Icon Preview Still Small
**Root cause:** SVG strings contain hardcoded `width="24" height="24"` attributes that override CSS classes like `[&>svg]:!w-[400px]`.

**Fix in `src/pages/IconDetailPage.tsx`:**
- Strip `width` and `height` attributes from SVG string before rendering
- Use a CSS container to control size: `w-full max-w-[400px] aspect-square` on desktop, `max-w-[200px]` on mobile
- Apply `[&>svg]:w-full [&>svg]:h-full` so SVG fills the container

### 2. Similar Icons Not Loading
**Root cause:** Search worker is unreliable -- requires indexing 5 libraries into a web worker before searching, timing-dependent, often fails silently.

**Fix in `src/pages/IconDetailPage.tsx`:**
- Remove search worker dependency entirely from this page
- Replace with a simple main-thread approach:
  1. Load the current library (already loaded)
  2. Load 2 popular libraries (e.g., lucide, tabler -- small async imports)
  3. Filter by matching icon name words and tag overlap
  4. This is deterministic, fast, and always works
- Keep `handleSimilarIconClick` navigation to detail pages (already working)

### 3. Redesign Library Page (New UI)
**Root cause:** Current LibraryPage has a basic layout, crashes on `libraryMetadata.name` access before null check, and IconGrid has no fixed-height container so virtualization breaks for large libraries.

**Full rewrite of `src/pages/LibraryPage.tsx`:**
- Add breadcrumbs: `Home > Library Name`
- Proper header with library name, description, icon count, and back navigation
- Wrap IconGrid in a `h-[calc(100vh-280px)]` container for virtualization to work
- Add `onIconClick` handler to navigate to icon detail pages (internal linking)
- Add optional chaining for all `libraryMetadata` access
- Add `RotatingFooter` at the bottom
- Mobile-responsive layout using `useIsMobile` hook
- SEO: keep existing Helmet/schema markup with null guards
- Add "Explore other libraries" links section below the grid for internal linking

---

## Technical Details

**Files modified (2):**

**`src/pages/IconDetailPage.tsx`**
- In `iconPreview`, strip `width="..."` and `height="..."` from SVG string using regex before `dangerouslySetInnerHTML`
- Replace `findSimilarIconsAcrossLibraries` function: remove search worker calls, load 2-3 libraries directly via `iconLibraryManager.loadLibrary()`, filter by name/tag match on main thread
- Remove `useSearchWorker` import and hook usage
- Remove the retry `useEffect` for `searchWorkerReady`

**`src/pages/LibraryPage.tsx`**
- Import `Link` from react-router-dom, `useIsMobile`, `RotatingFooter`, `Home`/`ArrowLeft` from lucide, breadcrumb components
- Add breadcrumb navigation (Home link + library name)
- Add `onIconClick` to `IconGrid` that navigates to `/icon/{libraryId}/{iconName}`
- Wrap IconGrid in fixed-height scrollable container
- Add optional chaining on all `libraryMetadata` references in render
- Add "Explore other libraries" section with links to 3-4 popular libraries
- Add `RotatingFooter` component at bottom
- Mobile layout: stacked vertical with smaller header text

