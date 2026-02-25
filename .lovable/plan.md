

# Fix Icon Preview Size + Similar Icons Visibility

## Issue 1: Icon Preview Too Large
The icon is blown up to 280x280 which looks bad. User wants "normal size."

**Fix:** Change the preview container from `w-[280px] h-[280px]` to a modest `w-32 h-32` (128px) on desktop, keep `w-32 h-32` on mobile. Stop stripping width/height attributes from the SVG -- instead just let CSS constrain the max size. Also reduce the left panel width from `w-[400px]` to `w-[360px]`.

**File: `src/pages/IconDetailPage.tsx`**
- Line 304: Change `w-[280px] h-[280px]` to `w-32 h-32`
- Line 309: Change `w-full h-full` to `w-full h-full max-w-[128px] max-h-[128px]`
- Line 319: Change `size: 280` to `size: 128`
- Line 622: Change container `w-[280px] h-[280px]` to `w-32 h-32`

## Issue 2: Similar Icons Not Visible
The console logs confirm similar icons ARE loading and `IconCell` components render. The problem is `useVirtualGrid` measures `containerWidth` via `containerRef.current.clientWidth`, which can be 0 when the grid container hasn't been laid out yet (it's deep inside a scrollable flex column). With `containerWidth = 0`, `cellSize = 0`, so all icons have 0 height.

Since similar icons has at most 24 items (well under the 100 threshold), `IconGrid` uses the simple non-virtualized path. But `cellSize` and `columnsCount` from `useVirtualGrid` are still used for `gridAutoRows` and `gridTemplateColumns`. When `containerWidth` is 0, `columnsCount` defaults to 4 but `cellSize` is 0.

**Fix:** In `useVirtualGrid.ts`, ensure `cellSize` has a minimum fallback value (e.g., 72px) when `containerWidth` is 0 or too small.

**File: `src/components/icon-grid/useVirtualGrid.ts`**
- Line 40 (cellSize memo): Change to `if (!containerWidth || !columnsCount) return 72;` (was `return 80` but the 80 wasn't being used because the condition wasn't matching -- actually it returns 80, let me re-check)

Actually the default IS 80, but the issue is that `containerWidth` might briefly be set to a very small value. Let me add a minimum: `return Math.max(64, Math.floor(containerWidth / columnsCount))`.

**Changes:**
- `src/components/icon-grid/useVirtualGrid.ts` line 41: `return Math.max(64, Math.floor(containerWidth / columnsCount));`

Additionally, add a `ResizeObserver` in `useVirtualGrid` instead of relying solely on the initial `clientWidth` read + window resize. This ensures the grid recalculates when its container actually appears in the DOM.

**File: `src/components/icon-grid/useVirtualGrid.ts`**
- In the `useEffect` (lines 64-80): Add a `ResizeObserver` on `containerRef.current` to catch when the element gets its actual width after being mounted inside a scrollable area.

---

## Summary of Changes

**`src/pages/IconDetailPage.tsx`** (4 line changes):
- Reduce icon preview from 280px to 128px (lines 304, 309, 319, 622)

**`src/components/icon-grid/useVirtualGrid.ts`** (2 changes):
- Add minimum cellSize of 64px (line 41)
- Add ResizeObserver to detect container width after mount (lines 64-80)

