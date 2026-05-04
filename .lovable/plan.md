## Goal
Replace all Product Hunt branding and links with Peerlist across the site banner and popup.

## Changes

### 1. `src/config/productHunt.ts` → rename to `src/config/peerlist.ts`
- Export `PEERLIST` config:
  - `postUrl`: `https://peerlist.io/thedeepflux/project/iconstack-mcpnative-icon-search`
  - `upcomingUrl`: same URL
  - Keep `launchDateTime`, `launchDate`, `liveWindowHours`, `enabled` fields (Peerlist launches don't have a strict countdown, but keeping the structure preserves the existing "coming soon → live" UI; we'll set launch to now so it shows "live" immediately).

### 2. `src/components/ProductHuntBanner.tsx` → rename to `PeerlistBanner.tsx`
- Replace PH orange (`--ph-orange`) with a Peerlist green token (`--peerlist-green`, hsl ~`145 65% 42%`).
- Swap `PHIcon` SVG for the Peerlist "P" mark (rounded square with white P).
- Update copy:
  - Live: "We're live on Peerlist — support us"
  - Coming soon: "Launching on Peerlist in …"
  - CTA: "Upvote on Peerlist" / "Support us on Peerlist"
- Update `aria-label`, dismiss key → `iconstack_peerlist_banner_dismissed`, analytics event → `peerlist_banner_click`.
- Keep the cat mascot image as-is (decorative).

### 3. `src/components/ProductHuntPopup.tsx` → rename to `PeerlistPopup.tsx`
- Same color/icon/copy swap as the banner.
- Dismiss key → `iconstack_peerlist_popup_dismissed`.
- Analytics events → `peerlist_popup_shown`, `peerlist_popup_click`.
- Headline: "We're live on Peerlist 🎉" / "We're launching on Peerlist".

### 4. `src/index.css`
- Add `--peerlist-green: 145 65% 42%;` token (light + dark mode).
- Leave existing `--ph-orange` token in place to avoid breaking anything else (or remove if unused — will verify with a quick grep).

### 5. `src/App.tsx`
- Update imports/usages from `ProductHuntPopup` → `PeerlistPopup`.

### 6. Anywhere else that imports `productHunt` config or PH components
- Update import paths and component names. Will grep `PRODUCT_HUNT`, `ProductHunt`, `ph-orange` to catch all references.

## Out of scope
- No change to launch date logic, dismiss/persistence behavior, analytics wiring style, or layout/positioning.
- Cat mascot image kept (it's just decorative).
