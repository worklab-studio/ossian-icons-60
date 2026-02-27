
# Blog with Sanity CMS Integration

## Overview
Add a blog to Iconstack powered by Sanity CMS, with SEO-optimized pages, Article schema markup, and sitemap integration. Sanity's free tier (3 users, 500K API requests/month) is more than enough to start.

## Step 1: Set Up Sanity (You do this manually)

1. Go to [sanity.io](https://www.sanity.io) and create a free account
2. Create a new project (name it "Iconstack Blog")
3. Note your **Project ID** and **Dataset** name (usually "production")
4. In Sanity project settings, add `iconstack.io` and your Lovable preview URL to the CORS origins list
5. Install Sanity Studio locally or use their hosted studio to create/manage blog posts

Your Sanity schema for blog posts should include:
- `title` (string)
- `slug` (slug)
- `excerpt` (text)
- `body` (block content / portable text)
- `publishedAt` (datetime)
- `coverImage` (image)
- `author` (string)
- `categories` (array of strings)
- `seoTitle` (string, optional override)
- `seoDescription` (text, optional override)

## Step 2: Install Dependencies
- `@sanity/client` - Sanity API client
- `@portabletext/react` - Render Sanity's rich text (Portable Text) in React

## Step 3: Create Sanity Client Service
**New file: `src/services/SanityClient.ts`**
- Configure `@sanity/client` with project ID, dataset, API version, and `useCdn: true`
- Export typed fetch functions: `getPosts()`, `getPost(slug)`, `getPostsByCategory(category)`
- Store Project ID and Dataset as constants (these are public/safe to expose)

## Step 4: Create Blog Types
**New file: `src/types/blog.ts`**
- `BlogPost` interface with title, slug, excerpt, body, publishedAt, coverImage, author, categories, seoTitle, seoDescription

## Step 5: Create Blog Pages
**New file: `src/pages/BlogIndexPage.tsx`**
- `/blog` route showing all posts in a grid/list
- Each card: cover image, title, excerpt, date, category tags
- Article schema markup for the page (ItemList)
- Meta tags via Helmet
- Link to individual posts

**New file: `src/pages/BlogPostPage.tsx`**
- `/blog/:slug` route for individual posts
- Render Portable Text body content
- Table of contents (auto-generated from headings)
- Article schema markup (author, datePublished, headline, image)
- Breadcrumb schema
- Open Graph and Twitter Card meta tags
- Related posts section at bottom
- Internal links to relevant icon pages where applicable

## Step 6: Create Blog Components
**New file: `src/components/blog/BlogCard.tsx`** - Post preview card
**New file: `src/components/blog/BlogLayout.tsx`** - Shared blog layout with header/nav
**New file: `src/components/blog/TableOfContents.tsx`** - Auto-generated TOC from headings
**New file: `src/components/blog/PortableTextRenderer.tsx`** - Custom Portable Text serializers for rendering rich content with proper styling

## Step 7: Add Schema Markup
**Modified: `src/services/SchemaService.ts`**
- Add `generateArticleSchema(post)` method for blog posts
- Add `generateBlogListSchema(posts)` for the blog index

## Step 8: Add Routes
**Modified: `src/App.tsx`**
- Add `/blog` route pointing to `BlogIndexPage`
- Add `/blog/:slug` route pointing to `BlogPostPage`

## Step 9: Sitemap Integration
**Modified: `src/services/SitemapService.ts`**
- Add `generateBlogSitemap()` that fetches post slugs from Sanity
- Add blog sitemap entry to the sitemap index

## Content Strategy Notes
Ideal first blog posts for SEO traffic:
- "Best Free Icon Libraries for Web Developers in 2026"
- "Lucide vs Heroicons: Which Icon Library Should You Use?"
- "How to Add SVG Icons to Your React Project"
- "Free Brand Icons for Your Website: A Complete Guide"

These target high-volume informational queries and naturally link back to your icon/library pages.
