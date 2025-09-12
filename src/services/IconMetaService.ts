import { type IconItem } from '@/types/icon';
import { type IconLibraryMetadata } from '@/services/IconLibraryManager';

export interface EnhancedIconMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

export class IconMetaService {
  private static readonly BASE_KEYWORDS = [
    'free svg icons', 'web design icons', 'ui icons', 'vector icons', 
    'open source icons', 'customizable icons', 'download svg', 'icon library'
  ];

  private static readonly STYLE_DESCRIPTIONS: Record<string, string> = {
    'outline': 'clean outline style with crisp lines',
    'solid': 'filled solid design with bold presence',
    'twotone': 'modern dual-tone style with depth and dimension',
    'linear': 'sleek linear design with consistent stroke weight',
    'duotone': 'stylish dual-color design with visual hierarchy',
    'bold': 'strong bold weight for maximum impact',
    'broken': 'unique broken line style with distinctive gaps',
    'micro': 'ultra-small micro icons for compact layouts',
    'mini': 'small-scale mini icons optimized for tiny spaces',
    'mixed': 'versatile design available in multiple styles',
    'pixel': 'retro pixel art style with 8-bit aesthetic',
    'brand': 'official brand logo with authentic design'
  };

  private static readonly LIBRARY_DESCRIPTIONS: Record<string, string> = {
    'tabler': 'professional outline icons perfect for web development and UI design',
    'feather': 'beautifully crafted open source icons with elegant simplicity',
    'solar': 'modern outline icons with consistent design language and visual harmony',
    'phosphor': 'flexible icon family offering multiple weights and styles for any project',
    'bootstrap': 'official Bootstrap SVG icons trusted by millions of developers worldwide',
    'iconsax': 'contemporary twotone icons featuring distinctive depth and modern aesthetics',
    'radix': 'pixel-perfect 15×15 icons designed with precision by the Workos team',
    'line': 'minimalist outline icons with clean lines and consistent stroke width',
    'pixelart': 'nostalgic pixel art icons bringing retro 8-bit charm to modern designs',
    'hugeicon': 'comprehensive outline icon collection with extensive symbol coverage',
    'mingcute': 'carefully crafted icons with thoughtful design language and attention to detail',
    'heroicons': 'hand-crafted SVG icons by Tailwind CSS creators, optimized for web interfaces',
    'material': 'Google\'s comprehensive Material Design icons following design system principles',
    'fluent-ui': 'Microsoft\'s modern Fluent Design icons for contemporary applications',
    'lucide': 'beautiful open source icons with crystal-clear design and perfect scalability',
    'carbon': 'IBM\'s professional design system icons for enterprise applications',
    'iconamoon': 'modern outline icons with consistent visual language and clean aesthetics',
    'iconoir': 'elegant open source icons with refined design and optimal clarity',
    'majesticon': 'professional outline icons featuring clean, consistent design principles',
    'simple': 'authentic brand logos and company icons in beautiful SVG format',
    'octicons': 'GitHub\'s official icon library with clean, developer-friendly design'
  };

  private static readonly USE_CASE_SUGGESTIONS: Record<string, string[]> = {
    // Navigation & Interface
    'home': ['homepage links', 'navigation menus', 'dashboard interfaces'],
    'menu': ['mobile navigation', 'dropdown menus', 'hamburger buttons'],
    'search': ['search bars', 'filter interfaces', 'discovery features'],
    'settings': ['configuration panels', 'user preferences', 'admin interfaces'],
    'profile': ['user accounts', 'avatar placeholders', 'personal sections'],
    
    // Actions & Controls
    'edit': ['content editing', 'form controls', 'admin panels'],
    'delete': ['removal actions', 'trash functions', 'cleanup interfaces'],
    'save': ['form submissions', 'data persistence', 'backup features'],
    'download': ['file downloads', 'export functions', 'content sharing'],
    'upload': ['file uploads', 'content creation', 'media management'],
    
    // Communication
    'mail': ['email interfaces', 'contact forms', 'messaging apps'],
    'message': ['chat applications', 'notification systems', 'communication tools'],
    'phone': ['contact information', 'call-to-action buttons', 'support sections'],
    'notification': ['alert systems', 'status updates', 'user feedback'],
    
    // Media & Content
    'image': ['photo galleries', 'media uploads', 'visual content'],
    'video': ['video players', 'streaming interfaces', 'media controls'],
    'music': ['audio players', 'music apps', 'sound controls'],
    'file': ['document management', 'file browsers', 'storage interfaces'],
    
    // Business & Commerce
    'cart': ['e-commerce checkout', 'shopping interfaces', 'retail apps'],
    'payment': ['checkout processes', 'billing interfaces', 'financial apps'],
    'money': ['pricing displays', 'financial dashboards', 'payment forms'],
    'calendar': ['scheduling apps', 'event management', 'booking systems'],
    
    // Social & Sharing
    'share': ['social sharing', 'content distribution', 'viral features'],
    'like': ['engagement buttons', 'social interactions', 'feedback systems'],
    'heart': ['favorite features', 'wishlist buttons', 'engagement actions'],
    'star': ['rating systems', 'review interfaces', 'quality indicators']
  };

