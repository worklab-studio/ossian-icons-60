
# Align Sidebar Footer with Main Content Footer

## Problem
The sidebar's live counter footer and the main content's `RotatingFooter` are not aligned at the same height. They have different padding values causing a visual mismatch.

## Changes

**File: `src/components/app-sidebar.tsx`**
- Update the `SidebarFooter` padding from `px-4 py-3` to `p-4` to match the `RotatingFooter`'s padding
- Ensure the `LiveCounter` component uses the same height (`h-5`) and centering (`flex items-center`) as the `RotatingFooter`'s inner container

**File: `src/components/RotatingFooter.tsx`** (if needed)
- Verify both footers use the same total height. The `RotatingFooter` uses `p-4` with an inner `h-5` container. We'll match the sidebar footer to these exact values.

### Specific changes:

1. **`src/components/app-sidebar.tsx`** - Change sidebar footer:
   ```tsx
   // From:
   <SidebarFooter className="border-t px-4 py-3">
     <LiveCounter />
   </SidebarFooter>
   
   // To:
   <SidebarFooter className="border-t p-4">
     <div className="h-5 flex items-center">
       <LiveCounter />
     </div>
   </SidebarFooter>
   ```

2. The `LiveCounter` already uses `flex items-center gap-1.5` so the inner content will center within the `h-5` container, exactly matching the `RotatingFooter`'s `h-5 flex items-center justify-center` layout.

This ensures both footers have identical `p-4` padding, `border-t` separator, and `h-5` content height, making them perfectly aligned horizontally.
