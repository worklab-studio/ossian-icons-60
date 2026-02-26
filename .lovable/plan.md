

# Redesign Demo Page with Home-like UI

## Overview

Transform the `/demo/icons` page from a plain layout into a professional, home-like three-column layout matching the main app (sidebar + icon grid + right panel), with proper SEO metadata since it's indexed on Google.

## Current State

The demo page is a basic full-width layout with inline controls (search, color picker, stroke slider) and a flat icon grid. It looks unfinished compared to the polished home page.

## Planned Layout

```text
+------------------+---------------------------+------------------+
|    Sidebar        |    Header (search bar)    |   Control Panel  |
|                  |---------------------------|                  |
|  - All Icons     |  Title + count            |   Color Picker   |
|  - Browse        |                           |   Stroke Slider  |
|                  |    Icon Grid              |   Export Options  |
|  Live Counter    |                           |                  |
|                  |    Footer                 |                  |
+------------------+---------------------------+------------------+
```

## Changes

### File: `src/app/demo/icons/page.tsx` (full rewrite)

1. **Add SEO metadata** via `react-helmet-async` with title, description, and canonical URL for the indexed page
2. **Use the same layout structure** as the home page:
   - `SidebarProvider` wrapping a flex container
   - Left sidebar showing "Demo Icons" branding, a browse section with "All Icons (1,200)", and the `LiveCounter` footer
   - Center area with `Header` (search bar), title bar showing count, and the `IconGrid`
   - Right side `ControlPanel` for customization when an icon is selected
3. **Wrap in `IconCustomizationProvider`** to enable the color picker and stroke slider from the context
4. **Use `RotatingFooter`** at the bottom of the main content area
5. **Keep the 1,200 sample icons** generation logic intact
6. **Remove the inline controls** (color input, stroke slider) since the `ControlPanel` handles that
7. **Wire up icon selection** so clicking an icon shows it in the `ControlPanel`

### Technical Details

- Import and reuse: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `Header`, `ControlPanel`, `IconGrid`, `RotatingFooter`, `IconCustomizationProvider`, `useIconCustomization`, `LiveCounter` (extracted or duplicated)
- The sidebar will be a simplified version (no library switching needed, just a static "All Icons" entry)
- The `ControlPanel` expects `selectedIcon` and `selectedSet` props -- pass the selected demo icon and `"demo"` as the set
- Use `Helmet` for SEO: title "Icon Browser Demo - Iconstack", canonical `https://iconstack.io/demo/icons`
- The `Header` component handles search with keyboard shortcuts (Ctrl+K)
- Use `useIconCustomization` for color/strokeWidth instead of local state

### Files Modified
- `src/app/demo/icons/page.tsx` -- full rewrite to match home layout

