import { type IconItem, type LibrarySection } from '@/types/icon';

// Lightweight metadata structure for initial load
export interface IconLibraryMetadata {
  id: string;
  name: string;
  count: number;
  style: string;
  description?: string;
}

// Cache configuration
const CACHE_KEY_PREFIX = 'icon-library-';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 10; // Maximum number of libraries to keep in memory

interface CachedLibrary {
  icons: IconItem[];
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class IconLibraryManager {
  private cache = new Map<string, CachedLibrary>();
  private loadingPromises = new Map<string, Promise<IconItem[]>>();
  private searchIndex = new Map<string, Set<string>>();

  // Library metadata
  public readonly libraries: IconLibraryMetadata[] = [
    { id: 'ant', name: 'Ant Design', count: 789, style: 'outlined', description: 'Enterprise-class UI design language' },
    { id: 'atlas', name: 'Atlas Icons', count: 2450, style: 'outline', description: 'Professional icon collection' },
    { id: 'bootstrap', name: 'Bootstrap Icons', count: 1846, style: 'outline', description: 'Official Bootstrap icon library' },
    { id: 'carbon', name: 'Carbon Design', count: 2100, style: 'outline', description: 'IBM Carbon Design System icons' },
    { id: 'css-gg', name: 'CSS.gg', count: 704, style: 'minimalist', description: 'Pure CSS icons' },
    { id: 'feather', name: 'Feather', count: 287, style: 'outline', description: 'Beautiful open-source icons' },
    { id: 'fluent-ui', name: 'Fluent UI', count: 5200, style: 'filled/outlined', description: 'Microsoft Fluent Design icons' },
    { id: 'hugeicon', name: 'Hugeicons', count: 4800, style: 'stroke/solid', description: 'Huge collection of icons' },
    { id: 'iconamoon', name: 'Iconamoon', count: 3400, style: 'duotone', description: 'Duotone icon collection' },
    { id: 'iconoir', name: 'Iconoir', count: 1561, style: 'outline', description: 'SVG icon library' },
    { id: 'ikonate', name: 'Ikonate', count: 238, style: 'customizable', description: 'Customizable icons' },
    { id: 'line', name: 'Line Awesome', count: 1544, style: 'outline', description: 'Line style awesome icons' },
    { id: 'lucide', name: 'Lucide', count: 1500, style: 'outline', description: 'Beautiful & consistent icons' },
    { id: 'majesticon', name: 'Majesticons', count: 760, style: 'outline/solid', description: 'High-quality icon set' },
    { id: 'mingcute', name: 'Mingcute', count: 2600, style: 'outline/filled', description: 'Cute and minimal icons' },
    { id: 'octicons', name: 'Octicons', count: 329, style: 'outline', description: 'GitHub Octicons' },
    { id: 'phosphor', name: 'Phosphor', count: 9000, style: 'thin/light/regular/bold/fill/duotone', description: 'Flexible icon family' },
    { id: 'pixelart-icons', name: 'Pixelarticons', count: 460, style: 'pixelart', description: 'Pixel art style icons' },
    { id: 'pixelart', name: 'Pixelart', count: 460, style: 'pixelart', description: 'Alternative pixel art icons' },
    { id: 'proicons', name: 'Proicons', count: 300, style: 'outline', description: 'Professional icons' },
    { id: 'radix', name: 'Radix UI', count: 318, style: 'outline', description: 'Radix UI icon collection' },
    { id: 'sargam', name: 'Sargam Icons', count: 700, style: 'outline', description: 'Open-source icon library' },
    { id: 'simple', name: 'Simple Icons', count: 2900, style: 'brand', description: 'Popular brand icons' },
    { id: 'solar', name: 'Solar Icons', count: 7000, style: 'linear/bold/broken/outline', description: 'Solar design system icons' },
    { id: 'tabler', name: 'Tabler Icons', count: 6000, style: 'outline', description: 'Free SVG icons' },
    { id: 'teeny-icons', name: 'Teeny Icons', count: 1200, style: 'outline/solid', description: 'Tiny 1px icons' }
  ];

  // Popular libraries to preload for better UX
  private readonly popularLibraries: string[] = ['lucide', 'phosphor', 'tabler', 'solar', 'iconoir'];

  constructor() {
    // Clean up old cache entries on startup
    this.clearOldCacheEntries();
    this.cleanupExpiredCache();
    
    // Set up periodic cache cleanup
    setInterval(() => {
      this.clearOldCacheEntries();
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Dynamic import functions for each library - empty for now
  private async importLibrary(libraryId: string): Promise<IconItem[]> {
    try {
      switch (libraryId) {
        case 'ant': {
          const { antIcons } = await import('@/Data/ant-icons');
          return antIcons;
        }
        case 'atlas': {
          const { atlasIcons } = await import('@/Data/atlas-icons');
          return atlasIcons;
        }
        case 'bootstrap': {
          const { bootstrapIcons } = await import('@/Data/bootstrap-icons');
          return bootstrapIcons;
        }
        case 'carbon': {
          const { carbonIcons } = await import('@/Data/carbon-icons');
          return carbonIcons;
        }
        case 'css-gg': {
          const { cssGgIcons } = await import('@/Data/css-gg-icons');
          return cssGgIcons;
        }
        case 'feather': {
          const { featherIcons } = await import('@/Data/feather-icons');
          return featherIcons;
        }
        case 'fluent-ui': {
          const { fluentUiIcons } = await import('@/Data/fluent-ui-icons');
          return fluentUiIcons;
        }
        case 'hugeicon': {
          const { hugeiconIcons } = await import('@/Data/hugeicon-icons');
          return hugeiconIcons;
        }
        case 'iconamoon': {
          const { iconamoonIcons } = await import('@/Data/iconamoon-icons');
          return iconamoonIcons;
        }
        case 'iconoir': {
          const { iconoirIcons } = await import('@/Data/iconoir-icons');
          return iconoirIcons;
        }
        case 'ikonate': {
          const { ikonateIcons } = await import('@/Data/ikonate-icons');
          return ikonateIcons;
        }
        case 'line': {
          const { lineIcons } = await import('@/Data/line-icons');
          return lineIcons;
        }
        case 'lucide': {
          const { lucideIcons } = await import('@/Data/lucide-icons');
          return lucideIcons;
        }
        case 'majesticon': {
          const { majesticonIcons } = await import('@/Data/majesticon-icons');
          return majesticonIcons;
        }
        case 'mingcute': {
          const { mingcuteIcons } = await import('@/Data/mingcute-icons');
          return mingcuteIcons;
        }
        case 'octicons': {
          const { octiconsIcons } = await import('@/Data/octicons-icons');
          return octiconsIcons;
        }
        case 'phosphor': {
          const { phosphorIcons } = await import('@/Data/phosphor-icons');
          return phosphorIcons;
        }
        case 'pixelart-icons': {
          const { pixelartIconsIcons } = await import('@/Data/pixelart-icons-icons');
          return pixelartIconsIcons;
        }
        case 'pixelart': {
          const { pixelartIcons } = await import('@/Data/pixelart-icons');
          return pixelartIcons;
        }
        case 'proicons': {
          const { proiconsIcons } = await import('@/Data/proicons-icons');
          return proiconsIcons;
        }
        case 'radix': {
          const { radixIcons } = await import('@/Data/radix-icons');
          return radixIcons;
        }
        case 'sargam': {
          const { sargamIcons } = await import('@/Data/sargam-icons');
          return sargamIcons;
        }
        case 'simple': {
          const { simpleIcons } = await import('@/Data/simple-icons');
          return simpleIcons;
        }
        case 'solar': {
          const { solarIcons } = await import('@/Data/solar-icons');
          return solarIcons;
        }
        case 'tabler': {
          const { tablerIcons } = await import('@/Data/tabler-icons');
          return tablerIcons;
        }
        case 'teeny-icons': {
          const { teenyIconsIcons } = await import('@/Data/teeny-icons-icons');
          return teenyIconsIcons;
        }
        default:
          console.warn(`Library ${libraryId} not available`);
          return [];
      }
    } catch (error) {
      console.error(`Failed to load library ${libraryId}:`, error);
      return [];
    }
  }

  // Load library with caching and deduplication
  async loadLibrary(libraryId: string): Promise<IconItem[]> {
    // Check memory cache first
    const cached = this.cache.get(libraryId);
    if (cached && !this.isCacheExpired(cached)) {
      // Update access stats
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached.icons;
    }

    // Check if already loading
    if (this.loadingPromises.has(libraryId)) {
      return this.loadingPromises.get(libraryId)!;
    }

    // Start loading
    const loadPromise = this.loadLibraryInternal(libraryId);
    this.loadingPromises.set(libraryId, loadPromise);

    try {
      const icons = await loadPromise;
      this.loadingPromises.delete(libraryId);
      return icons;
    } catch (error) {
      this.loadingPromises.delete(libraryId);
      throw error;
    }
  }

  // Load library in batches - returns initial batch immediately
  async loadLibraryProgressive(libraryId: string, initialBatchSize: number = 100): Promise<{
    initialBatch: IconItem[];
    loadRemaining: () => Promise<IconItem[]>;
  }> {
    // Check cache first
    const cached = this.cache.get(libraryId);
    if (cached && !this.isCacheExpired(cached)) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      const icons = cached.icons;
      return {
        initialBatch: icons.slice(0, initialBatchSize),
        loadRemaining: async () => icons
      };
    }

    // Load full library and return batched
    const allIcons = await this.loadLibrary(libraryId);
    return {
      initialBatch: allIcons.slice(0, initialBatchSize),
      loadRemaining: async () => allIcons
    };
  }

  // Load all libraries progressively
  async loadAllLibrariesProgressive(initialBatchSize: number = 100): Promise<{
    initialBatch: IconItem[];
    loadRemaining: () => Promise<IconItem[]>;
  }> {
    const libraryIds = this.libraries.map(lib => lib.id);
    const initialBatches: IconItem[] = [];
    const loadRemainingFns: Array<() => Promise<IconItem[]>> = [];

    // Get initial batch from each library
    for (const libraryId of libraryIds.slice(0, 6)) { // Prioritize first 6 libraries
      try {
        const { initialBatch, loadRemaining } = await this.loadLibraryProgressive(libraryId, Math.floor(initialBatchSize / 6));
        initialBatches.push(...initialBatch);
        loadRemainingFns.push(loadRemaining);
      } catch (error) {
        console.warn(`Failed to load initial batch for ${libraryId}:`, error);
      }
    }

    return {
      initialBatch: initialBatches,
      loadRemaining: async () => {
        // Load all remaining icons in background
        const allIcons = await this.loadAllLibraries();
        return allIcons;
      }
    };
  }

  // Load all libraries sectioned progressively
  async loadAllLibrariesSectionedProgressive(initialBatchSize: number = 100): Promise<{
    initialSections: LibrarySection[];
    loadRemaining: () => Promise<LibrarySection[]>;
  }> {
    const libraryIds = this.libraries.slice(0, 6).map(lib => lib.id); // Prioritize first 6 libraries
    const initialSections: LibrarySection[] = [];
    const batchPerLibrary = Math.floor(initialBatchSize / libraryIds.length);

    // Get initial batch from each library
    for (const libraryId of libraryIds) {
      try {
        const libraryMeta = this.libraries.find(lib => lib.id === libraryId);
        if (!libraryMeta) continue;

        const { initialBatch } = await this.loadLibraryProgressive(libraryId, batchPerLibrary);
        
        if (initialBatch.length > 0) {
          initialSections.push({
            libraryId,
            libraryName: libraryMeta.name,
            icons: initialBatch
          });
        }
      } catch (error) {
        console.warn(`Failed to load initial section for ${libraryId}:`, error);
      }
    }

    return {
      initialSections,
      loadRemaining: async () => {
        // Load all remaining sections in background
        const allSections = await this.loadAllLibrariesGrouped();
        return allSections;
      }
    };
  }

  private async loadLibraryInternal(libraryId: string): Promise<IconItem[]> {
    // Try localStorage cache first
    const localCache = this.getFromLocalStorage(libraryId);
    if (localCache && !this.isCacheExpired(localCache)) {
      this.updateMemoryCache(libraryId, localCache.icons);
      return localCache.icons;
    }

    // Import the raw library
    const rawIcons = await this.importLibrary(libraryId);
    
    // Apply optimizeSvg on every string icon at load for normalized exports
    const { optimizeSvg } = await import('@/lib/svg-optimize');
    const icons = rawIcons.map(icon => ({
      ...icon,
      svg: typeof icon.svg === 'string' ? optimizeSvg(icon.svg) : icon.svg
    }));
    
    // Cache the result
    this.updateMemoryCache(libraryId, icons);
    this.saveToLocalStorage(libraryId, icons);
    
    // Update search index
    this.updateSearchIndex(libraryId, icons);
    
    return icons;
  }

  // Get multiple libraries
  async loadLibraries(libraryIds: string[]): Promise<Map<string, IconItem[]>> {
    const results = new Map<string, IconItem[]>();
    const promises = libraryIds.map(async (id) => {
      const icons = await this.loadLibrary(id);
      results.set(id, icons);
    });
    
    await Promise.all(promises);
    return results;
  }

  // Load all libraries (for "all" view)
  async loadAllLibraries(): Promise<IconItem[]> {
    const libraryIds = this.libraries.map(lib => lib.id);
    const libraryMap = await this.loadLibraries(libraryIds);
    
    const allIcons: IconItem[] = [];
    for (const [, icons] of libraryMap) {
      allIcons.push(...icons);
    }
    
    return allIcons;
  }

  // Load all libraries grouped by library (for sectioned "all" view)
  async loadAllLibrariesGrouped(): Promise<LibrarySection[]> {
    const libraryIds = this.libraries.map(lib => lib.id);
    const libraryMap = await this.loadLibraries(libraryIds);
    
    const sections: LibrarySection[] = [];
    for (const libraryId of libraryIds) {
      const libraryMeta = this.libraries.find(lib => lib.id === libraryId);
      const icons = libraryMap.get(libraryId) || [];
      
      if (icons.length > 0 && libraryMeta) {
        sections.push({
          libraryId,
          libraryName: libraryMeta.name,
          icons
        });
      }
    }
    
    return sections;
  }

  // Search across loaded libraries
  searchIcons(query: string, libraryIds?: string[]): IconItem[] {
    if (!query.trim()) return [];
    
    const searchQuery = query.toLowerCase();
    const results: IconItem[] = [];
    
    for (const [libraryId, cached] of this.cache) {
      if (libraryIds && !libraryIds.includes(libraryId)) continue;
      
      for (const icon of cached.icons) {
        if (
          icon.name.toLowerCase().includes(searchQuery) ||
          icon.tags?.some(tag => tag.toLowerCase().includes(searchQuery)) ||
          icon.category?.toLowerCase().includes(searchQuery)
        ) {
          results.push(icon);
        }
      }
    }
    
    return results;
  }

  // Preload popular libraries
  private async preloadPopularLibraries() {
    try {
      await Promise.allSettled(
        this.popularLibraries.map(id => this.loadLibrary(id))
      );
    } catch (error) {
      console.warn('Failed to preload popular libraries:', error);
    }
  }

  // Cache management
  private updateMemoryCache(libraryId: string, icons: IconItem[]) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(libraryId)) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(libraryId, {
      icons,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }

  private evictLeastRecentlyUsed() {
    let oldestAccess = Date.now();
    let oldestKey = '';

    for (const [key, cached] of this.cache) {
      if (cached.lastAccessed < oldestAccess) {
        oldestAccess = cached.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      localStorage.removeItem(CACHE_KEY_PREFIX + oldestKey);
    }
  }

  private isCacheExpired(cached: CachedLibrary): boolean {
    return Date.now() - cached.timestamp > CACHE_EXPIRY_MS;
  }

  // LocalStorage cache with size management
  private saveToLocalStorage(libraryId: string, icons: IconItem[]) {
    try {
      // Don't cache large icon libraries with React components - only cache metadata
      if (icons.length > 100) {
        console.log(`Skipping localStorage cache for large library: ${libraryId} (${icons.length} icons)`);
        return;
      }
      
      // Create lightweight version without React components
      const lightweightIcons = icons.map(icon => ({
        id: icon.id,
        name: icon.name,
        tags: icon.tags,
        category: icon.category,
        style: icon.style,
        // Only store string SVGs, not React components
        svg: typeof icon.svg === 'string' ? icon.svg : null
      }));
      
      const data = {
        icons: lightweightIcons,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now()
      };
      
      const serialized = JSON.stringify(data);
      if (serialized.length < 2 * 1024 * 1024) { // 2MB limit
        localStorage.setItem(CACHE_KEY_PREFIX + libraryId, serialized);
      } else {
        console.warn(`Data too large to cache: ${libraryId} (${(serialized.length / 1024 / 1024).toFixed(2)}MB)`);
      }
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      // Try to clear some space by removing old cache entries
      this.clearOldCacheEntries();
    }
  }

  private clearOldCacheEntries() {
    try {
      // Remove expired entries first
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear old cache entries:', error);
    }
  }

  private cleanupExpiredCache() {
    try {
      for (const [key, cached] of this.cache) {
        if (this.isCacheExpired(cached)) {
          this.cache.delete(key);
          localStorage.removeItem(CACHE_KEY_PREFIX + key);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup expired cache:', error);
    }
  }

  private getFromLocalStorage(libraryId: string): CachedLibrary | null {
    try {
      const data = localStorage.getItem(CACHE_KEY_PREFIX + libraryId);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Filter out any invalid icons
      const validIcons = parsed.icons.filter((icon: any) => icon && icon.id && icon.name);
      
      return {
        icons: validIcons,
        timestamp: parsed.timestamp,
        accessCount: parsed.accessCount || 1,
        lastAccessed: parsed.lastAccessed || Date.now()
      };
    } catch (error) {
      console.warn(`Failed to load from localStorage: ${libraryId}`, error);
      // Remove corrupted cache entry
      localStorage.removeItem(CACHE_KEY_PREFIX + libraryId);
      return null;
    }
  }

  private updateSearchIndex(libraryId: string, icons: IconItem[]) {
    const searchTerms = new Set<string>();
    
    icons.forEach(icon => {
      // Add icon name terms
      searchTerms.add(icon.name.toLowerCase());
      
      // Add tag terms
      icon.tags?.forEach(tag => {
        searchTerms.add(tag.toLowerCase());
      });
      
      // Add category term
      if (icon.category) {
        searchTerms.add(icon.category.toLowerCase());
      }
    });
    
    this.searchIndex.set(libraryId, searchTerms);
  }

  // Get search suggestions based on indexed terms
  getSearchSuggestions(query: string, maxSuggestions: number = 10): string[] {
    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();
    
    for (const [, terms] of this.searchIndex) {
      for (const term of terms) {
        if (term.includes(queryLower) && suggestions.size < maxSuggestions) {
          suggestions.add(term);
        }
      }
    }
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  // Clear all caches
  clearAllCaches() {
    this.cache.clear();
    this.searchIndex.clear();
    
    // Clear localStorage caches
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear localStorage caches:', error);
    }
  }

  // Check if we have cached data for priority libraries
  hasPriorityLibraryCache(): boolean {
    // Since we don't have any libraries right now, return false
    return false;
  }

  // Get cache statistics
  getCacheStats() {
    const stats = {
      memoryCacheSize: this.cache.size,
      searchIndexSize: this.searchIndex.size,
      totalCachedIcons: 0,
      localStorageKeys: 0
    };

    // Count total cached icons
    for (const [, cached] of this.cache) {
      stats.totalCachedIcons += cached.icons.length;
    }

    // Count localStorage keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          stats.localStorageKeys++;
        }
      }
    } catch (error) {
      console.warn('Failed to count localStorage keys:', error);
    }

    return stats;
  }
}

// Singleton instance
export const iconLibraryManager = new IconLibraryManager();