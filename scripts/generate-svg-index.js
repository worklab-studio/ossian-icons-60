#!/usr/bin/env node
/**
 * Generates public/api/icons-svg.json — a flat { "library/id": "<svg>...</svg>" }
 * map for every icon, used by the icon-svg edge function (and MCP server).
 *
 * Run: node scripts/generate-svg-index.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data');
const OUT_PATH = path.join(ROOT, 'public/api/icons-svg.json');

const LIBRARIES = [
  { id: 'tabler',     file: 'tabler.ts'     },
  { id: 'feather',    file: 'feather.ts'    },
  { id: 'solar',      file: 'solar.ts'      },
  { id: 'phosphor',   file: 'phosphor.ts'   },
  { id: 'bootstrap',  file: 'bootstrap.ts'  },
  { id: 'iconsax',    file: 'iconsax.ts'    },
  { id: 'radix',      file: 'radix.ts'      },
  { id: 'line',       file: 'line.ts'       },
  { id: 'pixelart',   file: 'pixelart.ts'   },
  { id: 'hugeicon',   file: 'hugeicon.ts'   },
  { id: 'mingcute',   file: 'mingcute.ts'   },
  { id: 'heroicons',  file: 'heroicons.ts'  },
  { id: 'material',   file: 'material.ts'   },
  { id: 'fluent-ui',  file: 'fluent-ui.ts'  },
  { id: 'lucide',     file: 'lucide.ts'     },
  { id: 'carbon',     file: 'carbon.ts'     },
  { id: 'iconamoon',  file: 'iconamoon.ts'  },
  { id: 'iconoir',    file: 'iconoir.ts'    },
  { id: 'majesticon', file: 'majesticon.ts' },
  { id: 'simple',     file: 'simple.ts'     },
  { id: 'octicons',   file: 'octicons.ts'   },
];

function extractIdAndSvg(block) {
  const idMatch = block.match(/id\s*:\s*(["'])((?:\\.|(?!\1).)*)\1/);
  if (!idMatch) return null;
  const id = idMatch[2];
  // svg can be a backtick template OR a quoted string
  const tplMatch = block.match(/svg\s*:\s*`([\s\S]*?)`/);
  let svg;
  if (tplMatch) svg = tplMatch[1];
  else {
    const qMatch = block.match(/svg\s*:\s*(["'])((?:\\.|(?!\1).)*)\1/);
    if (qMatch) svg = qMatch[2].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  if (!svg) return null;
  return { id, svg: svg.trim() };
}

function parseTsFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const out = [];
  const startIdx = src.indexOf('= [');
  if (startIdx === -1) return out;
  let i = src.indexOf('{', startIdx);
  while (i !== -1) {
    let depth = 0, j = i;
    let inStr = false, strCh = '', inTpl = false;
    while (j < src.length) {
      const c = src[j], prev = src[j - 1];
      if (inStr) { if (c === strCh && prev !== '\\') inStr = false; }
      else if (inTpl) { if (c === '`' && prev !== '\\') inTpl = false; }
      else {
        if (c === '"' || c === "'") { inStr = true; strCh = c; }
        else if (c === '`') inTpl = true;
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) break; }
      }
      j++;
    }
    const block = src.slice(i, j + 1);
    const item = extractIdAndSvg(block);
    if (item) out.push(item);
    i = src.indexOf('{', j + 1);
    const closeBracket = src.indexOf(']', j);
    if (closeBracket !== -1 && (i === -1 || closeBracket < i)) break;
  }
  return out;
}

console.log('Building SVG index...');
const map = {};
let total = 0;

for (const lib of LIBRARIES) {
  const tsPath = path.join(DATA_DIR, lib.file);
  const jsonPath = path.join(DATA_DIR, lib.file.replace(/\.ts$/, '.json'));
  let icons = [];
  if (fs.existsSync(jsonPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    icons = raw.filter(ic => ic.id && ic.svg).map(ic => ({ id: ic.id, svg: ic.svg }));
  } else if (fs.existsSync(tsPath)) {
    icons = parseTsFile(tsPath);
  } else {
    console.warn(`  skip ${lib.id}`);
    continue;
  }
  console.log(`  ${lib.id.padEnd(12)} ${icons.length} icons`);
  for (const ic of icons) {
    // strip the library prefix from id to keep keys short
    const shortId = ic.id.startsWith(`${lib.id}-`) ? ic.id.slice(lib.id.length + 1) : ic.id;
    map[`${lib.id}/${shortId}`] = ic.svg;
    total++;
  }
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(map));
const sizeMb = (fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2);
console.log(`\nWrote ${total} svgs -> public/api/icons-svg.json (${sizeMb} MB)`);
