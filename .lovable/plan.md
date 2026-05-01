# MCP Server + Smarter Semantic Search

## Honest assessment first

**What you already have (so we don't rebuild it):**
- Public REST API `/icon-search` over ~51k icons with CORS-open access
- Pre-built `public/api/icons-index.json` (7 MB, all metadata)
- Lexical search worker with Levenshtein fuzzy match, Soundex phonetic match, multi-word stemming, and a 245-line synonym map
- `/api` docs page, `llms.txt`, AI-bot-friendly `robots.txt`
- 92% of icons (47k of 51k) already have tags — average 4.4 tags each
- A tag-enrichment script (`scripts/enrich-tags-ai.js`) already exists

**What's actually missing vs. the pitch:**
1. No MCP server — genuinely novel, nobody in icon space has shipped this
2. Tag quality is uneven: some icons have rich semantic tags (`jeep` → offroad, suv, 4x4, adventure), others have only literal tokens (`Border Right 02` → border, right, 02). This is the real gap behind "search by meaning."
3. No vector/embedding fallback for queries that match nothing lexically (e.g. "feels like progress but not a rocket")

**Verdict:** MCP first (huge ROI, ~1 day). Semantic search second, but as **tag enrichment + a lightweight embedding fallback**, not a full pgvector rebuild — your current lexical search is too good to throw away.

---

## Phase 1 — `npx iconstack-mcp` (ship first)

A standalone npm package that wraps the existing `/icon-search` edge function so Cursor/Claude Desktop/Windsurf users can search and insert icons without leaving the editor.

### What gets built
- A new repo/package `iconstack-mcp` (separate from this Lovable project, published to npm)
- MCP tools exposed:
  - `search_icons(query, library?, style?, limit?)` → calls `/icon-search`
  - `get_icon_svg(library, icon_id)` → returns raw SVG (needs a new endpoint, see below)
  - `list_libraries()` → returns the 21 libraries with counts
- README with one-line install for each editor (Cursor, Claude Desktop, Windsurf, Continue)
- Zero auth, zero config — just `npx iconstack-mcp`

### What we add to *this* project to support it
- New edge function `icon-svg` (or extend `icon-search`) that returns the raw SVG string for a given `library/icon_id`. Currently consumers would have to scrape the HTML page.
- Add MCP install snippet to `/api` docs page and to `llms.txt`
- Footer link "Use in Cursor/Claude" → points to MCP install instructions

### Effort: ~1 day
~70% is the npm package (outside Lovable). Inside Lovable: one new edge function + docs additions.

---

## Phase 2 — Real semantic search (ship second)

Two layers, cheapest first:

### Layer A — Enrich the weak tags (biggest single win)
Run `scripts/enrich-tags-ai.js` against the ~15-20% of icons with thin/literal tags using **Lovable AI Gateway** (`google/gemini-3-flash-preview`, free quota covers this comfortably). For each weak icon, prompt: *"Given an icon named X in library Y with current tags [...], return 6-10 semantic concept tags a designer might search for."*

This alone makes "growth" find icons tagged `progress, increase, trending-up, expansion, scale` — without any vectors.

- Output: regenerated `icons-index.json` (still ~7 MB)
- One-time cost: ~$0 on Lovable AI free tier, batched overnight
- Query path unchanged → zero added latency

### Layer B — Embedding fallback for "vibe" queries
Only fire when lexical search returns < 5 results, OR as an opt-in `?semantic=true` query param.

**Approach: precomputed static vectors, no pgvector**
- Use Lovable AI Gateway's embeddings (if it adds them) or OpenAI `text-embedding-3-small` via existing edge function pattern
- Embed `"{name}. {tags joined}. {category}"` for each icon → 1536 dims × 51k = ~300 MB raw, ~80 MB quantized to int8
- Ship as a second static file `public/api/icons-vectors.bin` loaded once on cold-start in the edge function
- Embed user query at request time (one API call), cosine similarity in-memory, return top-N

**Why not pgvector:** adds DB round-trip, requires keeping vectors in sync with deploys, and your data is read-mostly. Static file matches your existing architecture.

### Effort
- Layer A: half a day (script already exists, just needs to run + verify)
- Layer B: 1-2 days (embed batch + new code path in edge function + docs update)

---

## What we explicitly are NOT doing

- No pgvector / Supabase vector DB — overkill for read-mostly data
- No replacing the existing lexical search — it's good, it stays as the primary path
- No MCP tools that mutate state — read-only is enough and avoids auth complexity
- No paywall on either feature — both exist purely for distribution / PH narrative

---

## Suggested order of execution

1. **Phase 1** — MCP server + `icon-svg` endpoint + docs (1 day)
2. **Phase 2A** — Tag enrichment via Lovable AI, regenerate index (½ day)
3. **Phase 2B** — Embedding fallback (1-2 days, only if Phase 2A doesn't already feel like "semantic")

Most likely you can stop after 2A and the PH headline still writes itself: *"Search 53,000 icons by meaning — and use them in Cursor without leaving your editor."*

## Technical notes

- New edge function: `supabase/functions/icon-svg/index.ts` — accepts `?library=lucide&id=user`, fetches from existing `src/data/*.ts` shipped in `icons-index.json` (we'd need to add SVG bodies to a separate file or fetch from CDN URLs already in the data)
- Tag enrichment uses Lovable AI Gateway (`LOVABLE_API_KEY` already configured)
- Embedding storage: `public/api/icons-vectors.bin` (binary float16 or int8) + small JS loader in the edge function
- Cold-start budget on edge function is the main constraint — keep total loaded data under ~100 MB
