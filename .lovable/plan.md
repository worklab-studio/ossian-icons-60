## Finish AI tag enrichment

Run the remaining work on `scripts/enrich-tags-ai.js` to completion, then stop. No code changes, no follow-ups in this pass.

### Scope
- Only one library left: **fluent-ui** (`src/data/fluent-ui.ts`).
- All other 22 libraries are already at 100% per the checkpoint in `scripts/.enrichment-progress.json`.

### Steps
1. Run `node scripts/enrich-tags-ai.js fluent-ui` from the sandbox (uses `LOVABLE_API_KEY`, batches of 25, auto-checkpoints, auto-retries on 429/5xx).
2. If the run hits the 540s timeout cap, resume by re-running the same command — the script skips already-done icons via the checkpoint file.
3. Repeat until the script reports `✓ done` for fluent-ui.
4. Confirm completion by checking the progress file shows fluent-ui's `doneIds` length equals the icon count in `src/data/fluent-ui.ts`.

### What gets touched
- `src/data/fluent-ui.ts` — `tags` arrays expanded, `category` filled where missing.
- `scripts/.enrichment-progress.json` — checkpoint updated.
- Nothing else. No frontend, no edge functions, no schema, no JSON-LD work (that's a separate follow-up if you want it later).

### Risks / notes
- **Credits**: requires Lovable AI credits. If a 402 appears, the run halts cleanly and you'll need to top up before resuming.
- **Time**: fluent-ui is one of the larger libs; expect 2–3 resume cycles under the 540s cap.
- **Idempotent**: safe to re-run; already-enriched icons are skipped.
