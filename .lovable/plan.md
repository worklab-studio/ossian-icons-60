
# Update Live Audience Counter: Range & Styling

## Changes

### 1. Update range in `src/hooks/useFakeAudienceCount.ts`
- Change work hours range from `1200-2500` to `5500-8500`
- Change off hours range from `800-1400` to `4100-6500`
- Increase fluctuation tolerance from `±50` to `±150` to keep it natural at this scale

### 2. Make count text bold in `src/components/app-sidebar.tsx`
- Add `font-bold` to the count text span in the `LiveCounter` component

### 3. Make count text bold in `src/components/mobile/MobileHeader.tsx`
- Add `font-bold` to the matching count text span for mobile consistency
