#!/usr/bin/env node

/**
 * Complete sitemap generation script
 * Generates all sitemaps with full icon data for better SEO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://iconstack.io';
const MAX_URLS_PER_SITEMAP = 50000;

// Library metadata matching IconLibraryManager
const LIBRARIES = [
  { id: 'tabler', name: 'Tabler', count: 4964 },
  { id: 'feather', name: 'Feather', count: 287 },
  { id: 'solar', name: 'Solar', count: 1241 },
  { id: 'phosphor', name: 'Phosphor', count: 9072 },
  { id: 'bootstrap', name: 'Bootstrap', count: 2078 },
  { id: 'iconsax', name: 'Iconsax', count: 943 },
  { id: 'radix', name: 'Radix', count: 318 },
  { id: 'line', name: 'Line', count: 606 },
  { id: 'pixelart', name: 'Pixel Art', count: 486 },
  { id: 'hugeicon', name: 'Huge Icons', count: 4497 },
  { id: 'mingcute', name: 'Mingcute', count: 3102 },
  { id: 'heroicons', name: 'Heroicons', count: 648 },
  { id: 'material', name: 'Material Design', count: 7447 },
  { id: 'fluent-ui', name: 'Fluent UI', count: 4780 },
  { id: 'lucide', name: 'Lucide', count: 1632 },
  { id: 'carbon', name: 'Carbon', count: 2510 },
  { id: 'iconamoon', name: 'Iconamoon', count: 608 },
  { id: 'iconoir', name: 'Iconoir', count: 1383 },
  { id: 'majesticon', name: 'Majesticon', count: 760 },
  { id: 'simple', name: 'Brand', count: 3355 },
  { id: 'octicons', name: 'Octicons', count: 661 }
];

// Utility functions
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function urlToIconName(iconName) {
  return iconName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate main sitemap index
function generateSitemapIndex() {
  const sitemaps = [
    `${DOMAIN}/sitemap-main.xml`,
    ...LIBRARIES.map(lib => `${DOMAIN}/sitemap-${lib.id}.xml`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return xml;
}

// Generate main sitemap
function generateMainSitemap() {
  const urls = [
    { url: DOMAIN, priority: '1.0', changefreq: 'daily' },
    { url: `${DOMAIN}/demo/icons`, priority: '0.8', changefreq: 'weekly' },
    ...LIBRARIES.map(lib => ({ 
      url: `${DOMAIN}/library/${lib.id}`, 
      priority: '0.9', 
      changefreq: 'weekly' 
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

// Load icon data from TypeScript files
async function loadIconData(libraryId) {
  try {
    console.log(`📦 Loading ${libraryId} icons...`);
    
    // Dynamic import based on library ID
    const modulePath = path.resolve(__dirname, '..', 'src', 'data', `${libraryId}.ts`);
    
    // Read the file content and extract icon names
    const fileContent = fs.readFileSync(modulePath, 'utf8');
    
    // Extract icon IDs using regex
    const iconIds = [];
    const idMatches = fileContent.matchAll(/id:\s*["']([^"']+)["']/g);
    
    for (const match of idMatches) {
      iconIds.push(match[1]);
    }
    
    console.log(`✅ Loaded ${iconIds.length} icons from ${libraryId}`);
    return iconIds;
    
  } catch (error) {
    console.warn(`⚠️  Failed to load ${libraryId} icons:`, error.message);
    return [];
  }
}

// Generate library sitemap
async function generateLibrarySitemap(libraryId) {
  const iconIds = await loadIconData(libraryId);
  
  if (iconIds.length === 0) {
    console.warn(`⚠️  No icons found for ${libraryId}, generating empty sitemap`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }

  // Create URLs for each icon
  const urls = iconIds.map(iconId => {
    // Extract icon name from ID (remove library prefix)
    const iconName = iconId.replace(`${libraryId}-`, '');
    const urlSafeName = urlToIconName(iconName);
    return `${DOMAIN}/icon/${libraryId}/${urlSafeName}`;
  });

  // Split into chunks if needed
  const chunks = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  // For now, use only the first chunk
  const urlsToInclude = chunks[0] || [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsToInclude.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  console.log(`✅ Generated sitemap for ${libraryId}: ${urlsToInclude.length} URLs`);
  return xml;
}

// Main generation function
async function generateAllSitemaps() {
  console.log('🚀 Starting complete sitemap generation...');
  
  const publicDir = path.resolve(__dirname, '..', 'public');
  ensureDir(publicDir);

  try {
    // Generate sitemap index
    console.log('📝 Generating sitemap index...');
    const sitemapIndex = generateSitemapIndex();
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);

    // Generate main sitemap
    console.log('📝 Generating main sitemap...');
    const mainSitemap = generateMainSitemap();
    fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), mainSitemap);

    // Generate library sitemaps
    console.log('📝 Generating library sitemaps...');
    for (const library of LIBRARIES) {
      console.log(`🔄 Processing ${library.name} (${library.id})...`);
      const librarySitemap = await generateLibrarySitemap(library.id);
      fs.writeFileSync(path.join(publicDir, `sitemap-${library.id}.xml`), librarySitemap);
    }

    console.log('✅ All sitemaps generated successfully!');
    console.log(`📊 Generated ${LIBRARIES.length + 2} sitemap files`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSitemaps().catch(console.error);
}

export { generateAllSitemaps };