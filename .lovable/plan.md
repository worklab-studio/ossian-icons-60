## Problem

On the home grid, the layout shell uses `h-app-shell` (`100vh - 36px`) which keeps the footer and right Customize panel correctly inside the viewport. But the PH banner itself sits as a normal block at the top of `<body>`, so when any inner area scrolls — or the user scrolls the document on shorter viewports — the banner slides off-screen, leaving the announcement invisible while the rest of the chrome stays put. The user wants the banner to remain visible (fixed/sticky) at the top.

## Fix

Make the PH banner fixed to the top of the viewport. The shell already subtracts `--ph-banner-h` from its height, so making the banner `fixed` doesn't change layout math — we just need to push the shell down by the same amount so it doesn't hide under the fixed banner.

### Changes

1. **`src/components/ProductHuntBanner.tsx`**
   - Change the root wrapper from `relative w-full ...` to `fixed top-0 left-0 right-0 z-[60] ...`. `z-60` keeps it above the existing `z-50` mobile sticky header.
   - Keep the runtime `--ph-banner-h` setter as-is (already drives the shell height).

2. **`src/index.css`**
   - Update the `.h-app-shell` utility — instead of just shrinking height, also offset by the banner so the shell starts below it:
     ```css
     .h-app-shell {
       height: calc(100vh - var(--ph-banner-h));
       margin-top: var(--ph-banner-h);
     }
     ```
   - When the banner is hidden, `--ph-banner-h` is `0px`, so the rule is a no-op (zero regression).

3. **Mobile sticky header conflict** (`src/pages/Index.tsx` line 497 uses `fixed top-0 ... z-50`)
   - Wrap that header's `top-0` with `top-[var(--ph-banner-h)]` so the mobile header sits *below* the banner instead of behind it. Single class swap.

### Why this works

- Banner is now visually pinned and never scrolls away.
- Desktop layout: shell already subtracts banner height; adding `margin-top: var(--ph-banner-h)` pushes it below the now-fixed banner so nothing is occluded. Footer stays at the bottom of the viewport.
- Mobile: the existing fixed header stacks directly under the banner via the CSS variable.
- Banner dismissed / post-launch: `--ph-banner-h = 0px` everywhere, behavior identical to current.

## Files touched

- Edit `src/components/ProductHuntBanner.tsx` (root className)
- Edit `src/index.css` (`.h-app-shell` rule)
- Edit `src/pages/Index.tsx` (mobile fixed-header `top-0` → `top-[var(--ph-banner-h)]`)