  static generateEnhancedMeta(
    icon: IconItem, 
    library: IconLibraryMetadata, 
    libraryId: string
  ): EnhancedIconMeta {
    const iconName = icon.name;
    const libraryName = library.name;
    const style = icon.style || library.style;
    
    // Enhanced title with style and format information
    const title = this.generateTitle(iconName, libraryName, style);
    
    // Rich description with context and use cases
    const description = this.generateDescription(icon, library, libraryId);
    
    // Comprehensive keywords
    const keywords = this.generateKeywords(icon, library, libraryId);
    
    // Social media optimized versions
    const ogTitle = this.generateOGTitle(iconName, libraryName, style);
    const ogDescription = this.generateOGDescription(icon, library);
    
    return {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      twitterTitle: ogTitle,
      twitterDescription: ogDescription
    };
  }

  private static generateTitle(iconName: string, libraryName: string, style: string): string {
    const styleText = style && style !== 'mixed' ? ` (${this.capitalizeFirst(style)})` : '';
    return `${iconName} Icon${styleText} - Free SVG from ${libraryName} | IconStack`;
  }

  private static generateDescription(icon: IconItem, library: IconLibraryMetadata, libraryId: string): string {
    const iconName = icon.name;
    const libraryName = library.name;
    const style = icon.style || library.style;
    const styleDesc = this.STYLE_DESCRIPTIONS[style.toLowerCase()] || `${style} style`;
    const libraryDesc = this.LIBRARY_DESCRIPTIONS[libraryId] || `${libraryName} icon collection`;
    
    // Generate use case suggestions
    const useCases = this.generateUseCases(icon);
    const useCaseText = useCases.length > 0 ? ` Perfect for ${useCases.slice(0, 3).join(', ')}.` : '';
    
    // Build comprehensive description
    let description = `Download ${iconName} icon from ${libraryName} library. `;
    description += `Features ${styleDesc} design. `;
    description += `Free SVG icon from ${libraryDesc}. `;
    description += `Customizable colors and stroke width.`;
    description += useCaseText;
    description += ` Part of ${library.count.toLocaleString()} high-quality icons.`;

    // Ensure description stays under 160 characters for meta description
    if (description.length > 160) {
      const shortDesc = `Download ${iconName} ${style} icon from ${libraryName}. `;
      const remaining = 160 - shortDesc.length - 30; // Leave room for ending
      const truncated = shortDesc + description.substring(shortDesc.length, shortDesc.length + remaining);
      description = truncated + ' Free SVG with customization.';
    }

    return description;
  }

  private static generateKeywords(icon: IconItem, library: IconLibraryMetadata, libraryId: string): string {
    const keywords = new Set<string>();
    
    // Core icon keywords
    keywords.add(icon.name.toLowerCase());
    keywords.add(`${icon.name.toLowerCase()} icon`);
    keywords.add(`${icon.name.toLowerCase()} svg`);
    
    // Library keywords
    keywords.add(libraryId);
    keywords.add(library.name.toLowerCase());
    keywords.add(`${libraryId} icons`);
    
    // Style keywords
    const style = icon.style || library.style;
    if (style && style !== 'mixed') {
      keywords.add(`${style} icon`);
      keywords.add(`${style} svg`);
    }
    
    // Category and tags
    if (icon.category) {
      keywords.add(icon.category.toLowerCase());
      keywords.add(`${icon.category.toLowerCase()} icons`);
    }
    
    if (icon.tags) {
      icon.tags.forEach(tag => {
        keywords.add(tag.toLowerCase());
        keywords.add(`${tag.toLowerCase()} icon`);
      });
    }
    
    // Use case keywords
    const useCases = this.generateUseCases(icon);
    useCases.forEach(useCase => keywords.add(useCase));
    
    // Base keywords
    this.BASE_KEYWORDS.forEach(keyword => keywords.add(keyword));
    
    // Convert to comma-separated string
    return Array.from(keywords).slice(0, 25).join(', '); // Limit to 25 keywords
  }

  private static generateOGTitle(iconName: string, libraryName: string, style: string): string {
    const styleText = style && style !== 'mixed' ? ` ${this.capitalizeFirst(style)}` : '';
    return `${iconName}${styleText} Icon | ${libraryName} | IconStack`;
  }

  private static generateOGDescription(icon: IconItem, library: IconLibraryMetadata): string {
    const useCases = this.generateUseCases(icon);
    const useCaseText = useCases.length > 0 ? ` Ideal for ${useCases.slice(0, 2).join(' and ')}.` : '';
    
    return `Free ${icon.name} SVG icon from ${library.name}.${useCaseText} Download and customize with colors and stroke width. Part of ${library.count.toLocaleString()} professional icons.`;
  }

  private static generateUseCases(icon: IconItem): string[] {
    const iconName = icon.name.toLowerCase();
    const tags = icon.tags?.map(tag => tag.toLowerCase()) || [];
    const category = icon.category?.toLowerCase() || '';
    
    const useCases = new Set<string>();
    
    // Check icon name against use case suggestions
    Object.entries(this.USE_CASE_SUGGESTIONS).forEach(([keyword, cases]) => {
      if (iconName.includes(keyword) || tags.includes(keyword) || category.includes(keyword)) {
        cases.forEach(useCase => useCases.add(useCase));
      }
    });
    
    // Fallback use cases based on common patterns
    if (useCases.size === 0) {
      if (tags.includes('navigation') || iconName.includes('nav')) {
        useCases.add('website navigation');
        useCases.add('mobile apps');
      } else if (tags.includes('interface') || tags.includes('ui')) {
        useCases.add('user interfaces');
        useCases.add('web applications');
      } else {
        useCases.add('web design');
        useCases.add('mobile applications');
        useCases.add('user interfaces');
      }
    }
    
    return Array.from(useCases).slice(0, 4); // Limit to 4 use cases
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}