#!/usr/bin/env node

/**
 * Robust sitemap generation script using pre-extracted icon data
 * This approach avoids dynamic imports and memory issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://iconstack.io';
const MAX_URLS_PER_SITEMAP = 45000;

const LIBRARIES = [
  { id: 'bootstrap', name: 'Bootstrap Icons' },
  { id: 'carbon', name: 'Carbon Icons' },
  { id: 'feather', name: 'Feather Icons' },
  { id: 'fluent-ui', name: 'Fluent UI Icons' },
  { id: 'heroicons', name: 'Heroicons' },
  { id: 'hugeicon', name: 'Huge Icons' },
  { id: 'iconamoon', name: 'Iconamoon' },
  { id: 'iconoir', name: 'Iconoir' },
  { id: 'iconsax', name: 'Iconsax' },
  { id: 'line', name: 'Line Icons' },
  { id: 'lucide', name: 'Lucide Icons' },
  { id: 'majesticon', name: 'Majesticons' },
  { id: 'material', name: 'Material Icons' },
  { id: 'mingcute', name: 'Mingcute Icons' },
  { id: 'octicons', name: 'Octicons' },
  { id: 'phosphor', name: 'Phosphor Icons' },
  { id: 'pixelart', name: 'Pixel Art Icons' },
  { id: 'radix', name: 'Radix Icons' },
  { id: 'simple', name: 'Simple Icons' },
  { id: 'solar', name: 'Solar Icons' },
  { id: 'tabler', name: 'Tabler Icons' }
];

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateSitemapIndex() {
  const sitemaps = [
    'sitemap-main.xml',
    ...LIBRARIES.map(lib => `sitemap-${lib.id}.xml`)
  ];
  
  const sitemapUrls = sitemaps.map(sitemap => 
    `  <sitemap>
    <loc>${DOMAIN}/${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`
  ).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</sitemapindex>`;
}

function generateMainSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];
  
  const mainUrls = [
    `  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
    `  <url>
    <loc>${DOMAIN}/demo/icons</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  ];
  
  const libraryUrls = LIBRARIES.map(library => 
    `  <url>
    <loc>${DOMAIN}/library/${library.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  );
  
  const allUrls = [...mainUrls, ...libraryUrls].join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;
}

function generateLibrarySitemap(libraryId, iconNames) {
  const lastmod = new Date().toISOString().split('T')[0];
  
  if (!iconNames || iconNames.length === 0) {
    console.warn(`⚠️  No icons found for ${libraryId}, generating empty sitemap`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
  
  // Limit to MAX_URLS_PER_SITEMAP to avoid sitemap size limits
  const limitedIcons = iconNames.slice(0, MAX_URLS_PER_SITEMAP);
  
  console.log(`📝 Generating sitemap for ${libraryId} with ${limitedIcons.length} icons`);
  
  const urls = limitedIcons.map(iconName => 
    `  <url>
    <loc>${DOMAIN}/icon/${libraryId}/${iconName}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  ).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function loadExtractedData() {
  const dataPath = path.join(__dirname, '..', 'extracted-icon-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.log('📦 No extracted data found, running extraction...');
    const { extractIconData } = await import('./extract-icon-data.js');
    return await extractIconData();
  }
  
  console.log('📂 Loading pre-extracted icon data...');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(rawData);
}

async function generateAllSitemaps() {
  console.log('🚀 Starting robust sitemap generation...');
  
  try {
    // Load extracted icon data
    const iconData = await loadExtractedData();
    
    // Ensure public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    ensureDir(publicDir);
    
    // Generate sitemap index
    console.log('📋 Generating sitemap index...');
    const sitemapIndex = generateSitemapIndex();
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    
    // Generate main sitemap
    console.log('🏠 Generating main sitemap...');
    const mainSitemap = generateMainSitemap();
    fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), mainSitemap);
    
    // Generate library sitemaps
    let totalUrls = 0;
    const generatedSitemaps = [];
    
    for (const library of LIBRARIES) {
      const iconNames = iconData[library.id] || [];
      const sitemap = generateLibrarySitemap(library.id, iconNames);
      const filename = `sitemap-${library.id}.xml`;
      
      fs.writeFileSync(path.join(publicDir, filename), sitemap);
      
      totalUrls += iconNames.length;
      generatedSitemaps.push({
        file: filename,
        urls: iconNames.length,
        library: library.name
      });
      
      console.log(`✅ Generated ${filename} with ${iconNames.length} URLs`);
    }
    
    // Add main sitemap URLs to total
    totalUrls += LIBRARIES.length + 2; // library pages + home + demo
    
    console.log('\n🎉 Sitemap generation completed!');
    console.log(`📊 Total URLs generated: ${totalUrls.toLocaleString()}`);
    console.log('\n📋 Summary:');
    console.log('   sitemap.xml (index)');
    console.log(`   sitemap-main.xml (${LIBRARIES.length + 2} URLs)`);
    
    generatedSitemaps.forEach(({ file, urls, library }) => {
      console.log(`   ${file} (${urls.toLocaleString()} URLs) - ${library}`);
    });
    
    return { totalUrls, generatedSitemaps };
    
  } catch (error) {
    console.error('❌ Error during sitemap generation:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSitemaps().catch(console.error);
}

export { generateAllSitemaps };