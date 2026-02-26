

# Add Live Audience Counter (Desktop Sidebar Footer + Mobile Header)

## Overview

Create a shared hook `useFakeAudienceCount` that generates a realistic-looking fake live count, then display it in two places: the sidebar footer (desktop) and below the search bar (mobile).

## Shared Hook

**New file: `src/hooks/useFakeAudienceCount.ts`**

- Generates a base count between ~800-2,500 (seeded by hour of day for consistency across refreshes within the same hour)
- Adds small random fluctuations every 3-5 seconds (+-1 to 5) to simulate real-time changes
- Returns the current count number

## Desktop: Sidebar Footer

**File: `src/components/app-sidebar.tsx`**

- Import `SidebarFooter` and the new hook
- Add a `SidebarFooter` section after `SidebarContent` with a subtle display:
  ```
  [green pulsing dot] 1,247 designers browsing
  ```
- Styled as `text-xs text-muted-foreground` with a small green animated dot, pinned at the bottom of the sidebar

## Mobile: Below Search Bar

**File: `src/components/mobile/MobileHeader.tsx`**

- Import the same hook
- Add a small line below the search bar (inside the sticky header):
  ```
  [green pulsing dot] 1,247 designers browsing now
  ```
- Styled as `text-[11px] text-muted-foreground` centered, with the same green dot animation

## Technical Details

### `useFakeAudienceCount` hook logic:
```ts
// Base count varies by hour (800-2500 range, higher during work hours)
// Small fluctuations every 3-5s via setInterval
// Returns: number (the current fake count)
```

### Green pulsing dot (inline CSS or Tailwind):
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
</span>
```

### Files to create:
- `src/hooks/useFakeAudienceCount.ts`

### Files to modify:
- `src/components/app-sidebar.tsx` — add SidebarFooter with live count
- `src/components/mobile/MobileHeader.tsx` — add live count below search bar
