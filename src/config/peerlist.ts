/**
 * Peerlist launch configuration.
 * Single source of truth — change postUrl/launchDate here and the
 * sitewide banner + popup updates automatically.
 */
export const PEERLIST = {
  postUrl: "https://peerlist.io/thedeepflux/project/iconstack-mcpnative-icon-search",
  upcomingUrl: "https://peerlist.io/thedeepflux/project/iconstack-mcpnative-icon-search",
  // We're already live on Peerlist — set launch in the past so banner shows live state.
  launchDateTime: "2026-05-01T00:00:00Z",
  launchDate: "2026-05-01",
  // Hours after launch to keep the "live" banner visible.
  liveWindowHours: 24 * 30,
  // Master kill switch.
  enabled: true,
};
