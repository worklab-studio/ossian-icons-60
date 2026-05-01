## Where we are

- **Public Icon Search API** at `GET /functions/v1/icon-search` (CORS-open, no auth, ~51k icons).
- **Public Get-SVG API** at `GET /functions/v1/icon-svg?library=<id>&id=<icon-id>` — returns JSON `{ svg, ... }` or raw `image/svg+xml` with `&format=svg`.
- **`npx iconstack-mcp`** package in `mcp-package/` ready to publish to npm. Exposes 3 MCP tools (`search_icons`, `get_icon_svg`, `list_libraries`) and works in Cursor / Claude Desktop / Windsurf out of the box. Smoke-tested locally.
- Index generators in `scripts/`:
  - `generate-search-index.js` → `public/api/icons-index.json` (~7 MB)
  - `generate-svg-index.js` → `public/api/svg/<library>.json` × 21 + `manifest.json` (~45 MB total, biggest single file 6.5 MB)
- Docs page `/api` updated with MCP install snippets and the new get-SVG endpoint.
- `llms.txt` updated with MCP install + svg endpoints + manifest URL.
- Sidebar now links to `/api` as "API & MCP" with a NEW badge, so the feature is discoverable from the homepage.

## Next steps after publish

1. **Publish** so the per-library SVG files (`/api/svg/<lib>.json`) and the updated docs reach `iconstack.io`. The `icon-svg` edge function falls back from the production domain to `iconstack.lovable.app`.
2. After publish, smoke-test:
   ```
   curl 'https://sglpxftkuzsqdpdhftwv.supabase.co/functions/v1/icon-svg?library=lucide&id=user'
   curl 'https://sglpxftkuzsqdpdhftwv.supabase.co/functions/v1/icon-svg?library=lucide&id=user&format=svg'
   ```
3. **Publish the MCP package to npm** (manual, outside Lovable):
   ```
   cd mcp-package && npm install && npm run build && npm publish --access public
   ```
   Once published, `npx iconstack-mcp` works for everyone. Until then, users can clone and run `node mcp-package/dist/index.js`.
4. Whenever icon data changes, re-run BOTH:
   ```
   node scripts/generate-search-index.js
   node scripts/generate-svg-index.js
   ```

## Phase 2 — Smarter semantic search (next)

- **2A — Tag enrichment** via Lovable AI (Gemini 3 Flash). Run `scripts/enrich-tags-ai.js` against icons with thin tags (~15-20% of corpus). Regenerate `icons-index.json`. Half a day. Biggest single quality win.
- **2B — Embedding fallback** for "vibe" queries. Precomputed static vectors shipped as `public/api/icons-vectors.bin`, cosine in-memory in the edge function. Only fires when lexical returns < 5 results or `?semantic=true`. 1-2 days.

## Recommended follow-ups

- **B4 — OG image edge function** for per-icon social previews (still open from earlier).
- **API discovery**: link `/api` from each `LibraryPage` ("Use this library via the API or MCP").
- **GitHub repo for `iconstack-mcp`** so the npm README links resolve.
- **Persistent rate limiting**: not yet — Lovable Cloud lacks the primitives.
