import { type IconItem, type LibrarySection } from '@/types/icon';

// Lightweight metadata structure for initial load
export interface IconLibraryMetadata {
  id: string;
  name: string;
  count: number;
  style: string;
  description?: string;
}

class IconLibraryManager {

  // Library metadata
  public readonly libraries: IconLibraryMetadata[] = [
    { id: 'tabler', name: 'Tabler', count: 4964, style: 'outline', description: 'Free SVG icons for web development' },
    { id: 'feather', name: 'Feather', count: 287, style: 'outline', description: 'Simply beautiful open source icons' },
    { id: 'solar', name: 'Solar', count: 1241, style: 'outline', description: 'Beautiful outline icons with consistent style' },
    { id: 'phosphor', name: 'Phosphor', count: 9072, style: 'mixed', description: 'A flexible icon family with multiple weights' },
      { id: 'bootstrap', name: 'Bootstrap', count: 2078, style: 'mixed', description: 'Official open source SVG icon library for Bootstrap' },
      { id: 'iconsax', name: 'Iconsax', count: 943, style: 'twotone', description: 'Modern twotone icons with distinctive design and depth' },
      { id: 'radix', name: 'Radix', count: 318, style: 'outline', description: 'A crisp set of 15×15 icons designed by the Workos team' },
      { id: 'line', name: 'Line', count: 606, style: 'outline', description: 'Clean and minimal outline icons' },
      { id: 'pixelart', name: 'Pixel Art', count: 486, style: 'pixel', description: 'Retro pixel art icons with distinctive 8-bit aesthetic' },
      { id: 'hugeicon', name: 'Huge Icons', count: 4497, style: 'outline', description: 'Comprehensive outline icon library with extensive coverage' },
      { id: 'mingcute', name: 'Mingcute', count: 3102, style: 'mixed', description: 'Carefully crafted icon library with consistent design language' },
      { id: 'heroicons', name: 'Heroicons', count: 648, style: 'mixed', description: 'Beautiful hand-crafted SVG icons by the makers of Tailwind CSS' },
      { id: 'material', name: 'Material Design', count: 7447, style: 'outline', description: 'Google\'s comprehensive Material Design icon system' },
      { id: 'fluent-ui', name: 'Fluent UI', count: 4780, style: 'mixed', description: 'Microsoft\'s modern design system icons' },
      { id: 'lucide', name: 'Lucide', count: 1632, style: 'outline', description: 'Simply beautiful open source icons' },
      { id: 'carbon', name: 'Carbon', count: 2510, style: 'mixed', description: 'IBM\'s comprehensive design system icons' },
      { id: 'iconamoon', name: 'Iconamoon', count: 608, style: 'outline', description: 'Modern outline icons with consistent design language' },
      { id: 'iconoir', name: 'Iconoir', count: 1383, style: 'mixed', description: 'Beautiful open source icons with clean design' },
      { id: 'majesticon', name: 'Majesticon', count: 760, style: 'outline', description: 'Professional outline icons with clean, consistent design' },
      { id: 'simple', name: 'Brand', count: 3355, style: 'brand', description: 'Popular brand and company logos as beautiful SVG icons' },
      { id: 'octicons', name: 'Octicons', count: 661, style: 'outline', description: 'GitHub\'s official icon library with clean, consistent design' }
  ];

  constructor() {
    // No cache setup needed
  }

