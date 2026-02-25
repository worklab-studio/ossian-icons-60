

# Fix Icon Detail Page Issues

## Problems Identified

1. **Icon preview too small** -- The icon visual area needs to be larger and more prominent
2. **Similar icons not loading** -- The search worker indexing has a race condition; when `searchWorkerReady` is false at call time, fallback loads random icons from the same library but may fail
3. **Library links crash the app** -- The LibraryPage component accesses `libraryMetadata.name`, `.count`, etc. inside `<Helmet>` BEFORE the null guard check, causing a React crash (visible in console logs)
4. **Footer doesn't match homepage** -- Detail page uses a plain inline footer instead of the `RotatingFooter` component used on the homepage

---

## Changes

### 1. Make Icon Preview Bigger (IconDetailPage.tsx)

- Increase the left panel width from `w-96` (384px) to a larger size
- Increase icon render size from 320px to ~400px for desktop
- Keep the "Copy SVG" and "Download SVG" buttons unchanged

### 2. Fix Similar Icons Not Loading (IconDetailPage.tsx)

- The `findSimilarIconsAcrossLibraries` function checks `searchWorkerReady` at call time, but the worker may not be ready yet when the icon loads
- Add a `useEffect` that retries finding similar icons once `searchWorkerReady` becomes true
- Ensure the fallback path (loading from same library) works reliably

### 3. Fix Library Page Crash (LibraryPage.tsx)

- The `<Helmet>` block at line 143 accesses `libraryMetadata.name` and `libraryMetadata.count` without a null check
- The guard that returns an error UI is at line 89, but the Helmet renders before the guard catches it in certain cases
- Add early return or null checks so Helmet doesn't crash when `libraryMetadata` is undefined

### 4. Replace Footer with RotatingFooter (IconDetailPage.tsx)

- Replace the plain `<footer>` on both desktop (line 714) and mobile (line 569) layouts with the `<RotatingFooter />` component
- Import `RotatingFooter` from `@/components/RotatingFooter`

---

## Technical Details

**Files modified (2):**

- `src/pages/IconDetailPage.tsx`
  - Increase icon preview container from `w-80 h-80` / size 320 to larger dimensions
  - Add `useEffect` to retry similar icons search when `searchWorkerReady` changes
  - Replace inline footer with `<RotatingFooter />`

- `src/pages/LibraryPage.tsx`
  - Add null guard before `<Helmet>` to prevent crash when `libraryMetadata` is undefined
  - Wrap Helmet content with proper conditional check
