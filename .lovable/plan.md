## Goal

Add a single, polished Product Hunt launch banner that sits at the very top of every page. It should:

- Look on-brand (works in both light and dark mode, matches our muted/minimal aesthetic).
- Auto-switch between **Coming soon on Product Hunt** and **We're live on Product Hunt — upvote us** based on a launch date.
- Be **dismissible** (per-visitor) so it never becomes annoying for repeat users.
- Auto-hide ~48h after launch day so we don't have to remember to remove it.
- Use a **placeholder PH post URL** in one central config so you can swap it in one place when you have the real one.

Out of scope (not requested): dedicated /launch page, OG image redesign, footer "Featured on" badge.

## What the banner looks like

A slim 36px top bar above the existing header, full-width, subtle gradient background tinted with the Product Hunt orange (`#DA552F`) on the left edge fading into our normal surface. Inside:

- Product Hunt cat logo (inline SVG, ~16px) in PH orange.
- **Pre-launch state:** "Coming soon on Product Hunt — {N} days to go" + "Notify me" button (links to PH "upcoming" page placeholder).
- **Live state (launch day + next 48h):** "We're live on Product Hunt today 🎉 — help us reach #1" + "Upvote Iconstack" button (links to PH post URL).
- **Post-launch (>48h):** banner does not render at all.
- Small `×` close button on the right that sets `localStorage.iconstack_ph_banner_dismissed = "<launch-date>"` so dismissals only apply to the current launch — a future relaunch reactivates it.

```text
[🐱 PH]  We're live on Product Hunt today — help us reach #1   [Upvote Iconstack →]   [×]
```

## Configuration (one place to edit)

New file `src/config/productHunt.ts`:

```ts
export const PRODUCT_HUNT = {
  // Swap this with the real PH URL when you have it.
  postUrl: "https://www.producthunt.com/posts/iconstack",
  upcomingUrl: "https://www.producthunt.com/coming-soon/iconstack",
  // ISO date (UTC) of launch. Banner auto-switches Coming Soon → Live → hidden.
  launchDate: "2026-05-08",
  // Hours after launchDate to keep the "live" banner visible.
  liveWindowHours: 48,
  // Master kill switch.
  enabled: true,
};
```

## Files to create / edit

- **Create** `src/config/productHunt.ts` — the single source of truth (URL, date, flag).
- **Create** `src/components/ProductHuntBanner.tsx` — the banner component. Computes state (coming-soon / live / hidden), reads dismissal from localStorage, renders the bar with a tasteful PH-orange accent. Inline PH cat SVG so we don't ship an extra asset.
- **Edit** `src/App.tsx` — render `<ProductHuntBanner />` once, just inside `<BrowserRouter>` and above `<Routes>`, so it appears on every page (Index, library pages, blog, /api, etc.) without each page needing to opt in.
- **Edit** `src/index.css` — add a small `--ph-orange: 14 78% 52%;` token (HSL) and a `--ph-orange-foreground` so the banner stays themable and respects the design-system rule (no raw hex in components).

## Behavior details

- **State machine** (computed on each mount, using `Date.now()`):
  - `now < launchDate` → "coming-soon"
  - `launchDate ≤ now < launchDate + liveWindowHours` → "live"
  - else → render `null`
- **Dismissal:** stores the launch date string as the value, not just a boolean. If you change `launchDate` for a relaunch, prior dismissals are ignored automatically.
- **No layout shift on first paint:** banner mounts synchronously, has fixed 36px height, and `<Header>` continues to position itself naturally below it (header is not `fixed`, so no offset math needed — verified from `src/pages/Index.tsx` structure).
- **Mobile:** on small screens, drop the day-counter / emoji and shrink button to icon + label "Upvote". Banner stays single-line at 36px.
- **Accessibility:** `role="region"`, `aria-label="Product Hunt launch announcement"`, dismiss button has `aria-label="Dismiss Product Hunt banner"`. Link has `rel="noopener noreferrer"` and `target="_blank"`.
- **Analytics:** fire a lightweight `window.umami?.track?.("ph_banner_click", { state })` on the CTA click so you can see how many upvotes came from the site. No new dependency.

## Visual spec

- Height: 36px (32px on mobile).
- Background: `linear-gradient(90deg, hsl(var(--ph-orange) / 0.18) 0%, hsl(var(--background)) 60%)` with a 1px bottom border in `border`.
- Text: `text-foreground` for body, `text-muted-foreground` for the "{N} days to go" part.
- CTA: small pill button, `bg-[hsl(var(--ph-orange))] text-white hover:opacity-90`, ~28px tall.
- Dismiss: `text-muted-foreground hover:text-foreground`, 16px ×.

## Why this is enough for PH approval + upvotes

- Product Hunt's review team mainly checks that your site clearly reflects the launching product and links back to PH on launch day. A clean live-day banner with a working upvote link satisfies that signal without changing your core product surface.
- Repeat visitors aren't punished thanks to the dismiss + auto-hide window.
- Everything is gated behind `PRODUCT_HUNT.enabled`, so you can flip it off in one line if needed.

## After approval

When you give me the real PH URL, the only edit needed is `postUrl` (and optionally `launchDate`) in `src/config/productHunt.ts`. No other files change.
