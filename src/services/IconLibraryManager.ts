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
    { id: 'lucide', name: 'Lucide', count: 1500, style: 'outline', description: 'Beautiful & consistent icons' },
    { id: 'atlas', name: 'Atlas', count: 0, style: 'outline', description: 'Comprehensive icon collection' },
    { id: 'feather', name: 'Feather', count: 287, style: 'outline', description: 'Simply beautiful open source icons' },
    { id: 'tabler', name: 'Tabler', count: 4964, style: 'outline', description: 'Free SVG icons for web development' }
  ];

  // Popular libraries to preload for better UX
  private readonly popularLibraries: string[] = ['lucide'];

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

  // Dynamic import library
  private async importLibrary(libraryId: string): Promise<IconItem[]> {
    console.log(`🔍 Importing library: ${libraryId}`);
    
    if (libraryId === 'lucide') {
      const { lucideIcons } = await import('@/data/lucide-icons');
      console.log(`✅ Lucide icons imported: ${lucideIcons.length} icons`);
      return lucideIcons;
    }
    
    if (libraryId === 'atlas') {
      const { atlasIcons } = await import('@/data/atlas');
      console.log(`✅ Atlas icons imported: ${atlasIcons.length} icons`);
      console.log(`🔍 First Atlas icon:`, atlasIcons[0]);
      return atlasIcons;
    }
    
    if (libraryId === 'feather') {
      const { featherIcons } = await import('@/data/feather');
      console.log(`✅ Feather icons imported: ${featherIcons.length} icons`);
      return featherIcons;
    }
    
    if (libraryId === 'tabler') {
      const { tablerIcons } = await import('@/data/tabler');
      console.log(`✅ Tabler icons imported: ${tablerIcons.length} icons`);
      return tablerIcons;
    }
    
    console.warn(`Library ${libraryId} is not supported`);
    return [];
  }

  // Load library with caching and deduplication
  async loadLibrary(libraryId: string): Promise<IconItem[]> {
    // Check memory cache first
    const cached = this.cache.get(libraryId);
    if (cached && !this.isCacheExpired(cached)) {
      // Update access stats
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      // Ensure strict library filtering
      return this.filterIconsByLibraryId(cached.icons, libraryId);
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
      // Ensure strict library filtering
      return this.filterIconsByLibraryId(icons, libraryId);
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
    
    // No SVG processing needed - clean icons
    const icons = rawIcons;
    
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
        // Special handling for Solar icons - group by style
        if (libraryId === 'solar') {
          const styleGroups = this.groupSolarIconsByStyle(icons);
          for (const [style, styleIcons] of styleGroups) {
            sections.push({
              libraryId: `${libraryId}-${style.toLowerCase().replace(' ', '-')}`,
              libraryName: `${libraryMeta.name} - ${style}`,
              icons: styleIcons
            });
          }
        } else {
          sections.push({
            libraryId,
            libraryName: libraryMeta.name,
            icons
          });
        }
      }
    }
    
    return sections;
  }

  // Group Solar icons by style in the desired order
  private groupSolarIconsByStyle(icons: IconItem[]): Map<string, IconItem[]> {
    const styleOrder = ['Outline', 'Linear', 'Line Duotone', 'Broken', 'Bold Duotone', 'Bold'];
    const styleGroups = new Map<string, IconItem[]>();
    
    // Initialize groups in order
    styleOrder.forEach(style => {
      styleGroups.set(style, []);
    });
    
    // Group icons by style
    icons.forEach(icon => {
      const style = icon.style || 'Unknown';
      const normalizedStyle = styleOrder.find(s => s.toLowerCase() === style.toLowerCase()) || 'Unknown';
      
      if (!styleGroups.has(normalizedStyle)) {
        styleGroups.set(normalizedStyle, []);
      }
      styleGroups.get(normalizedStyle)!.push(icon);
    });
    
    // Remove empty groups and return in order
    const result = new Map<string, IconItem[]>();
    styleOrder.forEach(style => {
      const icons = styleGroups.get(style) || [];
      if (icons.length > 0) {
        result.set(style, icons);
      }
    });
    
    return result;
  }

  // Filter icons to ensure they belong to the specified library
  private filterIconsByLibraryId(icons: IconItem[], libraryId: string): IconItem[] {
    console.log(`🔍 Filtering ${icons.length} icons for library: ${libraryId}`);
    
    const filtered = icons.filter(icon => {
      const iconLibraryId = icon.id.split('-')[0];
      const isValidIcon = iconLibraryId === libraryId;
      
      if (!isValidIcon) {
        console.warn(`❌ Filtered out cross-contaminated icon: ${icon.id} from library ${libraryId} (expected: ${libraryId}, got: ${iconLibraryId})`);
      }
      
      return isValidIcon;
    });
    
    console.log(`✅ Filtered result: ${filtered.length} icons for library: ${libraryId}`);
    return filtered;
  }

  // Search across loaded libraries
  searchIcons(query: string, libraryIds?: string[]): IconItem[] {
    if (!query.trim()) return [];
    
    const searchQuery = query.toLowerCase();
    const results: IconItem[] = [];
    
    for (const [libraryId, cached] of this.cache) {
      if (libraryIds && !libraryIds.includes(libraryId)) continue;
      
      // Apply strict library filtering to cached icons
      const libraryIcons = this.filterIconsByLibraryId(cached.icons, libraryId);
      
      for (const icon of libraryIcons) {
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