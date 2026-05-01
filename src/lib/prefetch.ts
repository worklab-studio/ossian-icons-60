// Lightweight route prefetch helpers.
// Trigger these on hover/focus of internal links so the lazy-loaded chunk
// is already in the browser cache by the time the user clicks.

const once = <T,>(fn: () => Promise<T>) => {
  let p: Promise<T> | null = null;
  return () => (p ??= fn());
};

export const prefetchIndex = once(() => import('@/pages/Index'));
export const prefetchApi = once(() => import('@/pages/ApiDocsPage'));
export const prefetchLibrary = once(() => import('@/pages/LibraryPage'));
export const prefetchIconDetail = once(() => import('@/pages/IconDetailPage'));
export const prefetchPopular = once(() => import('@/pages/IconsPopularPage'));
export const prefetchLicense = once(() => import('@/pages/LicensePage'));
export const prefetchCollection = once(() => import('@/pages/CollectionPage'));
export const prefetchComparison = once(() => import('@/pages/ComparisonPage'));
export const prefetchCategoryLibrary = once(() => import('@/pages/CategoryLibraryPage'));
export const prefetchBlogIndex = once(() => import('@/pages/BlogIndexPage'));
export const prefetchBlogPost = once(() => import('@/pages/BlogPostPage'));

export const prefetchByPath = (path: string) => {
  if (path === '/') return prefetchIndex();
  if (path === '/api') return prefetchApi();
  if (path === '/license') return prefetchLicense();
  if (path === '/icons/popular') return prefetchPopular();
  if (path === '/blog') return prefetchBlogIndex();
  if (path.startsWith('/blog/')) return prefetchBlogPost();
  if (path.startsWith('/library/')) return prefetchLibrary();
  if (path.startsWith('/icon/')) return prefetchIconDetail();
  if (path.startsWith('/compare/')) return prefetchComparison();
  if (path.startsWith('/icons/') && path.split('/').length === 4) return prefetchCategoryLibrary();
  if (path.startsWith('/icons/')) return prefetchCollection();
  return Promise.resolve();
};
