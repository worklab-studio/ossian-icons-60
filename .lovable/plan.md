

# SEO Strategy: Capitalize on MCP Server Page Traffic

## Key Finding
Hugeicon has **410 AI-prefixed icons** (ai-brain, ai-chat, ai-cloud, ai-network, ai-generative, ai-computer, ai-programming, etc.) and 1 MCP icon. **None of these are surfaced through collection pages** because there is no "AI" category in `seo-categories.ts`. This is a massive gap.

## What to Build

### 1. Add "AI & Machine Learning" SEO category (`src/data/seo-categories.ts`)
Add a new category entry with slug `"ai"`, targeting search tags like `"ai"`, `"artificial-intelligence"`, `"machine-learning"`, `"neural"`, `"brain"`, `"chatbot"`, `"mcp"`, `"generative"`, `"deep-learning"`, `"llm"`. This will automatically create:
- `/icons/ai` -- cross-library AI icons collection page (~410+ icons)
- `/icons/ai/hugeicon` -- Hugeicon AI icons page
- Related pages per library that has matching icons

SEO title: *"Best AI & Machine Learning Icons for UI Design"*

### 2. Add "API & Developer Tools" SEO category (`src/data/seo-categories.ts`)
Slug `"api"`, targeting `"api"`, `"sdk"`, `"webhook"`, `"endpoint"`, `"rest"`, `"graphql"`, `"json"`, `"token"`. This captures the developer intent that drives MCP searches.

### 3. Enhance MCP icon tags for better cross-linking (`src/data/hugeicon.ts`)
The MCP icon currently has minimal tags: `["mcp", "server"]`. Add richer tags like `"ai"`, `"protocol"`, `"api"`, `"integration"`, `"model-context-protocol"` so it appears in the new AI and API categories and has better similar-icon matching.

### 4. Regenerate collection sitemaps (`scripts/regenerate-sitemaps.js`)
The new categories need to be included in `sitemap-collections.xml`. The existing script reads from `seo-categories.ts`, so it just needs to be re-run (no code change needed -- just the data file change triggers it).

## Files to Modify
1. **`src/data/seo-categories.ts`** -- Add 2 new categories (AI + API)
2. **`src/data/hugeicon.ts`** -- Enrich MCP icon tags

## Expected SEO Impact
- Creates ~10-15 new programmatic pages targeting high-intent AI/developer queries
- Internal links from `/icons/ai` collection to all 410+ AI icon detail pages
- The MCP icon page gets linked from collection pages, reinforcing its authority
- Targets trending searches: "ai icon svg", "machine learning icon", "mcp icon", "api icon svg"

