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

  // Get popular icons across all libraries (1000 total) organized by library
  async getPopularIconsGrouped(): Promise<LibrarySection[]> {
    const popularIconsPerLibrary = {
      'material': ['home', 'menu', 'search', 'person', 'settings', 'favorite', 'share', 'edit', 'delete', 'add', 'remove', 'check', 'close', 'arrow_back', 'arrow_forward', 'expand_more', 'expand_less', 'star', 'notifications', 'email', 'phone', 'location_on', 'calendar_today', 'shopping_cart', 'account_circle', 'visibility', 'visibility_off', 'lock', 'unlock', 'download', 'upload', 'print', 'save', 'copy', 'cut', 'paste', 'undo', 'redo', 'refresh', 'sync', 'help', 'info', 'warning', 'error', 'done', 'cancel', 'launch', 'open_in_new', 'fullscreen', 'fullscreen_exit', 'zoom_in', 'zoom_out', 'filter_list', 'sort', 'view_list', 'view_module', 'view_carousel', 'grid_view', 'dashboard', 'analytics', 'timeline', 'history', 'bookmark', 'bookmarks', 'label', 'local_offer', 'shopping_bag', 'payment', 'credit_card', 'attach_money', 'trending_up', 'trending_down', 'bar_chart', 'pie_chart', 'donut_large', 'assessment', 'insert_chart', 'show_chart', 'multiline_chart', 'scatter_plot', 'bubble_chart', 'table_chart', 'functions', 'code', 'computer', 'laptop', 'tablet', 'smartphone', 'watch', 'tv', 'speaker', 'headset', 'mic', 'camera', 'photo_camera', 'videocam', 'movie', 'music_note', 'volume_up', 'volume_down', 'volume_off', 'play_arrow', 'pause', 'stop', 'skip_previous', 'skip_next', 'replay', 'shuffle', 'repeat', 'repeat_one', 'forward_10', 'replay_10', 'speed', 'slow_motion_video', 'hd', 'sd', 'fiber_dvr', 'live_tv', 'radio', 'podcast', 'library_music', 'library_books', 'auto_stories', 'menu_book', 'import_contacts', 'chrome_reader_mode', 'article', 'description', 'subject', 'title', 'format_bold', 'format_italic', 'format_underlined', 'format_color_fill', 'format_color_text', 'format_size', 'text_fields', 'font_download', 'format_align_left', 'format_align_center', 'format_align_right', 'format_align_justify', 'format_list_bulleted', 'format_list_numbered', 'format_indent_increase', 'format_indent_decrease', 'format_quote', 'link', 'link_off', 'insert_link', 'attachment', 'insert_drive_file', 'folder', 'folder_open', 'create_new_folder', 'drive_folder_upload', 'cloud', 'cloud_upload', 'cloud_download', 'cloud_done', 'cloud_off', 'backup', 'restore', 'file_copy', 'file_present', 'picture_as_pdf', 'image', 'collections', 'photo_library', 'video_library', 'movie_creation', 'music_video', 'playlist_add', 'queue_music', 'library_add', 'create_playlist'],
      'tabler': ['home', 'menu-2', 'search', 'user', 'settings', 'heart', 'share', 'edit', 'trash', 'plus', 'minus', 'check', 'x', 'arrow-left', 'arrow-right', 'chevron-down', 'chevron-up', 'star', 'bell', 'mail', 'phone', 'map-pin', 'calendar', 'shopping-cart', 'user-circle', 'eye', 'eye-off', 'lock', 'lock-open', 'download', 'upload', 'printer', 'device-floppy', 'copy', 'cut', 'clipboard', 'arrow-back-up', 'rotate-clockwise', 'refresh', 'sync', 'help', 'info-circle', 'alert-triangle', 'alert-circle', 'circle-check', 'circle-x', 'external-link', 'maximize', 'minimize', 'zoom-in', 'zoom-out', 'filter', 'sort-ascending', 'list', 'grid-dots', 'carousel-horizontal', 'dashboard', 'chart-line', 'timeline', 'history', 'bookmark', 'bookmarks', 'tag', 'discount', 'shopping-bag', 'credit-card', 'currency-dollar', 'trending-up', 'trending-down', 'chart-bar', 'chart-pie', 'chart-donut', 'report-analytics', 'chart-area', 'chart-dots', 'table', 'function', 'code', 'device-desktop', 'device-laptop', 'device-tablet', 'device-mobile', 'device-watch', 'device-tv', 'speakerphone', 'headphones', 'microphone', 'camera', 'photo', 'video', 'movie', 'music', 'volume', 'volume-2', 'volume-x', 'player-play', 'player-pause', 'player-stop', 'player-skip-back', 'player-skip-forward', 'repeat', 'repeat-once', 'shuffle', 'rewind', 'fast-forward', 'brand-youtube', 'brand-spotify', 'books', 'book', 'notebook', 'article', 'file-text', 'pencil', 'typography', 'palette', 'color-picker', 'font', 'text-size', 'align-left', 'align-center', 'align-right', 'align-justified', 'list-details', 'list-numbers', 'indent-increase', 'indent-decrease', 'quote', 'link', 'unlink', 'paperclip', 'file', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-upload', 'cloud-download', 'database', 'server', 'api', 'webhook', 'git-branch', 'git-commit', 'git-pull-request', 'brand-github', 'brand-gitlab'],
      'lucide': ['home', 'menu', 'search', 'user', 'settings', 'heart', 'share-2', 'edit', 'trash-2', 'plus', 'minus', 'check', 'x', 'arrow-left', 'arrow-right', 'chevron-down', 'chevron-up', 'star', 'bell', 'mail', 'phone', 'map-pin', 'calendar', 'shopping-cart', 'user-circle', 'eye', 'eye-off', 'lock', 'unlock', 'download', 'upload', 'printer', 'save', 'copy', 'scissors', 'clipboard', 'undo', 'redo', 'refresh-cw', 'sync', 'help-circle', 'info', 'alert-triangle', 'alert-circle', 'check-circle', 'x-circle', 'external-link', 'maximize', 'minimize', 'zoom-in', 'zoom-out', 'filter', 'sort-asc', 'list', 'grid', 'layout-grid', 'layout-dashboard', 'trending-up', 'trending-down', 'bar-chart', 'pie-chart', 'activity', 'clock', 'bookmark', 'tag', 'shopping-bag', 'credit-card', 'dollar-sign', 'monitor', 'laptop', 'tablet', 'smartphone', 'watch', 'tv', 'speaker', 'headphones', 'mic', 'camera', 'image', 'video', 'film', 'music', 'volume-2', 'volume-1', 'volume-x', 'play', 'pause', 'square', 'skip-back', 'skip-forward', 'repeat', 'shuffle', 'rewind', 'fast-forward', 'book-open', 'book', 'file-text', 'edit-3', 'type', 'palette', 'paintbrush', 'align-left', 'align-center', 'align-right', 'align-justify', 'list-ordered', 'indent', 'outdent', 'quote', 'link', 'link-2', 'paperclip', 'file', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-upload', 'cloud-download', 'database', 'server', 'code', 'terminal', 'git-branch', 'git-commit', 'git-pull-request', 'github'],
      'phosphor': ['house', 'list', 'magnifying-glass', 'user', 'gear', 'heart', 'share-network', 'pencil', 'trash', 'plus', 'minus', 'check', 'x', 'arrow-left', 'arrow-right', 'caret-down', 'caret-up', 'star', 'bell', 'envelope', 'phone', 'map-pin', 'calendar', 'shopping-cart', 'user-circle', 'eye', 'eye-slash', 'lock', 'lock-open', 'download-simple', 'upload-simple', 'printer', 'floppy-disk', 'copy', 'scissors', 'clipboard', 'arrow-counter-clockwise', 'arrow-clockwise', 'arrows-clockwise', 'arrows-counter-clockwise', 'question', 'info', 'warning', 'warning-circle', 'check-circle', 'x-circle', 'arrow-square-out', 'arrows-out', 'arrows-in', 'magnifying-glass-plus', 'magnifying-glass-minus', 'funnel', 'sort-ascending', 'list-bullets', 'grid-four', 'squares-four', 'chart-line', 'chart-bar', 'chart-pie-slice', 'chart-donut', 'activity', 'clock', 'bookmark-simple', 'tag', 'handbag', 'credit-card', 'currency-dollar', 'desktop', 'laptop', 'tablet', 'device-mobile', 'watch', 'television', 'speaker-high', 'headphones', 'microphone', 'camera', 'image', 'video-camera', 'film-strip', 'music-note', 'speaker-high', 'speaker-low', 'speaker-none', 'play', 'pause', 'stop', 'skip-back', 'skip-forward', 'repeat', 'shuffle', 'rewind', 'fast-forward', 'book-open', 'book', 'article', 'note-pencil', 'text-aa', 'paint-brush', 'text-align-left', 'text-align-center', 'text-align-right', 'text-align-justify', 'list-numbers', 'text-indent', 'text-outdent', 'quotes', 'link', 'link-break', 'paperclip', 'file', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-arrow-up', 'cloud-arrow-down', 'database', 'server', 'code', 'terminal-window', 'git-branch', 'git-commit', 'git-pull-request'],
      'heroicons': ['home', 'bars-3', 'magnifying-glass', 'user', 'cog-6-tooth', 'heart', 'share', 'pencil', 'trash', 'plus', 'minus', 'check', 'x-mark', 'arrow-left', 'arrow-right', 'chevron-down', 'chevron-up', 'star', 'bell', 'envelope', 'phone', 'map-pin', 'calendar-days', 'shopping-cart', 'user-circle', 'eye', 'eye-slash', 'lock-closed', 'lock-open', 'arrow-down-tray', 'arrow-up-tray', 'printer', 'document-arrow-down', 'clipboard', 'scissors', 'clipboard-document', 'arrow-uturn-left', 'arrow-path', 'arrow-path', 'question-mark-circle', 'information-circle', 'exclamation-triangle', 'exclamation-circle', 'check-circle', 'x-circle', 'arrow-top-right-on-square', 'arrows-pointing-out', 'arrows-pointing-in', 'magnifying-glass-plus', 'magnifying-glass-minus', 'funnel', 'bars-arrow-up', 'list-bullet', 'squares-2x2', 'view-columns', 'chart-bar', 'chart-pie', 'presentation-chart-line', 'clock', 'bookmark', 'tag', 'shopping-bag', 'credit-card', 'currency-dollar', 'computer-desktop', 'device-tablet', 'device-phone-mobile', 'tv', 'speaker-wave', 'musical-note', 'play', 'pause', 'stop', 'backward', 'forward', 'arrow-path', 'arrows-right-left', 'book-open', 'document-text', 'pencil-square', 'language', 'paint-brush', 'bold', 'italic', 'underline', 'strikethrough', 'list-bullet', 'numbered-list', 'link', 'paper-clip', 'document', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-arrow-up', 'cloud-arrow-down', 'server', 'code-bracket', 'command-line'],
      'bootstrap': ['house', 'list', 'search', 'person', 'gear', 'heart', 'share', 'pencil', 'trash', 'plus', 'dash', 'check', 'x', 'arrow-left', 'arrow-right', 'chevron-down', 'chevron-up', 'star', 'bell', 'envelope', 'telephone', 'geo-alt', 'calendar', 'cart', 'person-circle', 'eye', 'eye-slash', 'lock', 'unlock', 'download', 'upload', 'printer', 'save', 'clipboard', 'scissors', 'arrow-counterclockwise', 'arrow-clockwise', 'question-circle', 'info-circle', 'exclamation-triangle', 'exclamation-circle', 'check-circle', 'x-circle', 'box-arrow-up-right', 'arrows-fullscreen', 'zoom-in', 'zoom-out', 'funnel', 'sort-alpha-down', 'list-ul', 'grid', 'layout-three-columns', 'speedometer2', 'graph-up', 'clock', 'bookmark', 'tag', 'bag', 'credit-card', 'currency-dollar', 'display', 'laptop', 'tablet', 'phone', 'smartwatch', 'tv', 'speaker', 'headphones', 'mic', 'camera', 'image', 'camera-video', 'film', 'music-note', 'volume-up', 'volume-down', 'volume-mute', 'play', 'pause', 'stop', 'skip-backward', 'skip-forward', 'arrow-repeat', 'shuffle', 'rewind', 'fast-forward', 'book', 'journal', 'file-text', 'pencil-square', 'fonts', 'palette', 'brush', 'text-left', 'text-center', 'text-right', 'justify', 'list-ol', 'text-indent-left', 'text-indent-right', 'quote', 'link', 'paperclip', 'file-earmark', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-upload', 'cloud-download', 'server', 'code', 'terminal', 'git', 'github'],
      'iconoir': ['home', 'menu', 'search', 'user', 'settings', 'heart', 'share', 'edit', 'trash', 'plus', 'minus', 'check', 'xmark', 'arrow-left', 'arrow-right', 'nav-arrow-down', 'nav-arrow-up', 'star', 'bell', 'mail', 'phone', 'pin-alt', 'calendar', 'shopping-bag', 'user-circle', 'eye', 'eye-off', 'lock', 'unlock', 'download', 'upload', 'printer', 'save-floppy-disk', 'copy', 'scissors', 'clipboard', 'undo', 'redo', 'refresh-double', 'refresh', 'help-circle', 'info-circle', 'warning-triangle', 'warning-circle', 'check-circle', 'cancel-circle', 'open-in-window', 'expand', 'compress', 'zoom-in', 'zoom-out', 'filter', 'sort', 'list', 'view-grid', 'view-columns-3', 'dashboard-dots', 'trending-up', 'trending-down', 'stats-up', 'pie-chart', 'activity', 'clock', 'bookmark', 'tag', 'handbag', 'credit-card', 'dollar', 'computer', 'laptop', 'tablet', 'smartphone', 'apple-watch', 'tv', 'voice', 'headphones', 'microphone', 'camera', 'media-image', 'video-camera', 'movie', 'music-note', 'sound-high', 'sound-low', 'sound-off', 'play', 'pause', 'stop', 'skip-prev', 'skip-next', 'repeat', 'shuffle', 'rewind', 'fast-forward', 'book', 'notebook', 'page', 'edit-pencil', 'text', 'color-picker', 'brush', 'text-align-left', 'text-align-center', 'text-align-right', 'text-align-justify', 'list-select', 'text-box', 'text-box-plus', 'quote-message', 'link', 'attachment', 'folder', 'folder-open', 'add-folder', 'cloud', 'cloud-upload', 'cloud-download', 'server', 'code', 'terminal', 'git-fork', 'git-commit', 'git-merge', 'github'],
      'octicons': ['home', 'three-bars', 'search', 'person', 'gear', 'heart', 'share', 'pencil', 'trash', 'plus', 'dash', 'check', 'x', 'arrow-left', 'arrow-right', 'chevron-down', 'chevron-up', 'star', 'bell', 'mail', 'device-mobile', 'location', 'calendar', 'package', 'person-fill', 'eye', 'eye-closed', 'lock', 'unlock', 'download', 'upload', 'image', 'file', 'copy', 'paste', 'arrow-switch', 'sync', 'question', 'info', 'alert', 'stop', 'check-circle', 'x-circle', 'link-external', 'screen-full', 'zoom-in', 'zoom-out', 'filter', 'sort-asc', 'list-unordered', 'apps', 'columns', 'graph', 'clock', 'bookmark', 'tag', 'credit-card', 'desktop-download', 'device-desktop', 'dependabot', 'browser', 'device-camera', 'play', 'square-fill', 'skip-16', 'mute', 'unmute', 'book', 'note', 'markdown', 'bold', 'italic', 'quote', 'link', 'paperclip', 'file-directory', 'file-directory-open-fill', 'cloud', 'cloud-upload', 'cloud-download', 'server', 'code', 'terminal', 'git-branch', 'git-commit', 'git-pull-request', 'mark-github'],
      'solar': ['home', 'hamburger-menu', 'magnifer', 'user', 'settings', 'heart', 'share', 'pen', 'trash-bin-minimalistic', 'add-circle', 'minus-circle', 'check-circle', 'close-circle', 'arrow-left', 'arrow-right', 'arrow-down', 'arrow-up', 'star', 'bell', 'letter', 'phone', 'map-point', 'calendar', 'bag', 'user-circle', 'eye', 'eye-closed', 'lock', 'lock-unlocked', 'download', 'upload', 'printer', 'diskette', 'copy', 'scissors', 'clipboard', 'restart', 'refresh', 'question-circle', 'info-circle', 'danger-triangle', 'danger-circle', 'check-circle', 'close-circle', 'square-top-down', 'maximize', 'minimize', 'magnifer-zoom-in', 'magnifer-zoom-out', 'filter', 'sort-vertical', 'list', 'widget', 'widget-2', 'chart', 'chart-2', 'pie-chart', 'pulse', 'clock-circle', 'bookmark', 'tag-horizontal', 'bag-2', 'card', 'dollar', 'monitor', 'laptop', 'tablet', 'smartphone', 'smartwatch', 'tv', 'speaker', 'headphones', 'microphone', 'camera', 'gallery', 'video-camera', 'clapperboard', 'music-note', 'volume-loud', 'volume-small', 'volume-cross', 'play', 'pause', 'stop', 'previous', 'next', 'repeat', 'shuffle', 'rewind-back', 'rewind-forward', 'book', 'notebook', 'document-text', 'pen-new-square', 'text', 'palette', 'brush', 'text-field', 'text-field-focus', 'list-arrow-down', 'text-italic', 'quote-down', 'link', 'paperclip', 'folder', 'folder-open', 'folder-plus', 'cloud', 'cloud-upload', 'cloud-download', 'server', 'code', 'terminal', 'branch', 'commit', 'pull-request'],
      'mingcute': ['home', 'menu', 'search', 'user', 'settings', 'heart', 'share', 'edit', 'delete', 'add', 'minus', 'check', 'close', 'left', 'right', 'down', 'up', 'star', 'notification', 'mail', 'phone', 'location', 'calendar', 'shopping-bag', 'user-circle', 'eye', 'eye-close', 'lock', 'unlock', 'download', 'upload', 'print', 'save', 'copy', 'cut', 'paste', 'undo', 'redo', 'refresh', 'sync', 'question', 'information', 'alert', 'error', 'check-circle', 'close-circle', 'external-link', 'fullscreen', 'minimize', 'zoom-in', 'zoom-out', 'filter', 'sort-ascending', 'list', 'grid', 'layout', 'dashboard', 'chart-line', 'chart-bar', 'chart-pie', 'pulse', 'time', 'bookmark', 'tag', 'shopping-cart', 'credit-card', 'currency-dollar', 'computer', 'laptop', 'tablet', 'smartphone', 'watch', 'tv', 'volume', 'headphone', 'mic', 'camera', 'pic', 'video', 'movie', 'music', 'volume-up', 'volume-down', 'volume-off', 'play', 'pause', 'stop', 'skip-backward', 'skip-forward', 'repeat', 'shuffle', 'rewind', 'fast-forward', 'book', 'notebook', 'file-text', 'pencil', 'text', 'palette', 'brush', 'align-left', 'align-center', 'align-right', 'align-justify', 'list-ordered', 'indent-increase', 'indent-decrease', 'quote', 'link', 'attachment', 'folder', 'folder-open', 'folder-add', 'cloud', 'cloud-up', 'cloud-down', 'server', 'code', 'terminal', 'git-branch', 'git-commit', 'git-pull-request', 'github']
    };

    const sections: LibrarySection[] = [];
    
    // Load each library and get popular icons
    for (const [libraryId, iconNames] of Object.entries(popularIconsPerLibrary)) {
      try {
        const libraryIcons = await this.loadLibrary(libraryId);
        const libraryMetadata = this.libraries.find(lib => lib.id === libraryId);
        
        // First try exact matches, then fallback to any available icons
        let popularFromLibrary = iconNames.map(iconName => {
          return libraryIcons.find(icon => 
            icon.name.toLowerCase() === iconName.toLowerCase() ||
            icon.id.toLowerCase() === iconName.toLowerCase() ||
            icon.id.toLowerCase().includes(iconName.toLowerCase()) ||
            icon.name.toLowerCase().includes(iconName.toLowerCase())
          );
        }).filter(Boolean) as IconItem[];
        
        // If we didn't find enough icons with our predefined list, 
        // fill up to 100 with the first available icons from the library
        if (popularFromLibrary.length < 100) {
          const remainingCount = 100 - popularFromLibrary.length;
          const usedIds = new Set(popularFromLibrary.map(icon => icon.id));
          const additionalIcons = libraryIcons
            .filter(icon => !usedIds.has(icon.id))
            .slice(0, remainingCount);
          popularFromLibrary.push(...additionalIcons);
        }
        
        // Only include if we have icons
        if (popularFromLibrary.length > 0) {
          sections.push({
            libraryId: libraryId,
            libraryName: libraryMetadata?.name || libraryId,
            icons: popularFromLibrary.slice(0, 100) // Ensure max 100 per library
          });
        }
        
        console.log(`Loaded ${popularFromLibrary.length} icons from ${libraryId}`);
      } catch (error) {
        console.warn(`Failed to load popular icons from ${libraryId}:`, error);
      }
    }
    
    return sections;
  }

  // Legacy method for backwards compatibility
  async getPopularIcons(): Promise<IconItem[]> {
    const sections = await this.getPopularIconsGrouped();
    return sections.flatMap(section => section.icons);
  }
}

export const iconLibraryManager = new IconLibraryManager();