  // Dynamic import library
  private async importLibrary(libraryId: string): Promise<IconItem[]> {
    console.log(`🔍 Importing library: ${libraryId}`);
    
    
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
    
    if (libraryId === 'solar') {
      const { solarIcons } = await import('@/data/solar');
      console.log(`✅ Solar icons imported: ${solarIcons.length} icons`);
      return solarIcons;
    }
    
    if (libraryId === 'phosphor') {
      const { phosphorIcons } = await import('@/data/phosphor');
      console.log(`✅ Phosphor icons imported: ${phosphorIcons.length} icons`);
      return phosphorIcons;
    }
    
    if (libraryId === 'bootstrap') {
      const { bootstrapIcons } = await import('@/data/bootstrap');
      console.log(`✅ Bootstrap icons imported: ${bootstrapIcons.length} icons`);
      return bootstrapIcons;
    }
    
    if (libraryId === 'radix') {
      const { radixIcons } = await import('@/data/radix');
      console.log(`✅ Radix icons imported: ${radixIcons.length} icons`);
      return radixIcons;
    }
    
    if (libraryId === 'line') {
      const { lineIcons } = await import('@/data/line');
      console.log(`✅ Line icons imported: ${lineIcons.length} icons`);
      return lineIcons;
    }
    
    if (libraryId === 'pixelart') {
      const { pixelartIcons } = await import('@/data/pixelart');
      console.log(`✅ Pixel Art icons imported: ${pixelartIcons.length} icons`);
      return pixelartIcons;
    }
    
    if (libraryId === 'hugeicon') {
      const { hugeiconIcons } = await import('@/data/hugeicon');
      console.log(`✅ Huge Icons imported: ${hugeiconIcons.length} icons`);
      return hugeiconIcons;
    }
    
    if (libraryId === 'mingcute') {
      const { mingcuteIcons } = await import('@/data/mingcute');
      console.log(`✅ Mingcute icons imported: ${mingcuteIcons.length} icons`);
      return mingcuteIcons;
    }
    
    if (libraryId === 'heroicons') {
      const { heroiconsIcons } = await import('@/data/heroicons');
      console.log(`✅ Heroicons imported: ${heroiconsIcons.length} icons`);
      return heroiconsIcons;
    }
    
    if (libraryId === 'material') {
      const { materialIcons } = await import('@/data/material');
      console.log(`✅ Material Design icons imported: ${materialIcons.length} icons`);
      return materialIcons;
    }
    
    if (libraryId === 'fluent-ui') {
      const { fluentUiIcons } = await import('@/data/fluent-ui');
      console.log(`✅ Fluent UI icons imported: ${fluentUiIcons.length} icons`);
      return fluentUiIcons;
    }
    
    if (libraryId === 'lucide') {
      const { lucideIcons } = await import('@/data/lucide');
      console.log(`✅ Lucide icons imported: ${lucideIcons.length} icons`);
      return lucideIcons;
    }
    
    if (libraryId === 'carbon') {
      const { carbonIcons } = await import('@/data/carbon');
      console.log(`✅ Carbon icons imported: ${carbonIcons.length} icons`);
      return carbonIcons;
    }
    
    if (libraryId === 'iconamoon') {
      const { iconamoonIcons } = await import('@/data/iconamoon');
      console.log(`✅ Iconamoon icons imported: ${iconamoonIcons.length} icons`);
      return iconamoonIcons;
    }
    
    if (libraryId === 'iconoir') {
      const { iconoirIcons } = await import('@/data/iconoir');
      console.log(`✅ Iconoir icons imported: ${iconoirIcons.length} icons`);
      return iconoirIcons;
    }
    
    if (libraryId === 'majesticon') {
      const { majesticonIcons } = await import('@/data/majesticon');
      console.log(`✅ Majesticon icons imported: ${majesticonIcons.length} icons`);
      return majesticonIcons;
    }
    
    if (libraryId === 'simple') {
      const { simpleIcons } = await import('@/data/simple');
      console.log(`✅ Simple Icons imported: ${simpleIcons.length} icons`);
      return simpleIcons;
    }
    
    if (libraryId === 'octicons') {
      const { octiconsIcons } = await import('@/data/octicons');
      console.log(`✅ Octicons imported: ${octiconsIcons.length} icons`);
      return octiconsIcons;
    }
    
    if (libraryId === 'iconsax') {
      const { iconsaxIcons } = await import('@/data/iconsax');
      console.log(`✅ Iconsax imported: ${iconsaxIcons.length} icons`);
      return iconsaxIcons;
    }
    
    console.warn(`Library ${libraryId} is not supported`);
    return [];
  }

  // Load library - always fresh, no caching
  async loadLibrary(libraryId: string): Promise<IconItem[]> {
    console.log(`🔍 Loading library: ${libraryId}`);
    
    // Import the raw library
    const rawIcons = await this.importLibrary(libraryId);
    
    console.log(`📊 Import result for ${libraryId}:`, rawIcons?.length || 0, 'icons');
    
    // Ensure strict library filtering
    return this.filterIconsByLibraryId(rawIcons, libraryId);
  }

  // Load library in batches - returns initial batch immediately
  async loadLibraryProgressive(libraryId: string, initialBatchSize: number = 100): Promise<{
    initialBatch: IconItem[];
    loadRemaining: () => Promise<IconItem[]>;
  }> {
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
      // Extract library ID from icon ID, handling hyphenated library names
      let iconLibraryId: string;
      
      // Special handling for hyphenated library names
      if (libraryId.includes('-')) {
        // For libraries like 'fluent-ui', check if icon ID starts with the full library ID
        iconLibraryId = icon.id.startsWith(libraryId + '-') ? libraryId : icon.id.split('-')[0];
      } else {
        // For single-word libraries, use the first part
        iconLibraryId = icon.id.split('-')[0];
      }
      
      const isValidIcon = iconLibraryId === libraryId;
      
      if (!isValidIcon) {
        console.warn(`❌ Filtered out cross-contaminated icon: ${icon.id} from library ${libraryId} (expected: ${libraryId}, got: ${iconLibraryId})`);
      }
      
      return isValidIcon;
    });
    
    console.log(`✅ Filtered result: ${filtered.length} icons for library: ${libraryId}`);
    return filtered;
  }

}

// Singleton instance
export const iconLibraryManager = new IconLibraryManager();