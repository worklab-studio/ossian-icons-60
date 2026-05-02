/**
 * Product Hunt launch configuration.
 * Single source of truth — change postUrl/launchDate here and the
 * sitewide banner updates automatically.
 */
export const PRODUCT_HUNT = {
  postUrl: "https://www.producthunt.com/products/iconstack-mcp-native-icon-search",
  upcomingUrl: "https://www.producthunt.com/products/iconstack-mcp-native-icon-search",
  // Exact launch moment: Sunday May 3, 2026 at 12:01 AM PDT (UTC-7) = 07:01 UTC.
  // Pacific time observes daylight saving in May, so PDT (UTC-7) applies, not PST (UTC-8).
  launchDateTime: "2026-05-03T07:01:00Z",
  // Kept for backwards compatibility (date portion only).
  launchDate: "2026-05-03",
  // Hours after launch to keep the "live" banner visible.
  liveWindowHours: 48,
  // Master kill switch.
  enabled: true,
};
