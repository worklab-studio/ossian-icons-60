

# Blog Redesign -- Ghost Casper Theme Style

## Overview
Redesign the blog index page, blog cards, blog post page, and portable text renderer to match the clean, editorial aesthetic of Ghost's Casper theme. The design will use your existing monochrome design tokens so it works seamlessly in both light and dark mode.

## Design Reference (Casper Theme Characteristics)
- Large centered hero with site title and tagline on a clean background
- Featured post: full-width card with large image on the left, text on the right
- Post grid: 3-column layout with image-top cards, no borders -- just subtle shadows/hover
- Clean serif-inspired headings, generous whitespace
- Post page: centered narrow column (~720px), large hero image, author byline with avatar placeholder, minimal chrome
- No visible card borders -- cards rely on image + whitespace for separation
- Footer navigation back to blog

## Files to Modify

### 1. `src/pages/BlogIndexPage.tsx`
- Centered hero section with large "Blog" title and subtitle, no border-bottom -- just spacious padding
- Remove the pill-style "Back to Iconstack" link, replace with a simple text link in a top nav bar
- Featured post rendered as a large full-width card (image left, content right on desktop; stacked on mobile)
- Remaining posts in a **3-column grid** (2-col on tablet, 1-col on mobile)
- Cleaner loading skeletons matching the new 3-col layout

### 2. `src/components/blog/BlogCard.tsx`
- **Remove borders** from cards -- use white/dark card background with subtle shadow on hover
- Image aspect ratio 16:10 with rounded-lg corners
- Below image: category tag as small uppercase text (not a badge), then title, excerpt, and a footer with author + date + read time
- Featured card: side-by-side layout with large image, big title (text-3xl), excerpt, and meta
- Hover effect: slight upward translate + shadow, no border glow
- No arrow icon -- clean and minimal

### 3. `src/pages/BlogPostPage.tsx`
- Remove the sticky header with breadcrumbs -- replace with a simple centered top nav ("Iconstack Blog" link)
- Large post title centered, max-w-3xl (720px)
- Author byline: circular avatar placeholder + author name + date + read time, all centered
- Cover image: full-width within the content container, rounded-xl, no border
- Article content in a narrow centered column (max-w-2xl / ~680px) for optimal reading width
- TOC stays as sidebar on desktop but with cleaner styling
- Footer: "Read more" section with up to 2 related/recent post cards, then a "Back to Blog" link

### 4. `src/components/blog/PortableTextRenderer.tsx`
- Increase body text size slightly (text-lg with leading-[1.8])
- Body text color: use `text-foreground/80` instead of `muted-foreground` for better readability
- Headings: bolder with more top margin for clear section breaks
- Blockquotes: thicker left border, slightly larger text
- Images: full-bleed within content column, larger rounded corners

### 5. `src/components/blog/TableOfContents.tsx`
- Minimal changes -- just adjust spacing and font size to match the new editorial feel

## Design Tokens (No New Dependencies)
All styling uses existing Tailwind classes and CSS variables:
- Light mode: white backgrounds, dark text, subtle gray shadows
- Dark mode: dark card backgrounds (`bg-card`), lighter text, softer shadows
- Hover states use `transition-all duration-300` with `hover:-translate-y-1 hover:shadow-lg`

## Layout Summary

```text
Blog Index:
+----------------------------------------------+
|            Iconstack Blog (nav)              |
+----------------------------------------------+
|                                              |
|              Blog                            |
|    Guides, tips & resources for...           |
|                                              |
+----------------------------------------------+
| [  Featured Image  ] | Category              |
|                      | Big Title Here         |
|                      | Excerpt text...        |
|                      | Author . Date . 5 min  |
+----------------------------------------------+
| [Card 1]    [Card 2]    [Card 3]             |
| img         img          img                 |
| Category    Category     Category            |
| Title       Title        Title               |
| Excerpt     Excerpt      Excerpt             |
| Meta        Meta         Meta                |
+----------------------------------------------+

Blog Post:
+----------------------------------------------+
|            <- Iconstack Blog                 |
+----------------------------------------------+
|                                              |
|         Category . 5 min read                |
|         Big Post Title Here                  |
|         Author . Feb 28, 2026                |
|                                              |
|  [       Full-width cover image       ]      |
|                                              |
|     Narrow body content column (680px)       |
|     with generous line height and spacing    |
|                                              |
+----------------------------------------------+
```

