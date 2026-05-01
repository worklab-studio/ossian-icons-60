#!/usr/bin/env node
/**
 * Build all sitemaps directly from public/api/icons-index.json.
 * This is the single source of truth: 51,378 icons across 21 libraries.
 *
 * Replaces the older `generate-sitemaps.js` which silently produced empty
 * files for libraries whose `src/data/<lib>.ts` re-exports a JSON file
 * (material, simple) — Node's dynamic import of those .ts modules failed.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMAIN = 'https://iconstack.io';
const PUBLIC_DIR = join(__dirname, '..', 'public');
const INDEX_PATH = join(PUBLIC_DIR, 'api', 'icons-index.json');

const LIBRARIES = [
  { id: 'tabler', name: 'Tabler' },
  { id: 'feather', name: 'Feather' },
  { id: 'solar', name: 'Solar' },
  { id: 'phosphor', name: 'Phosphor' },
  { id: 'bootstrap', name: 'Bootstrap' },
  { id: 'iconsax', name: 'Iconsax' },
  { id: 'radix', name: 'Radix' },
  { id: 'line', name: 'Line' },
  { id: 'pixelart', name: 'Pixel Art' },
  { id: 'hugeicon', name: 'Huge Icons' },
  { id: 'mingcute', name: 'Mingcute' },
  { id: 'heroicons', name: 'Heroicons' },
  { id: 'material', name: 'Material Design' },
  { id: 'fluent-ui', name: 'Fluent UI' },
  { id: 'lucide', name: 'Lucide' },
  { id: 'carbon', name: 'Carbon' },
  { id: 'iconamoon', name: 'Iconamoon' },
  { id: 'iconoir', name: 'Iconoir' },
  { id: 'majesticon', name: 'Majesticon' },
  { id: 'simple', name: 'Brand' },
  { id: 'octicons', name: 'Octicons' },
];

const CATEGORY_SLUGS = [
  'arrow','navigation','user','communication','media','file','weather','shopping',
  'social','device','chart','editing','security','calendar','map','settings',
  'notification','heart','star','home','search','download-upload','cloud','code',
  'education','food','health','finance','transport','animal','sport','building',
  'music','camera','power-energy','layout-grid','text-typography','shape','toggle',
  'flag','gift','tools','database','wifi','battery','clipboard','bookmark',
  'filter-sort','refresh-sync','link','eye','nature','ai','api'
];

function urlSafe(name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function xmlUrl({ loc, lastmod, changefreq = 'monthly', priority = '0.6' }) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function wrapUrlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

async function main() {
  console.log('🚀 Generating sitemaps from icons-index.json...');
  const lastmod = new Date().toISOString().split('T')[0];

  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
  const icons = index.icons || index;
  console.log(`📚 Loaded ${icons.length.toLocaleString()} icons`);

  // Bucket icons by library
  const byLib = new Map();
  for (const lib of LIBRARIES) byLib.set(lib.id, []);
  for (const icon of icons) {
    const lib = icon.l || icon.library;
    if (!byLib.has(lib)) continue;
    const name = icon.n || icon.name || icon.id;
    byLib.get(lib).push(urlSafe(name));
  }

  // ---- Library sitemaps ----
  let totalIconUrls = 0;
  for (const lib of LIBRARIES) {
    const slugs = byLib.get(lib.id) || [];
    const urls = slugs.map(slug =>
      xmlUrl({ loc: `${DOMAIN}/icon/${lib.id}/${slug}`, lastmod, priority: '0.6' })
    );
    const path = join(PUBLIC_DIR, `sitemap-${lib.id}.xml`);
    ensureDir(path);
    writeFileSync(path, wrapUrlset(urls));
    totalIconUrls += urls.length;
    console.log(`  ✅ sitemap-${lib.id}.xml: ${urls.length} URLs`);
  }

  // ---- Main sitemap ----
  const mainUrls = [
    xmlUrl({ loc: `${DOMAIN}/`, lastmod, changefreq: 'weekly', priority: '1.0' }),
    xmlUrl({ loc: `${DOMAIN}/api`, lastmod, changefreq: 'weekly', priority: '0.9' }),
    xmlUrl({ loc: `${DOMAIN}/blog`, lastmod, changefreq: 'weekly', priority: '0.8' }),
    xmlUrl({ loc: `${DOMAIN}/license`, lastmod, changefreq: 'yearly', priority: '0.4' }),
    xmlUrl({ loc: `${DOMAIN}/demo/icons`, lastmod, changefreq: 'monthly', priority: '0.5' }),
    ...LIBRARIES.map(lib =>
      xmlUrl({ loc: `${DOMAIN}/library/${lib.id}`, lastmod, changefreq: 'weekly', priority: '0.9' })
    ),
  ];
  writeFileSync(join(PUBLIC_DIR, 'sitemap-main.xml'), wrapUrlset(mainUrls));
  console.log(`  ✅ sitemap-main.xml: ${mainUrls.length} URLs`);

  // ---- Categories sitemap (category pages) ----
  const catUrls = CATEGORY_SLUGS.map(slug =>
    xmlUrl({ loc: `${DOMAIN}/icons/${slug}`, lastmod, changefreq: 'monthly', priority: '0.7' })
  );
  writeFileSync(join(PUBLIC_DIR, 'sitemap-categories.xml'), wrapUrlset(catUrls));
  console.log(`  ✅ sitemap-categories.xml: ${catUrls.length} URLs`);

  // ---- Collections sitemap (category × library + comparisons) ----
  const colUrls = [];
  for (const slug of CATEGORY_SLUGS) {
    for (const lib of LIBRARIES) {
      colUrls.push(xmlUrl({
        loc: `${DOMAIN}/icons/${slug}/${lib.id}`, lastmod, priority: '0.6',
      }));
    }
  }
  for (let i = 0; i < LIBRARIES.length; i++) {
    for (let j = i + 1; j < LIBRARIES.length; j++) {
      colUrls.push(xmlUrl({
        loc: `${DOMAIN}/compare/${LIBRARIES[i].id}-vs-${LIBRARIES[j].id}`,
        lastmod, priority: '0.7',
      }));
    }
  }
  writeFileSync(join(PUBLIC_DIR, 'sitemap-collections.xml'), wrapUrlset(colUrls));
  console.log(`  ✅ sitemap-collections.xml: ${colUrls.length} URLs`);

  // ---- Blog sitemap (best-effort, fetches from Sanity if possible) ----
  let blogUrls = [
    xmlUrl({ loc: `${DOMAIN}/blog`, lastmod, changefreq: 'weekly', priority: '0.8' }),
  ];
  try {
    const projectId = 'gx6pftyq'; // public Sanity project — safe to hardcode for sitemap
    const dataset = 'production';
    const query = encodeURIComponent('*[_type=="post" && defined(slug.current)]{slug,_updatedAt}');
    const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      const posts = json.result || [];
      for (const p of posts) {
        const slug = p.slug?.current;
        if (!slug) continue;
        const updated = (p._updatedAt || lastmod).split('T')[0];
        blogUrls.push(xmlUrl({
          loc: `${DOMAIN}/blog/${slug}`, lastmod: updated, changefreq: 'monthly', priority: '0.7',
        }));
      }
      console.log(`  ✅ sitemap-blog.xml: ${blogUrls.length} URLs (fetched ${posts.length} posts from Sanity)`);
    } else {
      console.log(`  ⚠️  sitemap-blog.xml: Sanity fetch failed (${res.status}), wrote index only`);
    }
  } catch (e) {
    console.log(`  ⚠️  sitemap-blog.xml: Sanity fetch error (${e.message}), wrote index only`);
  }
  writeFileSync(join(PUBLIC_DIR, 'sitemap-blog.xml'), wrapUrlset(blogUrls));

  // ---- Sitemap index ----
  const childSitemaps = [
    'sitemap-main.xml',
    'sitemap-categories.xml',
    'sitemap-collections.xml',
    'sitemap-blog.xml',
    ...LIBRARIES.map(l => `sitemap-${l.id}.xml`),
  ];
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${childSitemaps.map(name => `  <sitemap>
    <loc>${DOMAIN}/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), indexXml);

  const grandTotal = totalIconUrls + mainUrls.length + catUrls.length + colUrls.length + blogUrls.length;
  console.log(`\n🎉 Done. ${grandTotal.toLocaleString()} URLs across ${childSitemaps.length} sitemaps.`);
}

main().catch(err => { console.error(err); process.exit(1); });
