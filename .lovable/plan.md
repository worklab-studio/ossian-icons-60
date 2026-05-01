# Remove API & MCP from sidebar + redesign /api page

## 1. Sidebar — remove "API & MCP" entry
In `src/components/app-sidebar.tsx`, delete the `<SidebarMenuItem>` that links to `/api` (lines 111–123). Leave the rest of "Browse" untouched (All Icons + Dodo Invoice). The page is still discoverable from the rotating footer and sitemap, so SEO impact is zero.

## 2. Redesign `src/pages/ApiDocsPage.tsx`

### Add a back button
Top-left sticky bar with "← Back to Iconstack" linking to `/`. Always visible, replacing the centered logo-only header pattern. Uses `Button variant="ghost"` with `ArrowLeft` icon.

### Hero — make it match the dark, premium iconstack aesthetic
- Move from centered "logo in a box" to a left-aligned, editorial hero
- Eyebrow: "Developers & AI tools" badge
- Headline: keep "Icon Search API" but pair with a **mono-styled subtitle** like `npx iconstack-mcp` so the MCP angle is visible above the fold
- Two primary CTAs side-by-side: **"Copy MCP install"** (one-click copies the JSON snippet) and **"Try the API"** (scrolls to Try-it section)
- Stat row under hero: `51,378 icons · 21 libraries · 0 auth · MIT`

### Restructure sections (clear hierarchy)
Current page is a long scroll of equal-weight sections. New order, with section anchors in a sticky sub-nav:

1. **Quickstart** (renamed from Endpoint) — single best curl + result preview side by side
2. **MCP for Cursor / Claude / Windsurf** — promoted higher (it's the headline feature). Tabbed code blocks (Cursor / Claude / Windsurf) instead of stacked headings
3. **Try it** — keep functional, but in a card with a more polished result preview (syntax-highlight feel via mono + subtle bg)
4. **Get raw SVG**
5. **Query parameters** — table styling tightened
6. **Response shape**
7. **Examples** — tabbed (cURL / JS / Python) instead of stacked
8. **License**

### Visual polish
- Section headers: small uppercase eyebrow + larger headline (matches blog/library page patterns already in the project)
- CodeBlock: darker bg in dark mode (`bg-zinc-900`), copy button always visible (not hover-only) on mobile, with check icon after copy
- Cards: use `border-border` + subtle `bg-card`, consistent with project's muted dark mode rule
- Add a small **"Featured in"** strip under hero pointing to existing PH-ready badges (free / no auth / MIT / CORS)

### Tabs implementation
Use existing `@/components/ui/tabs` (shadcn) for MCP-editor-tabs and Examples-language-tabs. Reduces vertical length by ~40%.

### Sticky section nav (desktop only)
Right rail (`lg:` only) with anchor links: Quickstart · MCP · Try it · SVG · Params · Response · Examples · License. Adds polish + jump navigation expected from modern API docs.

## What I will NOT touch
- The actual API contract, params, response shape, function URLs
- SEO meta / canonical / JSON-LD (already correct)
- The MCP install JSON content
- Any other page or the rotating footer (API & MCP stays linked there)

## Files changed
- `src/components/app-sidebar.tsx` — remove the `/api` SidebarMenuItem (and unused `Code2`, `Sparkles` imports)
- `src/pages/ApiDocsPage.tsx` — full UI rewrite (logic preserved)

No new dependencies needed.
