

# Add DodoInvoice Footer Link with "Hot" Badge

## Change

**File: `src/components/RotatingFooter.tsx`**

1. Add `"Hot"` to the `BadgeType` union type:
   ```ts
   type BadgeType = "New" | "Trending" | "Hot";
   ```

2. Add a "Hot" badge style in the `BadgeComponent` (red/orange themed, with a flame-like appearance using existing icons or just text).

3. Add the new entry to `footerItems`:
   ```ts
   {
     text: "Free AI Invoicing for freelancers and agencies - dodoinvoice.com",
     link: "https://dodoinvoice.com",
     badge: "Hot"
   }
   ```

The "Hot" badge will use a red/orange color scheme (e.g., `border-orange-500/50 bg-orange-500/10 text-orange-500`) with a `Flame` icon from lucide-react, matching the existing badge pattern.

