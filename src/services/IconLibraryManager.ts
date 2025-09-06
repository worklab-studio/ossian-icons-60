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

  // Library metadata - loaded synchronously for initial UI
  public readonly libraries: IconLibraryMetadata[] = [
    { id: 'tabler', name: 'Tabler', count: 5000, style: 'outline' },
    { id: 'ant', name: 'Ant Design', count: 800, style: 'mixed' },
    { id: 'lucide', name: 'Lucide', count: 1500, style: 'outline' },
    { id: 'fluent', name: 'Fluent UI', count: 2000, style: 'mixed' },
    { id: 'atlas', name: 'Atlas Icons', count: 300, style: 'outline' },
    { id: 'feather', name: 'Feather', count: 287, style: 'outline' },
    { id: 'solar', name: 'Solar', count: 7000, style: 'mixed' },
    { id: 'bootstrap', name: 'Bootstrap', count: 2000, style: 'filled' },
    { id: 'remix', name: 'Remix', count: 2800, style: 'mixed' },
    { id: 'material', name: 'Material Design', count: 7000, style: 'filled' },
    { id: 'pixelart', name: 'Pixelart Icons', count: 400, style: 'pixel' },
    { id: 'line', name: 'Line Icons', count: 500, style: 'outline' },
    { id: 'phosphor', name: 'Phosphor', count: 9000, style: 'mixed' },
    { id: 'iconnoir', name: 'IconNoir', count: 1400, style: 'outline' },
    { id: 'css-gg', name: 'CSS.gg', count: 700, style: 'outline' },
    { id: 'iconsax', name: 'Iconsax', count: 6000, style: 'mixed' },
    { id: 'boxicons', name: 'BoxIcons', count: 1600, style: 'mixed' },
    { id: 'octicons', name: 'Octicons', count: 600, style: 'filled' },
    { id: 'teeny', name: 'Teeny Icons', count: 2000, style: 'outline' },
    { id: 'radix', name: 'Radix Icons', count: 300, style: 'filled' },
    { id: 'animated', name: 'Animated', count: 31, style: 'animated' },
  ];

  // Preload popular libraries in background
  private readonly popularLibraries = ['material', 'lucide', 'feather'];

  constructor() {
    // Start preloading popular libraries after a short delay
    setTimeout(() => this.preloadPopularLibraries(), 1000);
    
  // Clean up old cache entries on startup
    this.clearOldCacheEntries();
    this.cleanupExpiredCache();
    
    // Set up periodic cache cleanup
    setInterval(() => {
      this.clearOldCacheEntries();
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Dynamic import functions for each library
  private async importLibrary(libraryId: string): Promise<IconItem[]> {
    try {
      switch (libraryId) {
        case 'material':
          const materialModule = await import('@/data/material-icons');
          return materialModule.materialIcons;
        
        case 'atlas':
          const atlasModule = await import('@/data/atlas-icons');
          return await atlasModule.getAtlasIcons();
        
        case 'lucide':
          const lucideModule = await import('@/data/lucide-icons');
          return await lucideModule.getLucideIcons();
        
        case 'feather':
          const featherModule = await import('@/data/feather-icons');
          return await featherModule.getFeatherIcons();
        
        case 'solar':
          const solarModule = await import('@/data/solar-icons');
          return solarModule.solarIcons;
        
        case 'phosphor':
          const phosphorModule = await import('@/data/phosphor-icons');
          return await phosphorModule.getPhosphorIcons();
        
        case 'tabler':
          const tablerModule = await import('@/data/tabler-icons');
          const tablerIcons = tablerModule.tablerIcons;
          
          // Handle both pre-processed icons (array) and runtime processing (promise)
          if (Array.isArray(tablerIcons)) {
            return tablerIcons;
          } else {
            // Runtime processing - icons are returned as a promise
            return await tablerIcons;
          }
        
        case 'bootstrap':
          const bootstrapModule = await import('@/data/bootstrap-icons');
          return await bootstrapModule.getBootstrapIcons();
        
        case 'remix':
          const remixModule = await import('@/data/remix-icons');
          return remixModule.remixIcons;
        
        case 'boxicons':
          const boxiconsModule = await import('@/data/boxicons');
          return await boxiconsModule.getBoxicons();
        
        case 'css-gg':
          const cssGgModule = await import('@/data/css-gg-icons');
          return cssGgModule.default;
        
        case 'iconsax':
          const iconsaxModule = await import('@/data/iconsax-icons');
          return iconsaxModule.iconsaxIcons;
        
        case 'line':
          const lineModule = await import('@/data/line-icons');
          return lineModule.lineIcons;
        
        case 'pixelart':
          const pixelartModule = await import('@/data/pixelart-icons');
          return pixelartModule.pixelartIcons;
        
        case 'teeny':
          const teenyModule = await import('@/data/teeny-icons');
          return teenyModule.teenyIcons;
        
        case 'ant':
          const antModule = await import('@/data/ant-icons');
          return antModule.antIcons;
        
        case 'fluent':
          const fluentModule = await import('@/data/fluent-icons');
          return fluentModule.fluentIcons;
        
        case 'iconnoir':
          const iconnoirModule = await import('@/data/iconnoir-icons');
          return await iconnoirModule.getIconnoirIcons();
        
        case 'octicons':
          const octiconsModule = await import('@/data/octicons-icons');
          return await octiconsModule.getOcticonsIcons();
        
        case 'radix':
          const radixModule = await import('@/data/radix-icons');
          return radixModule.radixIcons;
        
        case 'animated':
          const animatedModule = await import('@/data/animated-icons');
          return animatedModule.animatedIcons;
        
        default:
          throw new Error(`Unknown library: ${libraryId}`);
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
      
      // If still over quota, remove least recently used entries
      const cacheEntries: { key: string; lastAccessed: number }[] = [];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            cacheEntries.push({ key, lastAccessed: data.lastAccessed || 0 });
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
      
      // Sort by last accessed and remove oldest if we have too many entries
      cacheEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      while (cacheEntries.length > 5) { // Keep only 5 most recent libraries
        const oldest = cacheEntries.shift();
        if (oldest) {
          localStorage.removeItem(oldest.key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear old cache entries:', error);
    }
  }

  private getFromLocalStorage(libraryId: string): CachedLibrary | null {
    try {
      const data = localStorage.getItem(CACHE_KEY_PREFIX + libraryId);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Clean up corrupted data
      localStorage.removeItem(CACHE_KEY_PREFIX + libraryId);
      return null;
    }
  }

  private cleanupExpiredCache() {
    // Clean localStorage
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

    // Clean memory cache
    for (const [key, cached] of this.cache) {
      if (this.isCacheExpired(cached)) {
        this.cache.delete(key);
      }
    }
  }

  // Search index management
  private updateSearchIndex(libraryId: string, icons: IconItem[]) {
    const indexSet = new Set<string>();
    
    for (const icon of icons) {
      // Add searchable terms
      indexSet.add(icon.name.toLowerCase());
      if (icon.category) indexSet.add(icon.category.toLowerCase());
      if (icon.tags) {
        icon.tags.forEach(tag => indexSet.add(tag.toLowerCase()));
      }
    }
    
    this.searchIndex.set(libraryId, indexSet);
  }

  getCacheStats() {
    return {
      memoryCount: this.cache.size,
      loadingCount: this.loadingPromises.size,
      indexedLibraries: this.searchIndex.size,
      totalLibraries: this.libraries.length
    };
  }

  // Cache status methods for loading optimization
  hasCachedLibrary(libraryId: string): boolean {
    const cached = this.cache.get(libraryId);
    if (cached && !this.isCacheExpired(cached)) {
      return true;
    }

    // Check localStorage cache
    try {
      const storedCache = localStorage.getItem(CACHE_KEY_PREFIX + libraryId);
      if (!storedCache) return false;
      
      const parsed = JSON.parse(storedCache);
      const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
      return !isExpired && parsed.icons && parsed.icons.length > 0;
    } catch {
      return false;
    }
  }

  hasPriorityLibraryCache(): boolean {
    return this.hasCachedLibrary('tabler');
  }

  getCacheStatus(): { [libraryId: string]: boolean } {
    const status: { [libraryId: string]: boolean } = {};
    for (const lib of this.libraries) {
      status[lib.id] = this.hasCachedLibrary(lib.id);
    }
    return status;
  }

  getPopularLibrariesCacheStatus(): boolean {
    return this.popularLibraries.every(id => this.hasCachedLibrary(id));
  }
}

// Export singleton instance
export const iconLibraryManager = new IconLibraryManager();