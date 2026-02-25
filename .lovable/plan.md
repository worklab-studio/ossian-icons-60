

# Fix Icon Preview Size + Similar Icons (Proper Solution)

## Problem 1: Icon Preview Size
The preview is currently 128x128 with SVG width/height stripped, making it fill the container. User wants native 24x24 size.

**Fix:** Set the icon size to 24px (the native SVG size). Remove the width/height stripping from SVG strings. Use `size: 24` for component-based icons.

## Problem 2: Similar Icons Never Show (Root Cause)

The `IconGrid` component always calls `useVirtualGrid`, which needs to measure its container's `clientWidth` via a ref. The similar icons grid is nested inside a flex scrollable column (`flex-1 overflow-y-auto`) with `h-full` on the grid container. In this layout, the container often resolves to 0 height/width because:
- The parent is a flex child with no fixed dimensions
- `h-full` resolves to 0 when the parent's height is content-dependent
- `useVirtualGrid` reads `clientWidth = 0`, producing `cellSize = 72` (fallback) but `gridAutoRows: 72px` with `h-full` on a 0-height container means nothing is visible

**Proper fix:** Don't use `IconGrid` for similar icons at all. For 24 icons, a simple CSS grid is all that's needed. Render the icons directly in a `div` with `grid-template-columns: repeat(auto-fill, minmax(64px, 1fr))` and fixed row height. This completely avoids virtualization measurement issues.

---

## Technical Changes

### File: `src/pages/IconDetailPage.tsx`

**Icon preview (lines 301-325):**
- Remove the `w-32 h-32` container sizing
- Stop stripping `width`/`height` from SVG strings
- Set `size: 24` for component-based SVGs
- Use a simple centered container without forced dimensions

**Similar icons section (lines 399-431):**
- Replace `<IconGrid>` with a simple inline CSS grid
- Import `IconCell` directly
- Render `similarIcons.map(icon => <IconCell .../>)` inside a `div` with `grid-template-columns: repeat(auto-fill, minmax(64px, 1fr))` and `grid-auto-rows: 64px`
- This guarantees icons always render regardless of container measurements

