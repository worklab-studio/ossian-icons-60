import { iconLibraryManager } from './IconLibraryManager';

// URL-safe name conversion
const toUrlSafeName = (name: string) => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export class SitemapService {
  private static BASE_URL = 'https://iconstack.co';

  // Generate sitemap XML for all icon detail pages
  static async generateIconSitemap(): Promise<string> {
    const allLibraries = iconLibraryManager.libraries;
    const urls: string[] = [];

    // Add homepage and main pages
    urls.push(`${this.BASE_URL}/`);
    
    // Add library pages
    for (const library of allLibraries) {
      urls.push(`${this.BASE_URL}/library/${library.id}`);
    }

    // Add individual icon pages (sample for now to avoid huge sitemap)
    // In production, you might want to split this into multiple sitemaps
    for (const library of allLibraries.slice(0, 5)) { // Limit to first 5 libraries for demo
      try {
        const icons = await iconLibraryManager.loadLibrary(library.id);
        
        // Add up to 100 most popular icons per library to avoid huge sitemap
        const limitedIcons = icons.slice(0, 100);
        
        for (const icon of limitedIcons) {
          const urlSafeName = toUrlSafeName(icon.name);
          urls.push(`${this.BASE_URL}/icon/${library.id}/${urlSafeName}`);
        }
      } catch (error) {
        console.error(`Failed to load library ${library.id} for sitemap:`, error);
      }
    }

    // Generate XML
    const xmlUrls = urls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === `${this.BASE_URL}/` ? '1.0' : '0.7'}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  }

  // Generate sitemap index for multiple sitemaps
  static generateSitemapIndex(): string {
    const sitemaps = [
      'sitemap-main.xml',
      'sitemap-icons.xml'
    ];

    const xmlSitemaps = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${this.BASE_URL}/${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlSitemaps}
</sitemapindex>`;
  }
}