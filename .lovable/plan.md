## Goal

Ship a public, documented JSON search API at `/api/search` (powered by an edge function) that lets developers query Iconstack's ~51k enriched icons by keyword, library, category, and style. This opens up developer integrations (Figma plugins, VS Code extensions, design systems, AI agents) and earns inbound links from "icon search API" / "icons JSON API" queries.

## Scope

In:
- One edge function: `icon-search`
- A small in-memory index built at cold-start from a generated JSON snapshot of all icons
- A public docs page at `/api` explaining endpoint, params, response shape, rate limits, license
- Rate limiting per IP (in-memory token bucket — good enough for v1)

Out (later):
- Auth / API keys
- Persistent rate limiting (Redis / DB)
- SVG byte payloads in the response (we return URLs; SVG fetched separately)

## Endpoint

`GET https://iconstack.io/api/search`

Params (all optional except `q`):
- `q` — query string (1–80 chars, required)
- `library` — comma-separated library ids (e.g. `lucide,phosphor`)
- `category` — comma-separated categories
- `style` — `outline | filled | duotone | ...`
- `limit` — 1–100, default 25
- `offset` — 0–1000, default 0

Response:
```json
{
  "query": "user",
  "total": 412,
  "limit": 25,
  "offset": 0,
  "results": [
    {
      "id": "lucide:user",
      "name": "user",
      "library": "lucide",
      "libraryName": "Lucide",
      "category": "people",
      "tags": ["person", "profile", "account"],
      "style": "outline",
      "url": "https://iconstack.io/icon/lucide/user",
      "svgUrl": "https://iconstack.io/api/svg/lucide/user"
    }
  ]
}
```

Errors return `{ "error": "...", "code": "..." }` with proper HTTP status.

## Architecture

```text
Browser / 3rd party
        |
        v
  /api/search  (Vite rewrite -> edge function URL)
        |
        v
  Supabase Edge Function "icon-search"
        |
   in-memory index  <-- loaded once from
                       public/api/icons-index.json
                       (generated at build time)
```

We do NOT bundle 51k icons into the function source. Instead we generate one compact JSON file and the function fetches it once on cold start (cached in module scope).

## Implementation steps

1. **Generate the index file**  
   Add `scripts/generate-search-index.js` that walks every `src/data/<lib>.ts`, strips SVG bodies, and writes `public/api/icons-index.json` with shape:
   ```ts
   { libraries: Record<string, {name, style}>,
     icons: Array<{id, n: name, l: libId, c: category, t: tags, s: style}> }
   ```
   Wire it into the existing sitemap-generation flow so it stays fresh.

2. **Edge function `supabase/functions/icon-search/index.ts`**
   - On first request: `fetch('https://iconstack.io/api/icons-index.json')` and cache in module scope.
   - Validate params with zod.
   - Reuse the scoring approach from `src/lib/search-algorithms.ts` (port the relevant functions into the function file — small, dependency-free).
   - Apply filters → sort by score → slice by limit/offset.
   - Return JSON with proper CORS headers (`Access-Control-Allow-Origin: *` so any site can call it).
   - In-memory token bucket: 60 req/min per IP.

3. **Pretty URL `/api/search`**  
   Add a rewrite in `vite.config.ts` (dev) and a redirect in `public/_redirects` (prod) from `/api/search` to the edge function URL. Same for `/api/svg/:lib/:icon` → existing icon SVG file.

4. **Docs page `/api`**  
   New `src/pages/ApiDocsPage.tsx` with:
   - Endpoint reference + param table
   - Live "try it" panel (call the API, show JSON)
   - cURL / fetch / Python examples
   - Rate limit + license note (MIT, attribution appreciated)
   - Schema.org `APIReference` JSON-LD for SEO
   - Linked from footer + sidebar
   Add route in `src/App.tsx`.

5. **SEO surfaces**
   - `<title>Free Icon Search API — 51,000+ MIT Icons | Iconstack</title>`
   - Meta description targeting "icon search API", "icon JSON API", "free SVG API"
   - Add `/api` to `public/sitemap-main.xml`
   - Internal links from `/library/*` ("Use this library via our API")

6. **Verification**
   - `curl '.../api/search?q=user&limit=3'` returns expected JSON
   - CORS preflight returns 204 with allow-origin
   - 400 on missing `q`, 429 after burst
   - Docs page loads, "try it" works against live function

## Technical notes

- Index file size estimate: ~51k icons × ~120 bytes ≈ 6 MB JSON, ~1.2 MB gzipped. Acceptable for one-time edge cold-start fetch.
- Function memory: index sits in module scope so warm invocations are O(scan + score). For 51k items per query that's a few ms — fine without a real search index. If latency becomes an issue we can add a pre-built inverted index later.
- No auth required for v1. Rate limiting prevents abuse; we'll add API keys if needed.
- License: keep MIT, ask for attribution + backlink to iconstack.io in the docs (good SEO loop).

## What I need from you

Approve and I'll implement. If you'd rather drop the docs page or skip rate limiting for v1, say so and I'll trim.