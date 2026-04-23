

# Restore Rotating Footer with 4 Promotions

Bring back the rotating footer that cycles through multiple promotions: **Figma Plugin**, **Framer Plugin**, **X-Autopilot**, and **Dodo Invoice**.

## What Changes

**`src/components/RotatingFooter.tsx`** — Replace the current static single-promo footer with a rotation system that cycles through 4 promo items every ~5 seconds with a smooth fade transition.

### Promo items

| # | Brand | Logo | Tagline | Link |
|---|---|---|---|---|
| 1 | Figma Plugin | Figma `F` icon (lucide or inline SVG) | "Iconstack for Figma — Drop icons straight into your designs." | figma.com community link (placeholder) |
| 2 | Framer Plugin | Framer icon | "Iconstack for Framer — Use any icon inside Framer." | framer.com plugin link (placeholder) |
| 3 | X-Autopilot | `src/assets/xautopilot-logo.png` | "X-Autopilot — Automate your X with a Claude-powered AI agent." | xautopilot link |
| 4 | Dodo Invoice | `src/assets/dodoinvoice-logo.avif` | "Dodo Invoice — AI invoicing for freelancers and agencies." | dodoinvoice.com?ref=iconstack |

### Behavior

- Auto-rotate every 5 seconds.
- Smooth fade/slide transition between items (use existing `animate-fade-in` from tailwind config or a simple opacity transition).
- Pause rotation on hover so the user can read/click.
- Each item is a clickable `<a>` opening in a new tab.
- Visual styling stays the same as current: `border-t border-border`, `bg-zinc-100 dark:bg-zinc-900`, centered text, logo + bold brand + tagline + `ArrowRight` icon.

## Technical Details

- Use `useState` + `useEffect` with `setInterval` to advance an index through the promo array.
- Promo array defined as a constant at top of file: `{ logo, alt, brand, tagline, href }[]`.
- Wrap content in a div with `transition-opacity duration-500` and toggle opacity on index change, OR use `key={index}` with `animate-fade-in` to retrigger the existing keyframe.
- Pause via `onMouseEnter` / `onMouseLeave` toggling a `paused` state that short-circuits the interval.
- For Figma/Framer logos: use simple inline SVG (Figma "F" mark, Framer triangle) since we don't have asset files — keeps bundle small and avoids new uploads.
- No other files touched — the component is already imported in `Index`, `LibraryPage`, `IconDetailPage`, and the demo page.

## Open question

Do you have specific URLs for the Figma and Framer plugins, or should I use placeholder URLs (`https://figma.com/community` / `https://framer.com/marketplace`) that you can swap later?

