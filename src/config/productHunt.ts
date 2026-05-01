/**
 * Product Hunt launch configuration.
 * Single source of truth — change postUrl/launchDate here and the
 * sitewide banner updates automatically.
 */
export const PRODUCT_HUNT = {
  // TODO: swap with the real PH post URL when available.
  postUrl: "https://www.producthunt.com/posts/iconstack",
  upcomingUrl: "https://www.producthunt.com/coming-soon/iconstack",
  // ISO date (UTC midnight) of launch day.
  launchDate: "2026-05-08",
  // Hours after launchDate to keep the "live" banner visible.
  liveWindowHours: 48,
  // Master kill switch.
  enabled: true,
};
