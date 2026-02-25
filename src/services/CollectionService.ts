import { type IconItem, type LibrarySection } from '@/types/icon';
import { type SeoCategory, SEO_CATEGORIES, getCategoryBySlug } from '@/data/seo-categories';
import { iconLibraryManager, type IconLibraryMetadata } from './IconLibraryManager';

export interface ComparisonData {
  libraryA: IconLibraryMetadata;
  libraryB: IconLibraryMetadata;
  sharedIconNames: string[];
  uniqueToA: number;
  uniqueToB: number;
  totalA: number;
  totalB: number;
  overlapPercentage: number;
  sampleShared: IconItem[]; // up to 20 shared icons from library A
  sampleUniqueA: IconItem[]; // up to 10 unique to A
  sampleUniqueB: IconItem[]; // up to 10 unique to B
}

export interface CategoryMatchResult {
  category: SeoCategory;
  sections: LibrarySection[];
  totalCount: number;
  libraryCount: number;
}

export class CollectionService {

  /**
   * Match icons to a category by scanning name and tags
   */
  static iconMatchesCategory(icon: IconItem, category: SeoCategory): boolean {
    const name = icon.name.toLowerCase();
    const tags = icon.tags?.map(t => t.toLowerCase()) ?? [];
    
    return category.searchTags.some(tag => {
      const t = tag.toLowerCase();
      // Check name contains the tag
      if (name.includes(t)) return true;
      // Check tags contain the tag
      if (tags.some(iconTag => iconTag.includes(t) || t.includes(iconTag))) return true;
      return false;
    });
  }

  /**
   * Load all icons matching a category, grouped by library
   */
  static async getIconsForCategory(categorySlug: string): Promise<CategoryMatchResult | null> {
    const category = getCategoryBySlug(categorySlug);
    if (!category) return null;

    const allSections = await iconLibraryManager.loadAllLibrariesGrouped();
    const matchedSections: LibrarySection[] = [];
    let totalCount = 0;

    for (const section of allSections) {
      const matched = section.icons.filter(icon => this.iconMatchesCategory(icon, category));
      if (matched.length > 0) {
        matchedSections.push({
          libraryId: section.libraryId,
          libraryName: section.libraryName,
          icons: matched,
        });
        totalCount += matched.length;
      }
    }

    return {
      category,
      sections: matchedSections,
      totalCount,
      libraryCount: matchedSections.length,
    };
  }

  /**
   * Load icons for a category filtered to a specific library
   */
  static async getIconsForCategoryAndLibrary(
    categorySlug: string,
    libraryId: string
  ): Promise<{ category: SeoCategory; icons: IconItem[]; libraryName: string } | null> {
    const category = getCategoryBySlug(categorySlug);
    if (!category) return null;

    const library = iconLibraryManager.libraries.find(l => l.id === libraryId);
    if (!library) return null;

    const icons = await iconLibraryManager.loadLibrary(libraryId);
    const matched = icons.filter(icon => this.iconMatchesCategory(icon, category));

    return {
      category,
      icons: matched,
      libraryName: library.name,
    };
  }

  /**
   * Generate comparison data between two libraries
   */
  static async getComparisonData(libraryIdA: string, libraryIdB: string): Promise<ComparisonData | null> {
    const libA = iconLibraryManager.libraries.find(l => l.id === libraryIdA);
    const libB = iconLibraryManager.libraries.find(l => l.id === libraryIdB);
    if (!libA || !libB) return null;

    const [iconsA, iconsB] = await Promise.all([
      iconLibraryManager.loadLibrary(libraryIdA),
      iconLibraryManager.loadLibrary(libraryIdB),
    ]);

    // Normalize names for comparison
    const normalize = (name: string) => name.toLowerCase().replace(/[-_\s]+/g, '');
    
    const namesA = new Set(iconsA.map(i => normalize(i.name)));
    const namesB = new Set(iconsB.map(i => normalize(i.name)));
    
    const shared: string[] = [];
    namesA.forEach(n => { if (namesB.has(n)) shared.push(n); });

    const sharedSet = new Set(shared);
    const uniqueA = iconsA.filter(i => !sharedSet.has(normalize(i.name)));
    const uniqueB = iconsB.filter(i => !sharedSet.has(normalize(i.name)));
    const sharedA = iconsA.filter(i => sharedSet.has(normalize(i.name)));

    return {
      libraryA: libA,
      libraryB: libB,
      sharedIconNames: shared,
      uniqueToA: uniqueA.length,
      uniqueToB: uniqueB.length,
      totalA: iconsA.length,
      totalB: iconsB.length,
      overlapPercentage: Math.round((shared.length / Math.min(iconsA.length, iconsB.length)) * 100),
      sampleShared: sharedA.slice(0, 20),
      sampleUniqueA: uniqueA.slice(0, 10),
      sampleUniqueB: uniqueB.slice(0, 10),
    };
  }

  /**
   * Parse comparison slug like "lucide-vs-feather"
   */
  static parseComparisonSlug(slug: string): { libraryIdA: string; libraryIdB: string } | null {
    const parts = slug.split('-vs-');
    if (parts.length !== 2) return null;
    const libraryIdA = parts[0].trim();
    const libraryIdB = parts[1].trim();
    
    const validIds = new Set(iconLibraryManager.libraries.map(l => l.id));
    if (!validIds.has(libraryIdA) || !validIds.has(libraryIdB)) return null;
    
    return { libraryIdA, libraryIdB };
  }

  /**
   * Get all valid comparison slugs for sitemap generation
   */
  static getAllComparisonSlugs(): string[] {
    const libs = iconLibraryManager.libraries;
    const slugs: string[] = [];
    for (let i = 0; i < libs.length; i++) {
      for (let j = i + 1; j < libs.length; j++) {
        slugs.push(`${libs[i].id}-vs-${libs[j].id}`);
      }
    }
    return slugs;
  }

  /**
   * Get SEO description with counts filled in
   */
  static formatSeoDescription(template: string, count: number, libCount: number): string {
    return template
      .replace('{count}', count.toLocaleString())
      .replace('{libs}', libCount.toString());
  }
}
