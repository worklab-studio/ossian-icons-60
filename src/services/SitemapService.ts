import { iconLibraryManager } from "./IconLibraryManager";
import { generateIconUrl } from "@/lib/url-helpers";
import { getAllCategorySlugs } from "@/data/seo-categories";
import { CollectionService } from "./CollectionService";
import { getPostSlugs, isSanityConfigured } from "./SanityClient";

export class SitemapService {
  private static readonly DOMAIN = "https://iconstack.io";
  private static readonly MAX_URLS_PER_SITEMAP = 45000;
  
  static async generateSitemapIndex(): Promise<string> {
    const sitemapEntries: string[] = [];
    
    sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-main.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);
    
    for (const library of iconLibraryManager.libraries) {
      sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-${library.id}.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);
    }

    // Collections & comparisons sitemap
    sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-collections.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);

    // Blog sitemap
    sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-blog.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('')}
</sitemapindex>`;
  }
  
  static generateMainSitemap(): string {
    const lastmod = new Date().toISOString().split('T')[0];
    
    const urls = [
      { loc: this.DOMAIN, priority: '1.0', changefreq: 'weekly' },
      { loc: `${this.DOMAIN}/demo/icons`, priority: '0.8', changefreq: 'monthly' },
    ];
    
    iconLibraryManager.libraries.forEach(library => {
      urls.push({
        loc: `${this.DOMAIN}/library/${library.id}`,
        priority: '0.8',
        changefreq: 'monthly'
      });
    });
    
    const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  /**
   * Generate sitemap for collection pages, category+library pages, and comparison pages
   */
  static generateCollectionsSitemap(): string {
    const lastmod = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    // Category collection pages
    const categories = getAllCategorySlugs();
    for (const slug of categories) {
      urls.push(`
  <url>
    <loc>${this.DOMAIN}/icons/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);

      // Category + library pages
      for (const lib of iconLibraryManager.libraries) {
        urls.push(`
  <url>
    <loc>${this.DOMAIN}/icons/${slug}/${lib.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    }

    // Comparison pages
    const comparisonSlugs = CollectionService.getAllComparisonSlugs();
    for (const slug of comparisonSlugs) {
      urls.push(`
  <url>
    <loc>${this.DOMAIN}/compare/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
  }
  
  static async generateLibrarySitemap(libraryId: string): Promise<string> {
    try {
      const icons = await iconLibraryManager.loadLibrary(libraryId);
      const lastmod = new Date().toISOString().split('T')[0];
      const limitedIcons = icons.slice(0, this.MAX_URLS_PER_SITEMAP);
      
      const urlEntries = limitedIcons.map(icon => {
        const url = generateIconUrl(libraryId, icon.name);
        return `
  <url>
    <loc>${this.DOMAIN}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }).join('');
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
    } catch (error) {
      console.error(`Failed to generate sitemap for library ${libraryId}:`, error);
      return this.generateEmptySitemap();
    }
  }
  
  private static generateEmptySitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
  
  static async generateBlogSitemap(): Promise<string> {
    const lastmod = new Date().toISOString().split('T')[0];
    
    if (!isSanityConfigured()) {
      // Return sitemap with just the blog index
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.DOMAIN}/blog</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    }

    try {
      const slugs = await getPostSlugs();
      const urls = [`
  <url>
    <loc>${this.DOMAIN}/blog</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`];

      for (const slug of slugs) {
        urls.push(`
  <url>
    <loc>${this.DOMAIN}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }

      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
    } catch {
      return this.generateEmptySitemap();
    }
  }

  static getLibraryIds(): string[] {
    return iconLibraryManager.libraries.map(lib => lib.id);
  }
}