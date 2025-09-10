import { iconLibraryManager } from "./IconLibraryManager";
import { generateIconUrl } from "@/lib/url-helpers";

export class SitemapService {
  private static readonly DOMAIN = "https://iconstack.io";
  private static readonly MAX_URLS_PER_SITEMAP = 45000; // Keep under 50k limit
  
  /**
   * Generate the main sitemap index that references all sitemaps
   */
  static async generateSitemapIndex(): Promise<string> {
    const sitemapEntries: string[] = [];
    
    // Main sitemap for core pages
    sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-main.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);
    
    // Library-specific sitemaps
    for (const library of iconLibraryManager.libraries) {
      sitemapEntries.push(`
    <sitemap>
      <loc>${this.DOMAIN}/sitemap-${library.id}.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`);
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('')}
</sitemapindex>`;
  }
  
  /**
   * Generate the main sitemap for core pages
   */
  static generateMainSitemap(): string {
    const lastmod = new Date().toISOString().split('T')[0];
    
    const urls = [
      { loc: this.DOMAIN, priority: '1.0', changefreq: 'weekly' },
      { loc: `${this.DOMAIN}/demo/icons`, priority: '0.8', changefreq: 'monthly' },
    ];
    
    // Add library pages
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
   * Generate sitemap for a specific library's icons
   */
  static async generateLibrarySitemap(libraryId: string): Promise<string> {
    try {
      const icons = await iconLibraryManager.loadLibrary(libraryId);
      const lastmod = new Date().toISOString().split('T')[0];
      
      // Limit icons to prevent huge sitemaps
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
  
  /**
   * Generate an empty sitemap for error cases
   */
  private static generateEmptySitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
  
  /**
   * Get all available library IDs for sitemap generation
   */
  static getLibraryIds(): string[] {
    return iconLibraryManager.libraries.map(lib => lib.id);
  }
}