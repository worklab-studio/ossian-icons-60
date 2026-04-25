# AI Tag Enrichment with Gemini (one-time batch)

Use **Google Gemini 2.5 Flash** (your key) to add 5–10 semantic tags to every icon's existing `tags` array. The change is invisible at runtime (no UI, no edge function, no extra requests) — it just makes search smarter and SEO pages richer.

## Scope

**~52,500 icons across 23 libraries.** Each icon gets enriched in place: existing `tags` are kept, new AI tags are appended and de-duplicated.

Tag types we'll ask Gemini to produce:
- **Concepts** — `growth`, `security`, `automation`, `community`
- **Use cases** — `empty state`, `onboarding`, `dashboard`, `cta`
- **Mood / tone** — `playful`, `serious`, `friendly`, `minimal`
- **Visual descriptors** — `rounded`, `geometric`, `circular`, `arrow`
- **Synonyms / aliases** — common alternate names users actually search for

Brand libraries (`simple`, `devicon`) get a lighter pass: just synonyms + category tags (e.g. `frontend`, `database`, `payments`) — no mood/use-case noise on logos.

## How it works

### 1. Setup (one-time, you do this)
You give me your Gemini API key. I add it to Lovable Cloud secrets as `GEMINI_API_KEY`. It's never bundled into the frontend — only used by the local Node enrichment script.

### 2. Enrichment script — `scripts/enrich-tags-ai.js`
Run once per library (or all in one pass). For each library:
1. Read the existing `.ts` data file (e.g. `src/data/feather.ts`).
2. Parse out `{id, name, tags, style}` for every icon (no SVG sent to AI — saves 95%+ tokens).
3. Batch icons in groups of **40 per request** with a structured-JSON prompt:
   > "For each icon below, return 6–10 short lowercase search tags covering concepts, use cases, mood, and synonyms. Skip the obvious — the icon's own name is already indexed. Return JSON: `[{id, tags: []}]`."
4. Call `gemini-2.5-flash` with `responseMimeType: "application/json"` for guaranteed parseable output.
5. Merge new tags into the existing array, de-duplicate (case-insensitive), cap at ~15 tags total per icon to keep file sizes reasonable.
6. Rewrite the `.ts` file in place, preserving format.
7. Checkpoint progress to `scripts/.enrichment-progress.json` after every batch — safe to resume if interrupted or rate-limited.

### 3. Run order
Smallest libraries first to validate quality, then bulk:
1. **Test pass** — Feather (287) + Radix (318). Inspect results, tweak prompt if needed.
2. **Brand pass** — Simple (3,355) + Devicon (1,863) with the lighter prompt.
3. **Full pass** — remaining 19 libraries.

### 4. Result
- Updated `src/data/*.ts` files committed to the repo.
- Search worker (`useSearchWorker`) automatically picks up the new tags — no code changes needed; it already indexes `tags`.
- Icon detail pages get richer keyword content for SEO (aligns with `mem://seo/programmatic-strategy`).
- Bundle size grows ~5–10% per data file — acceptable, and only loads per-library on demand.

## Cost estimate

- ~52,500 icons ÷ 40 per batch = **~1,315 API calls**
- Per call: ~800 input tokens + ~600 output tokens
- Gemini 2.5 Flash pricing: ~$0.075/M input, $0.30/M output
- **Total: ~$0.30–$0.50** for the entire enrichment. Trivial.

Runtime: ~30–45 minutes total (with rate limit pacing of ~2 req/sec).

## What I need from you

Please share your **Gemini API key** so I can add it to the project secrets and run the enrichment. (Get one at https://aistudio.google.com/apikey if you don't have one yet — the free tier alone has more than enough quota for this job.)

## Files touched

- `scripts/enrich-tags-ai.js` (new)
- `scripts/.enrichment-progress.json` (new, checkpoint state)
- `src/data/*.ts` (23 files, modified — `tags` arrays expanded)
- No frontend code changes
- No edge functions
- No new dependencies (uses native `fetch` to Gemini REST API)

## Open question

Do you want me to also use the AI pass to **fill in `category`** for icons that don't have one (e.g. `navigation`, `commerce`, `media`, `system`)? Many libraries ship without categories — adding them would unlock category-filter UX and category SEO pages later. Costs nothing extra since we're already calling the model.
