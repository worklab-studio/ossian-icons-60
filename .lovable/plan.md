

# Fix Icon Detail Page: Preview Size, Similar Icons, Library Links

## Issues

1. **Icon preview too large** -- 400x400 is oversized per user feedback, needs to be reduced
2. **Similar icons empty** -- Only searching 4 libraries instead of all available ones
3. **Library page crashing** -- Helmet component crashes during render; need bulletproof null handling

## Changes

### 1. Reduce Icon Preview Size (IconDetailPage.tsx)

- Desktop: Change from `w-[400px] h-[400px]` to `w-[280px] h-[280px]`
- Desktop container wrapper (line 630): Change from `w-[400px] h-[400px]` to `w-[280px] h-[280px]`
- Left panel width: Reduce from `w-[480px]` to `w-[400px]`
- Mobile: Keep `w-48 h-48` (192px) as-is
- Copy SVG and Download SVG buttons remain unchanged

### 2. Load ALL Libraries for Similar Icons (IconDetailPage.tsx)

- Replace the limited `librariesToSearch` array (4 libraries) with ALL libraries from `iconLibraryManager.libraries`
- Load all libraries in parallel using `Promise.allSettled` for resilience
- Keep the same scoring logic (name/tag word overlap)
- This guarantees similar icons from every library appear

Current code (line 123-131):
```
const librariesToSearch = [parsedLibraryId];
const popular = ['lucide', 'tabler', 'heroicons', 'phosphor', 'feather'];
for (const id of popular) {
  if (id !== parsedLibraryId && librariesToSearch.length < 4) {
    librariesToSearch.push(id);
  }
}
```

New approach: use `iconLibraryManager.libraries.map(lib => lib.id)` to search ALL libraries.

### 3. Fix Library Page Crash (LibraryPage.tsx)

The Helmet component at line 112-122 accesses `libraryMetadata.count` and `libraryMetadata.style` which can error if the Helmet component processes them during an intermediate state. Fix by:

- Moving the early return guard ABOVE the Helmet render: return error UI if `!libraryMetadata` regardless of loading state
- Use optional chaining (`libraryMetadata?.style`, `libraryMetadata?.count`) inside Helmet as extra safety
- This prevents the crash that occurs when navigating to `/library/{id}`

---

## Technical Details

**Files modified (2):**

**`src/pages/IconDetailPage.tsx`:**
- Line 312: Change `w-[400px] h-[400px]` to `w-[280px] h-[280px]`
- Line 327: Change size `400` to `280`
- Line 627: Change `w-[480px]` to `w-[400px]`
- Line 630: Change `w-[400px] h-[400px]` to `w-[280px] h-[280px]`
- Lines 123-142: Replace limited library search with `Promise.allSettled` across ALL libraries from `iconLibraryManager.libraries`

**`src/pages/LibraryPage.tsx`:**
- Line 83: Change guard to `if (error || !libraryMetadata)` (remove `&& !loading` condition) so it returns error UI immediately when metadata is missing
- Lines 113-114: Add optional chaining on `.count`, `.style` inside Helmet as extra safety

