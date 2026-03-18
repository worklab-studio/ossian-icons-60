

# Fix Footer Banner Styling

The current footer uses `bg-white dark:bg-white` which clashes with the dark monochrome UI. Looking at the screenshot, the UI is in dark mode with `background: hsl(0 0% 6%)` and borders at `hsl(0 0% 14%)`.

## Change in `src/components/RotatingFooter.tsx`

Use a slightly elevated dark background with a subtle accent to draw attention without clashing:

- **Footer background**: `bg-zinc-900 dark:bg-zinc-900` (slightly lighter than the main bg `hsl(0,0%,6%)` ≈ `#0f0f0f`, zinc-900 is `#18181b`) with a top border using a hint of orange/amber to grab attention: `border-t border-orange-500/30`
- **Text colors**: `text-zinc-300` for body, `text-white` for bold/code elements
- **Coupon code badge**: `bg-orange-500/20 text-orange-300` to make it pop
- **Light mode**: `bg-zinc-100 border-orange-500/30`, `text-zinc-700`, coupon `bg-orange-500/10 text-orange-700`

This keeps the monochrome feel but uses a subtle warm accent on the border and coupon code to draw the eye.

