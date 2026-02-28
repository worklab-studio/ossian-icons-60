
# Blog UI Redesign

## Overview
Redesign the blog index page and blog post page with a modern, polished look that matches Iconstack's clean monochrome design system. The current UI is minimal and bare -- we'll add a proper hero section, improved card design, better typography, and reading experience.

## Blog Index Page (`src/pages/BlogIndexPage.tsx`)

### Header / Hero Section
- Large hero area with a bold title "Blog" and a subtitle
- Subtle gradient or decorative element for visual interest
- Back-to-home link styled as a pill/button instead of bare arrow

### Post Grid
- Featured/latest post displayed larger (full-width card with side-by-side image + text on desktop)
- Remaining posts in a 2-column grid
- Cards with better spacing, hover animations, and rounded corners
- Fallback placeholder gradient when no cover image exists

### Empty / Loading States
- Skeleton cards with proper aspect ratios instead of plain rectangles
- More inviting empty state with an icon illustration

## Blog Card (`src/components/blog/BlogCard.tsx`)

- Add a fallback gradient background when there's no cover image
- Better visual hierarchy: category badge on top, then title, excerpt, and date/author at the bottom
- Subtle border glow on hover
- Read time estimate display (calculate from excerpt length or body if available)
- Arrow indicator on hover to signal clickability

## Blog Post Page (`src/pages/BlogPostPage.tsx`)

- Wider max-width header with breadcrumb-style navigation ("Blog > Post Title")
- Hero section with cover image displayed edge-to-edge (within container) with overlay gradient
- Author avatar placeholder + reading time in the meta bar
- Sticky table of contents on the left side for desktop (currently inline)
- Better content width and line height for readability
- "Back to Blog" footer CTA at the end of the article

## Technical Details

### Files Modified
1. **`src/pages/BlogIndexPage.tsx`** -- Complete UI overhaul with hero section, featured post layout, improved grid
2. **`src/components/blog/BlogCard.tsx`** -- Enhanced card design with gradient fallbacks, better hover states, arrow indicator
3. **`src/pages/BlogPostPage.tsx`** -- Improved reading experience with breadcrumbs, better hero, sticky TOC on desktop
4. **`src/components/blog/TableOfContents.tsx`** -- Add sticky positioning support for desktop sidebar layout

### Design Principles
- Stick to the existing monochrome color palette (black/white/grays)
- Use existing Tailwind utilities and design tokens (no new dependencies)
- Smooth hover transitions matching the rest of Iconstack
- Mobile-first responsive design
