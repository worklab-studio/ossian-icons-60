#!/usr/bin/env node

/**
 * Sitemap generator that parses TypeScript icon data files directly (no TS imports).
 * Writes complete XML sitemaps for all libraries into public/ with 50k+ URLs total.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://iconstack.io';
const MAX_URLS_PER_SITEMAP = 45000; // safety under 50k limit

// Libraries map to their corresponding TS filenames (they match ids here)
const LIBRARIES = [
  'tabler',
  'feather',
  'solar',
  'phosphor',
  'bootstrap',
  'iconsax',
  'radix',
  'line',
  'pixelart',
  'hugeicon',
  'mingcute',
  'heroicons',
  'material',
  'fluent-ui',
  'lucide',
  'carbon',
  'iconamoon',
  'iconoir',
  'majesticon',
  'simple',
  'octicons',
];

function iconNameToUrlSafe(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseIconNamesFromTs(content) {
  // Extract values of name: "..." allowing for escaped quotes. Greedy enough but bounded by quotes.
  const names = [];
  const nameRegex = /\bname\s*:\s*`([^`]+)`|\bname\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"|\bname\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  let m;
  while ((m = nameRegex.exec(content)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3] ?? '';
    if (!raw) continue;
    names.push(raw);
  }
  // Fallback: derive from id if no name found in some entries (rare)
  if (names.length === 0) {
    const idRegex = /\bid\s*:\s*"([^"]+)"|\bid\s*:\s*'([^']+)'/g;
    while ((m = idRegex.exec(content)) !== null) {
      const raw = (m[1] ?? m[2] ?? '').trim();
      if (!raw) continue;
      // strip potential library prefix like `${lib}-`
      const parts = raw.split('-');
      names.push(parts.slice(1).join('-') || raw);
    }
  }
  // Normalize -> URL-safe and dedupe
  const safe = names.map(iconNameToUrlSafe).filter(Boolean);
  return Array.from(new Set(safe));
}

function generateSitemapIndex() {
  const lastmod = new Date().toISOString().split('T')[0];
  const entries = [
    `  <sitemap>\n    <loc>${DOMAIN}/sitemap-main.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ];
  for (const id of LIBRARIES) {
    entries.push(`  <sitemap>\n    <loc>${DOMAIN}/sitemap-${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>`;
}

function generateMainSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];
  const urls = [];
  urls.push(`  <url>\n    <loc>${DOMAIN}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);
  urls.push(`  <url>\n    <loc>${DOMAIN}/demo/icons</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  for (const id of LIBRARIES) {
    urls.push(`  <url>\n    <loc>${DOMAIN}/library/${id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
}

function generateLibrarySitemap(libraryId, iconNames) {
  const lastmod = new Date().toISOString().split('T')[0];
  const limited = iconNames.slice(0, MAX_URLS_PER_SITEMAP);
  const urls = limited.map(name => `  <url>\n    <loc>${DOMAIN}/icon/${libraryId}/${name}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  const publicDir = path.join(__dirname, '..', 'public');
  ensureDirForFile(path.join(publicDir, 'sitemap.xml'));

  let grandTotal = 0;
  const perLibCounts = {};

  // Parse and generate per-library sitemaps
  for (const id of LIBRARIES) {
    const tsPath = path.join(dataDir, `${id}.ts`);
    if (!fs.existsSync(tsPath)) {
      console.warn(`⚠️  Missing data file: ${tsPath}`);
      perLibCounts[id] = 0;
      continue;
    }
    const content = fs.readFileSync(tsPath, 'utf8');
    const names = parseIconNamesFromTs(content);
    perLibCounts[id] = names.length;
    grandTotal += names.length;

    const xml = generateLibrarySitemap(id, names);
    const outPath = path.join(publicDir, `sitemap-${id}.xml`);
    fs.writeFileSync(outPath, xml);
    console.log(`✅ Wrote ${outPath} with ${names.length} URLs`);
  }

  // Index and main
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemapIndex());
  fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), generateMainSitemap());

  console.log('\n📊 Summary');
  Object.entries(perLibCounts).forEach(([k, v]) => console.log(` - ${k}: ${v}`));
  console.log(`Total icon URLs: ${grandTotal}`);
}

// Run if called directly
// Always run when executed via Node
main().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});

export {};
