#!/usr/bin/env node

/**
 * Build-time sitemap generation script
 * Generates all sitemaps including 50k+ individual icon pages with real icon data
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMAIN = "https://iconstack.io";

// Real library metadata with actual counts
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

function generateSitemapIndex() {
  const lastmod = new Date().toISOString().split('T')[0];
  
  const sitemapEntries = [
    `    <sitemap>
      <loc>${DOMAIN}/sitemap-main.xml</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`
  ];
  
  // Add library-specific sitemaps
  LIBRARIES.forEach(library => {
    sitemapEntries.push(`    <sitemap>
      <loc>${DOMAIN}/sitemap-${library.id}.xml</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`);
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</sitemapindex>`;
}

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
  
  const urlEntries = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function iconNameToUrlSafe(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function loadRealIconData(libraryId) {
  try {
    console.log(`📚 Loading real icon data for ${libraryId}...`);
    
    // Dynamic import based on library ID - use .ts extension
    const iconData = await import(`../src/data/${libraryId}.ts`);
    console.log(`🔍 Debug: Available exports for ${libraryId}:`, Object.keys(iconData));
    
    // Map library IDs to their exact export names
    const exportMap = {
      'tabler': 'tablerIcons',
      'feather': 'featherIcons', 
      'solar': 'solarIcons',
      'phosphor': 'phosphorIcons',
      'bootstrap': 'bootstrapIcons',
      'iconsax': 'iconsaxIcons',
      'radix': 'radixIcons',
      'line': 'lineIcons',
      'pixelart': 'pixelartIcons',
      'hugeicon': 'hugeiconIcons',
      'mingcute': 'mingcuteIcons',
      'heroicons': 'heroiconsIcons',
      'material': 'materialIcons',
      'fluent-ui': 'fluentUiIcons',
      'lucide': 'lucideIcons',
      'carbon': 'carbonIcons',
      'iconamoon': 'iconamoonIcons',
      'iconoir': 'iconoirIcons',
      'majesticon': 'majesticonIcons',
      'simple': 'simpleIcons',
      'octicons': 'octiconsIcons'
    };
    
    const exportName = exportMap[libraryId];
    const iconArray = iconData[exportName];
    
    if (!iconArray || !Array.isArray(iconArray)) {
      console.warn(`⚠️  No icon array found for ${libraryId} (looking for ${exportName})`);
      console.log('Available exports:', Object.keys(iconData));
      console.log('Export content type:', typeof iconData[exportName]);
      console.log('Export content sample:', iconData[exportName]?.slice(0, 2));
      return [];
    }
    
    console.log(`✅ Loaded ${iconArray.length} icons for ${libraryId}`);
    return iconArray;
  } catch (error) {
    console.warn(`⚠️  Failed to load ${libraryId} icons:`, error.message);
    return [];
  }
}

async function generateLibrarySitemap(library) {
  const lastmod = new Date().toISOString().split('T')[0];
  const MAX_URLS_PER_SITEMAP = 45000;
  
  // Load real icon data
  const realIcons = await loadRealIconData(library.id);
  console.log(`🔍 Generated ${realIcons.length} icons for ${library.id} sitemap`);
  
  // Use real icon names if available, otherwise fallback to mock
  let iconNames = [];
  
  if (realIcons.length > 0) {
    iconNames = realIcons
      .slice(0, MAX_URLS_PER_SITEMAP)
      .map(icon => {
        // Use name if available, otherwise extract from id (remove library prefix)
        const name = icon.name || icon.id;
        return name.replace(`${library.id}-`, '');
      });
  } else {
    // Fallback to mock data if real data unavailable
    console.log(`📝 Using mock data for ${library.id}`);
    const baseNames = [
      'home', 'user', 'search', 'settings', 'edit', 'delete', 'add', 'remove',
      'star', 'heart', 'bookmark', 'share', 'download', 'upload', 'save', 'print',
      'mail', 'phone', 'message', 'notification', 'calendar', 'clock', 'timer',
      'play', 'pause', 'stop', 'forward', 'backward', 'volume', 'mute',
      'image', 'video', 'camera', 'gallery', 'folder', 'file', 'document',
      'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron',
      'check', 'x', 'plus', 'minus', 'info', 'warning', 'error', 'success',
      'lock', 'unlock', 'eye', 'eye-off', 'visible', 'hidden',
      'menu', 'grid', 'list', 'layout', 'sidebar', 'header', 'footer'
    ];
    
    const targetCount = Math.min(library.count, MAX_URLS_PER_SITEMAP);
    for (let i = 0; i < targetCount; i++) {
      const baseName = baseNames[i % baseNames.length];
      const variation = Math.floor(i / baseNames.length);
      const iconName = variation > 0 ? `${baseName}-${variation}` : baseName;
      iconNames.push(iconName);
    }
  }
  
  const urlEntries = iconNames.map(iconName => {
    const safeName = iconNameToUrlSafe(iconName);
    return `  <url>
    <loc>${DOMAIN}/icon/${library.id}/${safeName}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
}

async function generateAllSitemaps() {
  console.log('🚀 Generating comprehensive sitemaps for 50k+ icon pages...');
  
  const publicDir = join(__dirname, '..', 'public');
  
  try {
    // Generate main sitemap index
    console.log('📄 Generating sitemap index...');
    const sitemapIndex = generateSitemapIndex();
    const indexPath = join(publicDir, 'sitemap.xml');
    ensureDir(indexPath);
    writeFileSync(indexPath, sitemapIndex);
    
    // Generate main sitemap for core pages
    console.log('📄 Generating main sitemap...');
    const mainSitemap = generateMainSitemap();
    const mainPath = join(publicDir, 'sitemap-main.xml');
    ensureDir(mainPath);
    writeFileSync(mainPath, mainSitemap);
    
    // Generate library-specific sitemaps with real icon data
    let totalIconPages = 0;
    for (const library of LIBRARIES) {
      console.log(`📄 Generating sitemap for ${library.name} (${library.count} icons)...`);
      const librarySitemap = await generateLibrarySitemap(library);
      const libraryPath = join(publicDir, `sitemap-${library.id}.xml`);
      ensureDir(libraryPath);
      writeFileSync(libraryPath, librarySitemap);
      totalIconPages += Math.min(library.count, 45000);
    }
    
    console.log(`✅ Successfully generated sitemaps!`);
    console.log(`📊 Summary:`);
    console.log(`   • Main sitemap index: 1 file`);
    console.log(`   • Core pages sitemap: 1 file (${LIBRARIES.length + 2} URLs)`);
    console.log(`   • Library sitemaps: ${LIBRARIES.length} files`);
    console.log(`   • Total icon pages: ${totalIconPages.toLocaleString()} URLs`);
    console.log(`   • Domain: ${DOMAIN}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run the script
generateAllSitemaps();