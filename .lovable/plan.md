## Fix Product Hunt countdown timezone (PDT vs PST)

### Problem
The launch is configured as `2026-05-03T08:01:00Z`, which is interpreted as 12:01 AM PST (UTC-8). But Pacific time in early May is on **PDT (UTC-7)** due to daylight saving. So midnight Pacific on May 3 is actually **`07:01:00Z`**, not `08:01:00Z`. The countdown is off by exactly 1 hour (showing ~22h 25m when it should show ~21h 25m).

### Change
Single edit in `src/config/productHunt.ts`:

- `launchDateTime`: `"2026-05-03T08:01:00Z"` → `"2026-05-03T07:01:00Z"`
- Update the inline comment to reflect PDT (UTC-7) instead of PST (UTC-8).

### Files
- `src/config/productHunt.ts` (1-line change + comment)

No other files need changes — `ProductHuntBanner.tsx` reads `launchDateTime` directly and the countdown will recompute automatically.

### Verification
- Open `/` and confirm the banner now shows roughly 1 hour less than before.
- At midnight Pacific on May 3, 2026 the banner should switch from countdown to the "We're live on Product Hunt" state.
