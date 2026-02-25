

# Icon Detail Page: Internal Linking + UI/UX Improvements

## Current Problems

1. **No internal linking** -- Similar icons just copy on click; they don't link to their own detail pages, so Google can't discover them
2. **Breadcrumb missing Home** -- No link back to homepage in the breadcrumb trail
3. **No "More from this library" link** -- Dead end page with no way to explore the library
4. **Tags aren't clickable** -- Icon tags exist in data but aren't displayed or linked to search
5. **Right panel doesn't scroll** -- Content gets cut off, especially the similar icons section
6. **No mobile layout** -- Page only has desktop layout despite having `isMobile` hook

---

## Changes

### 1. Make Similar Icons Link to Their Detail Pages
**File:** `src/pages/IconDetailPage.tsx`
- Pass `onIconClick` to `IconGrid` that navigates to `/icon/{libraryId}/{iconName}` instead of just copying
- Each similar icon becomes a crawlable internal link for Google
- Extract the library ID from the icon's `id` field (format: `libraryId-iconName`)

### 2. Fix Breadcrumbs with Home Link
**File:** `src/pages/IconDetailPage.tsx`
- Add Home as the first breadcrumb item: `Home > Tabler > arrow-left`
- Home links to `/`, library links to `/library/{libraryId}`

### 3. Add "More from this Library" Link Section
**File:** `src/pages/IconDetailPage.tsx`
- Below technical details, add a prominent link: "Browse all {count} icons in {Library Name}" linking to `/library/{libraryId}`
- Also add links to 2-3 other popular libraries as "Explore other libraries"

### 4. Display Tags as Clickable Search Links
**File:** `src/pages/IconDetailPage.tsx`
- Show icon tags as Badge components below the icon name
- Each tag links to `/?q={tag}` to trigger a search on the homepage
- These act as internal links Google can follow to discover more content

### 5. Make Right Panel Scrollable
**File:** `src/pages/IconDetailPage.tsx`
- Change the right panel from `overflow-hidden` to `overflow-y-auto`
- Ensures similar icons and all content is accessible regardless of screen height

### 6. Add Mobile Layout
**File:** `src/pages/IconDetailPage.tsx`
- Add a responsive mobile layout (stacked vertical) using the existing `isMobile` hook
- Icon preview on top, details below, similar icons at bottom
- Copy/download actions via the existing `MobileIconActions` sheet
- Hide ControlPanel sidebar on mobile

### 7. Add Quick Copy Buttons to Icon Preview
**File:** `src/pages/IconDetailPage.tsx`
- Add "Copy SVG" and "Download SVG" buttons directly below the large icon preview
- Users can take action without finding the sidebar control panel

---

## Technical Details

**Files modified (2):**
- `src/pages/IconDetailPage.tsx` -- all UI changes, internal linking, mobile layout
- `src/components/IconDetailHeader.tsx` -- add search input or back button for mobile

**Key implementation details:**
- Extract library ID from similar icon IDs using `icon.id.split('-')[0]` pattern, or fall back to checking which library each icon belongs to via `iconLibraryManager.libraries`
- Use `generateIconUrl()` from `src/lib/url-helpers.ts` for all internal links
- Use `Link` from react-router-dom for internal navigation (crawlable by Google)
- Similar icons grid: override `onIconClick` to call `navigate(generateIconUrl(libId, icon.name))`
- Tags rendered as `<Link to={`/?q=${tag}`}>` wrapped in Badge components

