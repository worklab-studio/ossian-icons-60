#!/usr/bin/env node

/**
 * Regenerate all sitemaps with correct domain URLs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMAIN = "https://iconstack.io";
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Library definitions (must match your actual libraries)
const LIBRARIES = [
  { id: 'tabler', name: 'Tabler Icons', count: 5000 },
  { id: 'lucide', name: 'Lucide', count: 1400 },
  { id: 'heroicons', name: 'Heroicons', count: 700 },
  { id: 'phosphor', name: 'Phosphor', count: 1200 },
  { id: 'feather', name: 'Feather', count: 286 },
  { id: 'material', name: 'Material Icons', count: 2000 },
  { id: 'bootstrap', name: 'Bootstrap Icons', count: 2000 },
  { id: 'iconoir', name: 'Iconoir', count: 1500 },
  { id: 'octicons', name: 'Octicons', count: 500 },
  { id: 'simple', name: 'Simple Icons', count: 3000 },
  { id: 'radix', name: 'Radix Icons', count: 318 },
  { id: 'iconsax', name: 'Iconsax', count: 1000 },
  { id: 'hugeicon', name: 'Hugeicons', count: 4000 },
  { id: 'solar', name: 'Solar Icons', count: 7000 },
  { id: 'fluent-ui', name: 'Fluent UI', count: 2000 },
  { id: 'mingcute', name: 'Mingcute', count: 2500 },
  { id: 'carbon', name: 'Carbon Icons', count: 2000 },
  { id: 'majesticon', name: 'Majesticons', count: 760 },
  { id: 'iconamoon', name: 'Iconamoon', count: 4500 },
  { id: 'pixelart', name: 'Pixelart Icons', count: 460 },
  { id: 'line', name: 'Line MD', count: 400 }
];

function ensureDir(filePath) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
}

/**
 * Generate sitemap index
 */
function generateSitemapIndex() {
  const sitemapEntries = [];
  const lastmod = new Date().toISOString().split('T')[0];
  
  // Main sitemap
  sitemapEntries.push(`
  <sitemap>
    <loc>${DOMAIN}/sitemap-main.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`);
  
  // Library sitemaps
  LIBRARIES.forEach(library => {
    sitemapEntries.push(`
  <sitemap>
    <loc>${DOMAIN}/sitemap-${library.id}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`);
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('')}
</sitemapindex>`;
}

/**
 * Generate main sitemap for core pages
 */
function generateMainSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];
  
  const urls = [
    { loc: DOMAIN, priority: '1.0', changefreq: 'weekly' },
    { loc: `${DOMAIN}/demo/icons`, priority: '0.8', changefreq: 'monthly' },
  ];
  
  // Add library pages
  LIBRARIES.forEach(library => {
    urls.push({
      loc: `${DOMAIN}/library/${library.id}`,
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
 * Generate placeholder library sitemap (for consistency)
 */
function generateLibrarySitemap(libraryId) {
  const lastmod = new Date().toISOString().split('T')[0];
  
  // Generate a few example URLs for each library
  const sampleIcons = [
    'home', 'user', 'settings', 'search', 'heart', 
    'star', 'mail', 'phone', 'calendar', 'check'
  ];
  
  const urlEntries = sampleIcons.map(iconName => `
  <url>
    <loc>${DOMAIN}/icon/${libraryId}/${iconName}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Main function to generate all sitemaps
 */
function generateAllSitemaps() {
  console.log('🚀 Regenerating sitemaps with correct domain...');
  
  try {
    // Ensure public directory exists
    ensureDir(join(PUBLIC_DIR, 'sitemap.xml'));
    
    // Generate and write sitemap index
    const sitemapIndex = generateSitemapIndex();
    writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndex);
    console.log('✅ Generated sitemap.xml');
    
    // Generate and write main sitemap
    const mainSitemap = generateMainSitemap();
    writeFileSync(join(PUBLIC_DIR, 'sitemap-main.xml'), mainSitemap);
    console.log('✅ Generated sitemap-main.xml');
    
    // Generate library sitemaps
    LIBRARIES.forEach(library => {
      const librarySitemap = generateLibrarySitemap(library.id);
      writeFileSync(join(PUBLIC_DIR, `sitemap-${library.id}.xml`), librarySitemap);
      console.log(`✅ Generated sitemap-${library.id}.xml`);
    });
    
    console.log(`\n🎉 Successfully generated ${2 + LIBRARIES.length} sitemap files:`);
    console.log(`   - sitemap.xml (index)`);
    console.log(`   - sitemap-main.xml`);
    console.log(`   - ${LIBRARIES.length} library sitemaps`);
    console.log(`\n🌐 All URLs use domain: ${DOMAIN}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSitemaps();
}

export { generateAllSitemaps };