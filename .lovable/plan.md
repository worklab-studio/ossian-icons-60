## Problem

The Product Hunt banner sits above the app shell, but `src/pages/Index.tsx` and `src/components/control-panel.tsx` use a hardcoded `h-screen` (= `100vh`). When the 36px banner renders above them, the shell becomes 36px taller than the viewport, pushing the footer below the fold and making the right Customize panel run off the bottom (visible in screenshot 1). When the banner is dismissed, layout returns to normal (screenshot 2).

The user wants the footer to stay pinned to the bottom regardless of whether the banner is showing.

## Fix (smallest possible change)

Switch the app from "viewport-locked via `h-screen`" to "viewport-locked via a CSS variable that subtracts the banner height". The banner already knows its own height (36px), so we expose it as a CSS custom property on `<html>` and use it everywhere `h-screen` is currently used in the page shell.

### Changes

1. **`src/components/ProductHuntBanner.tsx`** — when the banner mounts and is visible, set `document.documentElement.style.setProperty('--ph-banner-h', '36px')`. When it unmounts, hidden, or dismissed, set it to `'0px'`. This is a single `useEffect` driven by the existing `state` + `dismissed` values.

2. **`src/index.css`** — add a default in `:root`:
   ```css
   --ph-banner-h: 0px;
   ```
   And one utility class so we don't sprinkle arbitrary values:
   ```css
   .h-app-shell { height: calc(100vh - var(--ph-banner-h)); }
   ```

3. **`src/pages/Index.tsx`** — replace the three `h-screen` occurrences (lines 495, 645, 651) with `h-app-shell`. No other layout changes.

4. **`src/components/control-panel.tsx`** — replace the `h-screen` on line 460 with `h-app-shell` so the right Customize panel matches the new shell height and its internal scroll area stays inside the viewport.

### Why this works

- When the banner is hidden/dismissed, `--ph-banner-h` is `0px`, so `calc(100vh - 0px) = 100vh` — identical to today's behavior. Zero regression risk for the dismissed/post-launch state.
- When the banner is visible, the shell becomes `100vh - 36px`, which exactly compensates for the banner above it. The footer (last child of the flex column in `Index.tsx`) sits flush at the bottom of the viewport again, and the right panel's `h-app-shell` keeps its Export buttons visible.
- CSS variable approach avoids prop-drilling a banner-visible flag into multiple components and keeps the banner self-contained.

### Out of scope

- Not making the footer `position: fixed`. The footer already sits at the bottom via the flex column; the only bug is the parent being too tall. Fixing the parent is cleaner and avoids overlapping content under a fixed footer.
- Not touching mobile layouts — they don't render `h-screen` shells the same way and the banner is already responsive (32–36px).

## Files touched

- Edit `src/components/ProductHuntBanner.tsx`
- Edit `src/index.css` (add `--ph-banner-h` + `.h-app-shell`)
- Edit `src/pages/Index.tsx` (3 line edits)
- Edit `src/components/control-panel.tsx` (1 line edit)
