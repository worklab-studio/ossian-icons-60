// One-off generator for src/data/devicon.ts
// Fetches devicon.json and downloads all SVG variants from jsdelivr,
// then writes a normalized IconItem[] export.
import fs from 'fs';
import path from 'path';
import https from 'https';

const MANIFEST_URL = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.json';
const SVG_URL = (name, variant) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-${variant}.svg`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalizeSvg(svg) {
  // Strip XML declaration and comments
  svg = svg.replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  // Remove width/height attributes from the root <svg>
  svg = svg.replace(/<svg([^>]*)>/, (m, attrs) => {
    let a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    if (!/viewBox=/.test(a)) a += ' viewBox="0 0 128 128"';
    return `<svg${a}>`;
  });
  // Collapse whitespace
  svg = svg.replace(/\s+/g, ' ').trim();
  return svg;
}

function escapeBacktick(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function styleFromVariant(variant) {
  // Map devicon variants to our style taxonomy
  if (variant.includes('line')) return 'line';
  if (variant.includes('plain')) return 'plain';
  return 'original';
}

function categoryFromTags(tags) {
  const t = tags.map((x) => x.toLowerCase());
  if (t.some((x) => ['language', 'programming'].includes(x))) return 'language';
  if (t.some((x) => ['framework', 'library', 'frontend', 'backend'].includes(x))) return 'framework';
  if (t.some((x) => ['database', 'data'].includes(x))) return 'database';
  if (t.some((x) => ['cloud', 'hosting', 'platform'].includes(x))) return 'cloud';
  if (t.some((x) => ['os', 'operating-system'].includes(x))) return 'os';
  if (t.some((x) => ['design', 'design-tool'].includes(x))) return 'design';
  return 'tool';
}

const CONCURRENCY = 16;
async function mapPool(items, fn) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        try {
          results[idx] = await fn(items[idx], idx);
        } catch (e) {
          results[idx] = null;
          console.warn('skip', items[idx], e.message);
        }
      }
    })
  );
  return results;
}

async function main() {
  console.log('Fetching devicon manifest...');
  const manifestRaw = await fetchText(MANIFEST_URL);
  const manifest = JSON.parse(manifestRaw);
  console.log(`Manifest has ${manifest.length} icon entries`);

  // Build (name, variant) tasks (only svg variants)
  const tasks = [];
  for (const entry of manifest) {
    const variants = entry.versions?.svg || [];
    for (const variant of variants) {
      tasks.push({ entry, variant });
    }
  }
  console.log(`Total SVG variants to fetch: ${tasks.length}`);

  let done = 0;
  const items = await mapPool(tasks, async ({ entry, variant }) => {
    const url = SVG_URL(entry.name, variant);
    const svg = await fetchText(url);
    done++;
    if (done % 200 === 0) console.log(`  ${done}/${tasks.length}`);
    return {
      id: `devicon-${entry.name}-${variant}`,
      name: entry.name,
      svg: normalizeSvg(svg),
      style: styleFromVariant(variant),
      category: categoryFromTags(entry.tags || []),
      tags: Array.from(new Set([entry.name, ...(entry.altnames || []), ...(entry.tags || [])])).map(t => String(t).toLowerCase()),
    };
  });

  const valid = items.filter(Boolean);
  console.log(`Successfully fetched ${valid.length}/${tasks.length} icons`);

  // Write TS file
  const out = [];
  out.push(`// Devicon`);
  out.push(`// Generated on: ${new Date().toISOString()}`);
  out.push(`// Total icons: ${valid.length}`);
  out.push('');
  out.push(`import { type IconItem } from '@/types/icon';`);
  out.push('');
  out.push(`export const deviconIcons: IconItem[] = [`);
  for (const it of valid) {
    out.push('  {');
    out.push(`    id: ${JSON.stringify(it.id)},`);
    out.push(`    name: ${JSON.stringify(it.name)},`);
    out.push(`    svg: \`${escapeBacktick(it.svg)}\`,`);
    out.push(`    style: ${JSON.stringify(it.style)},`);
    out.push(`    category: ${JSON.stringify(it.category)},`);
    out.push(`    tags: ${JSON.stringify(it.tags)}`);
    out.push('  },');
  }
  out.push('];');
  out.push('');

  const outPath = path.resolve('src/data/devicon.ts');
  fs.writeFileSync(outPath, out.join('\n'));
  console.log(`Wrote ${outPath} (${valid.length} icons)`);

  // Also save count for downstream use
  fs.writeFileSync('/tmp/devicon-count.txt', String(valid.length));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
