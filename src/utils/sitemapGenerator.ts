import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconItem } from '@/types/icon';

interface SitemapUrl {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export class SitemapGenerator {
  private baseUrl: string;
  private maxUrlsPerSitemap = 50000;

  constructor(baseUrl: string = 'https://iconstack.lovable.app') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Generate sitemap URLs for all icons across all libraries
   */
  async generateIconSitemapUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
      // Load all libraries
      const libraries = iconLibraryManager.libraries;
      
      for (const library of libraries) {
        try {
          const icons = await iconLibraryManager.loadLibrary(library.id);
          
          for (const icon of icons) {
            const iconUrlName = this.sanitizeUrlName(icon.name);
            const url = `${this.baseUrl}/icon/${library.id}/${iconUrlName}`;
            
            urls.push({
              url,
              lastmod,
              changefreq: 'weekly',
              priority: '0.7'
            });
          }
        } catch (error) {
          console.error(`Failed to load library ${library.id}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to generate icon sitemap URLs:', error);
    }

    return urls;
  }

  /**
   * Generate main site sitemap URLs (homepage, library pages, etc.)
   */
  generateMainSitemapUrls(): SitemapUrl[] {
    const lastmod = new Date().toISOString().split('T')[0];
    const urls: SitemapUrl[] = [];

    // Homepage
    urls.push({
      url: this.baseUrl,
      lastmod,
      changefreq: 'daily',
      priority: '1.0'
    });

    // Library pages
    const libraries = iconLibraryManager.libraries;
    for (const library of libraries) {
      urls.push({
        url: `${this.baseUrl}/library/${library.id}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.8'
      });
    }

    return urls;
  }

  /**
   * Generate XML sitemap content from URLs
   */
  generateSitemapXml(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    const urlElements = urls.map(({ url, lastmod, changefreq, priority }) => `
  <url>
    <loc>${this.escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

    return `${xmlHeader}\n${urlsetOpen}${urlElements}\n${urlsetClose}`;
  }

  /**
   * Generate sitemap index XML when multiple sitemaps are needed
   */
  generateSitemapIndexXml(sitemapFiles: string[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const indexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const indexClose = '</sitemapindex>';
    const lastmod = new Date().toISOString().split('T')[0];

    const sitemapElements = sitemapFiles.map(filename => `
  <sitemap>
    <loc>${this.baseUrl}/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('');

    return `${xmlHeader}\n${indexOpen}${sitemapElements}\n${indexClose}`;
  }

  /**
   * Split URLs into multiple sitemaps if needed
   */
  splitIntoSitemaps(urls: SitemapUrl[]): { filename: string; content: string }[] {
    const sitemaps: { filename: string; content: string }[] = [];
    
    for (let i = 0; i < urls.length; i += this.maxUrlsPerSitemap) {
      const urlChunk = urls.slice(i, i + this.maxUrlsPerSitemap);
      const sitemapNumber = Math.floor(i / this.maxUrlsPerSitemap) + 1;
      const filename = sitemapNumber === 1 ? 'sitemap.xml' : `sitemap-${sitemapNumber}.xml`;
      const content = this.generateSitemapXml(urlChunk);
      
      sitemaps.push({ filename, content });
    }

    return sitemaps;
  }

  /**
   * Generate complete sitemap structure
   */
  async generateCompleteSitemap(): Promise<{ files: { filename: string; content: string }[]; indexFile?: { filename: string; content: string } }> {
    try {
      // Get all URLs
      const [mainUrls, iconUrls] = await Promise.all([
        this.generateMainSitemapUrls(),
        this.generateIconSitemapUrls()
      ]);

      const allUrls = [...mainUrls, ...iconUrls];
      
      // Split into multiple sitemaps if needed
      const sitemapFiles = this.splitIntoSitemaps(allUrls);
      
      let indexFile;
      if (sitemapFiles.length > 1) {
        // Create sitemap index
        const sitemapFilenames = sitemapFiles.map(f => f.filename);
        indexFile = {
          filename: 'sitemap-index.xml',
          content: this.generateSitemapIndexXml(sitemapFilenames)
        };
      }

      return {
        files: sitemapFiles,
        indexFile
      };
    } catch (error) {
      console.error('Failed to generate complete sitemap:', error);
      throw error;
    }
  }

  /**
   * Sanitize icon name for URL use
   */
  private sanitizeUrlName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();