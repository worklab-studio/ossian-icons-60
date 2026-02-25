

# Optimize Icon Page Titles for Search Intent

## Scale
This change affects **51,378 individual icon pages** — each with a unique, crawlable URL and its own `<title>` tag. That's 51k+ pages competing for long-tail search queries like "activity icon svg download" or "arrow icon feather".

## Current Title
```
Activity Icon (Outline) - Free SVG from Feather | Iconstack
```

## Proposed Title Format
```
Activity Icon - Free SVG Download | Feather Icons
```

### Why this is better for search:
- **"Free SVG Download"** matches high-intent search queries (people searching want to download)
- **"Feather Icons"** reads naturally and matches how people refer to libraries
- **Removes style parenthetical** from title (clutters; kept in meta description instead)
- **Shorter and punchier** — Google truncates titles over ~60 chars, so every word matters

## Technical Change

### File: `src/services/IconMetaService.ts`

**`generateTitle` method (line 132-134):**
- From: `{name} Icon{(Style)} - Free SVG from {Library} | Iconstack`
- To: `{name} Icon - Free SVG Download | {Library} Icons`

**`generateOGTitle` method (line 157-159):**
- From: `{name}{Style} Icon | {Library} | Iconstack`  
- To: `{name} Icon - Free SVG Download | {Library} Icons`
- (Consistent with page title for social sharing)

**One file changed, two methods updated. Affects all 51,378 icon pages automatically.**
