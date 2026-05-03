## Product Hunt Upvote Popup

Add a centered modal popup that appears 10 seconds after a user lands on the site, prompting them to upvote on Product Hunt.

### Behavior
- Triggers once per session, 10 seconds after first page load
- Dismissable via X button, ESC key, or backdrop click
- Once dismissed, stored in `localStorage` (keyed to launch date) so it doesn't reappear on subsequent visits
- Hidden if the launch window is over (`state === "hidden"`) or banner feature is disabled
- Shows different copy depending on state:
  - **Coming soon**: "We're launching on Product Hunt soon — notify me / support us"
  - **Live**: "We're live on Product Hunt — Upvote us now 🎉"

### Design
- Centered modal with backdrop blur
- Product Hunt orange accent (reuse `--ph-orange` token)
- Cat mascot (`ph-cat.png`) as visual element
- Headline + short subtext + primary CTA button (Upvote / Support) linking to `PRODUCT_HUNT.postUrl` or `upcomingUrl`
- Secondary "Maybe later" text button to dismiss
- Smooth fade-in/scale animation

### Technical Details
- New component: `src/components/ProductHuntPopup.tsx`
- Mount in `src/App.tsx` alongside `<Toaster />` (or in `Index.tsx` if home-only desired — confirm)
- Reuse `PRODUCT_HUNT` config and `computeState()` logic from `ProductHuntBanner.tsx` (extract into shared util or duplicate the small helpers)
- `localStorage` key: `iconstack_ph_popup_dismissed` storing the launch date string
- 10s timer via `setTimeout` in `useEffect`, cleared on unmount
- Use existing shadcn `Dialog` component for accessibility (focus trap, ESC, ARIA)
- Analytics: fire `ph_popup_shown` and `ph_popup_click` via `window.umami` (matching banner pattern)

### Open Questions
- Show on every page or only homepage `/`? (Banner is home-only — I'll match that unless you say otherwise)
- Should it still appear if the user already dismissed the top banner? (I'll treat them independently)
