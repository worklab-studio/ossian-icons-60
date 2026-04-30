#!/usr/bin/env node
/**
 * Generates public/api/icons-index.json — a compact snapshot of every icon's
 * searchable metadata (id, name, library, style, category, tags). SVG bodies
 * are intentionally excluded to keep size down (~1MB gzipped vs ~50MB).
 *
 * Used by the public icon-search edge function.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data');
const OUT_PATH = path.join(ROOT, 'public/api/icons-index.json');

// Library metadata (mirrors IconLibraryManager) -----------------------------
const LIBRARIES = [
  { id: 'tabler',     file: 'tabler.ts',     export: 'tablerIcons',     name: 'Tabler',          style: 'outline' },
  { id: 'feather',    file: 'feather.ts',    export: 'featherIcons',    name: 'Feather',         style: 'outline' },
  { id: 'solar',      file: 'solar.ts',      export: 'solarIcons',      name: 'Solar',           style: 'outline' },
  { id: 'phosphor',   file: 'phosphor.ts',   export: 'phosphorIcons',   name: 'Phosphor',        style: 'mixed'   },
  { id: 'bootstrap',  file: 'bootstrap.ts',  export: 'bootstrapIcons',  name: 'Bootstrap',       style: 'mixed'   },
  { id: 'iconsax',    file: 'iconsax.ts',    export: 'iconsaxIcons',    name: 'Iconsax',         style: 'twotone' },
  { id: 'radix',      file: 'radix.ts',      export: 'radixIcons',      name: 'Radix',           style: 'outline' },
  { id: 'line',       file: 'line.ts',       export: 'lineIcons',       name: 'Line',            style: 'outline' },
  { id: 'pixelart',   file: 'pixelart.ts',   export: 'pixelartIcons',   name: 'Pixel Art',       style: 'pixel'   },
  { id: 'hugeicon',   file: 'hugeicon.ts',   export: 'hugeiconIcons',   name: 'Huge Icons',      style: 'outline' },
  { id: 'mingcute',   file: 'mingcute.ts',   export: 'mingcuteIcons',   name: 'Mingcute',        style: 'mixed'   },
  { id: 'heroicons',  file: 'heroicons.ts',  export: 'heroiconsIcons',  name: 'Heroicons',       style: 'mixed'   },
  { id: 'material',   file: 'material.ts',   export: 'materialIcons',   name: 'Material Design', style: 'outline' },
  { id: 'fluent-ui',  file: 'fluent-ui.ts',  export: 'fluentUiIcons',   name: 'Fluent UI',       style: 'mixed'   },
  { id: 'lucide',     file: 'lucide.ts',     export: 'lucideIcons',     name: 'Lucide',          style: 'outline' },
  { id: 'carbon',     file: 'carbon.ts',     export: 'carbonIcons',     name: 'Carbon',          style: 'mixed'   },
  { id: 'iconamoon',  file: 'iconamoon.ts',  export: 'iconamoonIcons',  name: 'Iconamoon',       style: 'outline' },
  { id: 'iconoir',    file: 'iconoir.ts',    export: 'iconoirIcons',    name: 'Iconoir',         style: 'mixed'   },
  { id: 'majesticon', file: 'majesticon.ts', export: 'majesticonIcons', name: 'Majesticon',      style: 'outline' },
  { id: 'simple',     file: 'simple.ts',     export: 'simpleIcons',     name: 'Brand',           style: 'brand'   },
  { id: 'octicons',   file: 'octicons.ts',   export: 'octiconsIcons',   name: 'Octicons',        style: 'outline' },
];

// Parse one icon object literal (we control the generator format) ----------
function extractField(block, field) {
  // Match: field: "value"  OR  field: 'value'
  const re = new RegExp(`${field}\\s*:\\s*(["'\\\`])((?:\\\\.|(?!\\1).)*)\\1`);
  const m = block.match(re);
  return m ? m[2] : undefined;
}

function extractArrayField(block, field) {
  const re = new RegExp(`${field}\\s*:\\s*\\[([^\\]]*)\\]`);
  const m = block.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)].map(x => x[2]);
}

function parseLibraryFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  // Each icon block starts with `{` and contains `id: "..."`. Split on `},`
  // followed by newline + whitespace + `{` (icon boundaries in our generator).
  const items = [];
  // Cheap iterator: walk balanced braces from each `{` after `[`
  const startIdx = src.indexOf('= [');
  if (startIdx === -1) return items;
  let i = src.indexOf('{', startIdx);
  while (i !== -1) {
    let depth = 0;
    let j = i;
    let inStr = false;
    let strCh = '';
    let inTpl = false;
    while (j < src.length) {
      const c = src[j];
      const prev = src[j - 1];
      if (inStr) {
        if (c === strCh && prev !== '\\') inStr = false;
      } else if (inTpl) {
        if (c === '`' && prev !== '\\') inTpl = false;
      } else {
        if (c === '"' || c === "'") { inStr = true; strCh = c; }
        else if (c === '`') { inTpl = true; }
        else if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) { break; }
        }
      }
      j++;
    }
    const block = src.slice(i, j + 1);
    const id = extractField(block, 'id');
    const name = extractField(block, 'name');
    if (id && name) {
      items.push({
        id,
        n: name,
        s: extractField(block, 'style') || '',
        c: extractField(block, 'category') || '',
        t: extractArrayField(block, 'tags'),
      });
    }
    i = src.indexOf('{', j + 1);
    // Stop when we exit the array literal
    const closeBracket = src.indexOf(']', j);
    if (closeBracket !== -1 && (i === -1 || closeBracket < i)) break;
  }
  return items;
}

// Build index --------------------------------------------------------------
console.log('Building search index...');
const libraryMeta = {};
const allIcons = [];

for (const lib of LIBRARIES) {
  const tsPath = path.join(DATA_DIR, lib.file);
  const jsonPath = path.join(DATA_DIR, lib.file.replace(/\.ts$/, '.json'));
  let icons = [];
  if (fs.existsSync(jsonPath)) {
    // Some libraries store icons in a JSON sidecar imported by the .ts file.
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    icons = raw.map(ic => ({
      id: ic.id,
      n: ic.name,
      s: ic.style || '',
      c: ic.category || '',
      t: Array.isArray(ic.tags) ? ic.tags : [],
    })).filter(ic => ic.id && ic.n);
  } else if (fs.existsSync(tsPath)) {
    icons = parseLibraryFile(tsPath);
  } else {
    console.warn(`  skip ${lib.id} — file missing`);
    continue;
  }
  console.log(`  ${lib.id.padEnd(12)} ${icons.length} icons`);
  libraryMeta[lib.id] = { name: lib.name, style: lib.style };
  for (const ic of icons) {
    allIcons.push({ ...ic, l: lib.id });
  }
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(),
  libraries: libraryMeta,
  icons: allIcons,
}));

const sizeMb = (fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2);
console.log(`\nWrote ${allIcons.length} icons across ${Object.keys(libraryMeta).length} libraries`);
console.log(`File: public/api/icons-index.json (${sizeMb} MB)`);
