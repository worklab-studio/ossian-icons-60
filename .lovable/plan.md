

# Enhance Library Pages for "[Library Name] Icons List" SEO

## Overview

Add a library-specific FAQ section with structured data and richer descriptive text to each `/library/:id` page to target high-intent searches like "tabler icons list" and "phosphor icons list".

## Changes

### 1. New Component: `src/components/LibraryFAQ.tsx`

A collapsible FAQ section rendered below the icon grid using the existing `Accordion` component. Questions are dynamically generated from library metadata:
- "How many [Library] icons are available?"
- "Are [Library] icons free to use?"
- "What styles does [Library] offer?"
- "How do I use [Library] icons in my project?"
- "Can I customize [Library] icons?"

### 2. Update `src/services/SchemaService.ts`

Add `generateLibraryFAQSchema(libraryName, count, style)` method that produces FAQ structured data so Google can show rich FAQ snippets for library pages.

### 3. Update `src/hooks/useSchemaMarkup.ts`

On library pages, include the library-specific FAQ schema in the combined schema output. Pass library metadata through to generate it.

### 4. Update `src/pages/LibraryPage.tsx`

- **Left sidebar**: Add intro paragraph below the library description: "Browse the complete list of {count} {Library} icons below. Search to find specific icons."
- **Below grid (desktop)**: Add `LibraryFAQ` component between the grid and `RotatingFooter`
- **Below grid (mobile)**: Add FAQ section at the bottom of scrollable content
- **SEO meta**: Enrich meta description to include "complete list" phrasing; pass library metadata to `useSchemaMarkup` for FAQ schema generation

### Files Created
- `src/components/LibraryFAQ.tsx`

### Files Modified
- `src/pages/LibraryPage.tsx`
- `src/services/SchemaService.ts`
- `src/hooks/useSchemaMarkup.ts`

