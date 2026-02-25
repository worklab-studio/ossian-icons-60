
# Redesign Library Page to Match Home Page Layout

## Goal
Make the library page (`/library/:libraryId`) use the same layout as the home page, but replace the sidebar with a panel showing the library name and description.

## Desktop Layout

**Current home page structure:**
```text
+------------------+---------------------------+--------------+
| AppSidebar       | Header (search bar)       | ControlPanel |
| (library list)   |---------------------------|  (customize) |
|                  | Sub-header (title, count)  |              |
|                  |---------------------------|              |
|                  | IconGrid                  |              |
|                  |                           |              |
+------------------+---------------------------+--------------+
```

**New library page (desktop):**
```text
+------------------+---------------------------+--------------+
| Library Info     | Header (search bar)       | ControlPanel |
| - Name           |---------------------------|  (customize) |
| - Description    | Sub-header (count, filter) |              |
| - Icon count     |---------------------------|              |
| - Back link      | IconGrid                  |              |
|                  |                           |              |
+------------------+---------------------------+--------------+
```

**Mobile layout:** Same as home page mobile layout -- fixed header with search, library info below, then icon grid. Use the existing mobile components (MobileHeader pattern) but with library info instead of library selector.

## Technical Changes

### File: `src/pages/LibraryPage.tsx` (full rewrite)

**New imports needed:**
- `SidebarProvider` from ui/sidebar (for layout structure)
- `Header` from components/header (search bar)
- `ControlPanel` from components/control-panel
- `CategoryFilter` from components/CategoryFilter
- `MobileHeader`, `MobileCustomizeSheet`, `MobileIconActions` for mobile
- `sortIconsByStyleThenName` from lib/icon-utils
- `useFirstTimeUser`, `showFirstCopyNudge` for first-copy UX
- `ScrollArea` for sidebar scroll

**New state:**
- `searchQuery` + filtering logic (reuse pattern from Index.tsx)
- `selectedId` for icon selection
- `selectedCategory` for category filtering
- `showCustomizeSheet`, `showIconActions` for mobile

**Desktop layout:**
- Left panel: Fixed-width sidebar (~240px) with back arrow/link to home, library name (h1), description, icon count, and style info
- Center: `Header` component (search), sub-header with count + `CategoryFilter`, then `IconGrid`
- Right: `ControlPanel` (customize panel)
- Remove breadcrumbs (sidebar has back link), remove the big centered library header, remove "Explore Other Libraries" section
- Keep `RotatingFooter`

**Mobile layout:**
- Fixed top: `MobileHeader` (but with library name instead of library selector button)
- Below: Library name + count
- Main: `IconGrid`
- Bottom sheets for customize and icon actions

**Search/filter logic:**
- Local search: filter `icons` array by name/tags matching `searchQuery`
- Category filter from `availableCategories`
- `displayedIcons` = filtered + sorted via `sortIconsByStyleThenName`

**Icon click behavior:**
- Desktop: select icon (for ControlPanel) + navigate to detail page
- Mobile: show MobileIconActions sheet

**Keep existing:**
- SEO (Helmet, SchemaMarkup, canonical URL)
- Loading/error states
- `handleCopy` logic
