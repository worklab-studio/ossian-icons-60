#!/usr/bin/env node
/**
 * AI Tag Enrichment with Gemini 2.5 Flash
 *
 * Usage:
 *   node scripts/enrich-tags-ai.js <library>           # e.g. feather
 *   node scripts/enrich-tags-ai.js <library> --dry     # preview only, no file write
 *   node scripts/enrich-tags-ai.js --all               # all libraries (skips done ones)
 *   node scripts/enrich-tags-ai.js --resume            # continue from checkpoint
 *
 * For each icon, asks Gemini for 6-10 short lowercase tags + a category, then
 * merges into the existing data file in-place. Safe to interrupt and resume.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data');
const PROGRESS_FILE = path.join(__dirname, '.enrichment-progress.json');
const ENV_FILE = path.join(__dirname, '.env');

// ---------- env loading ----------
if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY missing. Set it in scripts/.env or as env var.');
  process.exit(1);
}

// ---------- library catalog ----------
const LIBRARIES = [
  { id: 'feather',    file: 'feather.ts',    exportName: 'featherIcons',    style: 'outline', kind: 'standard' },
  { id: 'radix',      file: 'radix.ts',      exportName: 'radixIcons',      style: 'outline', kind: 'standard' },
  { id: 'pixelart',   file: 'pixelart.ts',   exportName: 'pixelartIcons',   style: 'pixel',   kind: 'standard' },
  { id: 'octicons',   file: 'octicons.ts',   exportName: 'octiconsIcons',   style: 'outline', kind: 'standard' },
  { id: 'iconamoon',  file: 'iconamoon.ts',  exportName: 'iconamoonIcons',  style: 'outline', kind: 'standard' },
  { id: 'heroicons',  file: 'heroicons.ts',  exportName: 'heroiconsIcons',  style: 'mixed',   kind: 'standard' },
  { id: 'majesticon', file: 'majesticon.ts', exportName: 'majesticonIcons', style: 'outline', kind: 'standard' },
  { id: 'line',       file: 'line.ts',       exportName: 'lineIcons',       style: 'outline', kind: 'standard' },
  { id: 'iconsax',    file: 'iconsax.ts',    exportName: 'iconsaxIcons',    style: 'twotone', kind: 'standard' },
  { id: 'iconoir',    file: 'iconoir.ts',    exportName: 'iconoirIcons',    style: 'mixed',   kind: 'standard' },
  { id: 'lucide',     file: 'lucide.ts',     exportName: 'lucideIcons',     style: 'outline', kind: 'standard' },
  { id: 'bootstrap',  file: 'bootstrap.ts',  exportName: 'bootstrapIcons',  style: 'mixed',   kind: 'standard' },
  { id: 'carbon',     file: 'carbon.ts',     exportName: 'carbonIcons',     style: 'mixed',   kind: 'standard' },
  { id: 'octicons',   file: 'octicons.ts',   exportName: 'octiconsIcons',   style: 'outline', kind: 'standard' },
  { id: 'solar',      file: 'solar.ts',      exportName: 'solarIcons',      style: 'outline', kind: 'standard' },
  { id: 'mingcute',   file: 'mingcute.ts',   exportName: 'mingcuteIcons',   style: 'mixed',   kind: 'standard' },
  { id: 'tabler',     file: 'tabler.ts',     exportName: 'tablerIcons',     style: 'outline', kind: 'standard' },
  { id: 'material',   file: 'material.ts',   exportName: 'materialIcons',   style: 'outline', kind: 'standard' },
  { id: 'hugeicon',   file: 'hugeicon.ts',   exportName: 'hugeiconIcons',   style: 'outline', kind: 'standard' },
  { id: 'fluent-ui',  file: 'fluent-ui.ts',  exportName: 'fluentUiIcons',   style: 'mixed',   kind: 'standard' },
  { id: 'phosphor',   file: 'phosphor.ts',   exportName: 'phosphorIcons',   style: 'mixed',   kind: 'standard' },
  // brand libraries: lighter pass
  { id: 'simple',     file: 'simple.ts',     exportName: 'simpleIcons',     style: 'brand',   kind: 'brand' },
  { id: 'devicon',    file: 'devicon.ts',    exportName: 'deviconIcons',    style: 'brand',   kind: 'brand' },
];

const BATCH_SIZE = 25;
const REQUEST_DELAY_MS = 600; // ~1.6 req/s — safe under free tier limits
const MAX_RETRIES = 4;
const MAX_TAGS_PER_ICON = 15;
const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ---------- progress ----------
function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { return {}; }
}
function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ---------- icon parsing ----------
// Pulls minimal {id, name, tags, style} from a data .ts file via regex.
// We only need the array literal contents; svg strings can be huge but we don't care about them here.
function parseIconsFromFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const icons = [];
  // Each icon object opens with `id: "..."`. Use a stateful walker.
  const idRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
  let m;
  const positions = [];
  while ((m = idRegex.exec(src)) !== null) {
    positions.push({ start: m.index, id: m[1], name: m[2] });
  }
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : src.length;
    const block = src.slice(start, end);
    const styleMatch = block.match(/style:\s*"([^"]*)"/);
    const categoryMatch = block.match(/category:\s*"([^"]*)"/);
    const tagsMatch = block.match(/tags:\s*\[([^\]]*)\]/);
    const tags = tagsMatch
      ? [...tagsMatch[1].matchAll(/"([^"]*)"/g)].map(x => x[1])
      : [];
    icons.push({
      id: positions[i].id,
      name: positions[i].name,
      style: styleMatch ? styleMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : '',
      tags,
    });
  }
  return { src, icons };
}

// ---------- prompt building ----------
function buildPrompt(library, batch) {
  const isBrand = library.kind === 'brand';
  const minimal = batch.map(i => ({
    id: i.id,
    name: i.name,
    existing_tags: i.tags,
  }));

  if (isBrand) {
    return `You enrich BRAND/LOGO icon metadata for an icon search engine.

For each icon below (which represents a company, product, framework, or technology), return:
- "tags": 4-8 short lowercase search tags. Include common synonyms, abbreviations, and category keywords (e.g. "frontend", "database", "payments", "cloud", "language", "framework", "messaging"). Skip the obvious brand name itself.
- "category": one of: language, framework, database, cloud, devtool, design, payments, social, messaging, media, productivity, ecommerce, ai, analytics, security, gaming, finance, hardware, browser, os, other.

Return ONLY a JSON array. No prose. No markdown.
Schema: [{"id": string, "tags": string[], "category": string}]

Input icons:
${JSON.stringify(minimal)}`;
  }

  return `You enrich icon metadata for an icon search engine.

For each icon below, return 6-10 short lowercase search tags covering:
- concepts (e.g. "growth", "security", "automation", "community")
- use cases (e.g. "empty state", "onboarding", "dashboard", "cta", "nav")
- mood / tone (e.g. "playful", "serious", "minimal", "friendly")
- visual descriptors (e.g. "rounded", "geometric", "circular", "arrow", "filled")
- common synonyms or alternate names users actually search for

Skip the obvious — the icon's literal name is already indexed. No duplicates of existing_tags.
Also pick ONE "category" from: navigation, communication, system, media, commerce, file, weather, transport, social, device, ui, arrow, finance, health, education, security, time, nature, food, sport, tool, other.

Return ONLY a JSON array. No prose. No markdown.
Schema: [{"id": string, "tags": string[], "category": string}]

Input icons:
${JSON.stringify(minimal)}`;
}

// ---------- gemini call ----------
async function callGemini(prompt, attempt = 1) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 16384,
      thinkingConfig: { thinkingBudget: 0 }, // disable thinking — pure JSON output
    },
  };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt <= MAX_RETRIES) {
      const wait = Math.min(30000, 2000 * 2 ** (attempt - 1));
      console.warn(`  ⚠ ${res.status}, retrying in ${wait}ms (attempt ${attempt}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, wait));
      return callGemini(prompt, attempt + 1);
    }
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error('No text in Gemini response: ' + JSON.stringify(data).slice(0, 500));
  // Strip accidental code fences
  const cleaned = txt.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let parsed;
  try { parsed = JSON.parse(cleaned); }
  catch (e) { throw new Error('Bad JSON from Gemini: ' + cleaned.slice(0, 300)); }
  if (!Array.isArray(parsed)) throw new Error('Expected array, got: ' + typeof parsed);
  return parsed;
}

// ---------- merge logic ----------
function normalizeTag(t) {
  return String(t || '').toLowerCase().trim().replace(/\s+/g, ' ');
}
function mergeTags(existing, incoming) {
  const seen = new Set();
  const out = [];
  for (const t of [...existing, ...incoming]) {
    const n = normalizeTag(t);
    if (!n || n.length > 32 || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_TAGS_PER_ICON) break;
  }
  return out;
}

// ---------- file rewriting ----------
// Rewrites `tags: [...]` and `category: "..."` for each known icon in the source.
function rewriteFile(filePath, src, icons, enrichedById) {
  let out = src;
  // Walk icons in REVERSE so positions stay valid as we splice
  const sortedIcons = [...icons].sort((a, b) => {
    const ai = out.indexOf(`id: "${a.id}"`);
    const bi = out.indexOf(`id: "${b.id}"`);
    return bi - ai;
  });

  for (const icon of sortedIcons) {
    const enriched = enrichedById.get(icon.id);
    if (!enriched) continue;

    const newTags = mergeTags(icon.tags, enriched.tags || []);
    const newCategory = (icon.category && icon.category.trim())
      ? icon.category
      : (enriched.category || '');

    // Find this icon's object block
    const idMarker = `id: "${icon.id}"`;
    const idIdx = out.indexOf(idMarker);
    if (idIdx === -1) continue;
    // Find the closing `}` of this object — match brace depth starting from `{` before id
    let openIdx = out.lastIndexOf('{', idIdx);
    if (openIdx === -1) continue;
    let depth = 0, endIdx = -1;
    for (let i = openIdx; i < out.length; i++) {
      const c = out[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
      // Skip strings (basic — sufficient for our generated data)
      else if (c === '"') {
        i++;
        while (i < out.length && out[i] !== '"') {
          if (out[i] === '\\') i++;
          i++;
        }
      } else if (c === '`') {
        i++;
        while (i < out.length && out[i] !== '`') {
          if (out[i] === '\\') i++;
          i++;
        }
      }
    }
    if (endIdx === -1) continue;
    let block = out.slice(openIdx, endIdx + 1);

    // Replace or insert tags
    const tagsArrayLiteral = `[${newTags.map(t => JSON.stringify(t)).join(', ')}]`;
    if (/tags:\s*\[[^\]]*\]/.test(block)) {
      block = block.replace(/tags:\s*\[[^\]]*\]/, `tags: ${tagsArrayLiteral}`);
    } else {
      // Insert before closing brace
      block = block.replace(/\}$/, `,\n    tags: ${tagsArrayLiteral}\n  }`);
    }

    // Replace or insert category (only if we have one)
    if (newCategory) {
      if (/category:\s*"[^"]*"/.test(block)) {
        block = block.replace(/category:\s*"[^"]*"/, `category: ${JSON.stringify(newCategory)}`);
      } else {
        block = block.replace(/\}$/, `,\n    category: ${JSON.stringify(newCategory)}\n  }`);
      }
    }

    out = out.slice(0, openIdx) + block + out.slice(endIdx + 1);
  }
  fs.writeFileSync(filePath, out);
}

// ---------- main per-library runner ----------
async function enrichLibrary(library, opts = {}) {
  const filePath = path.join(DATA_DIR, library.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ ${library.id}: file not found, skipping`);
    return;
  }
  console.log(`\n📚 ${library.id} (${library.kind})`);
  const { src, icons } = parseIconsFromFile(filePath);
  console.log(`   parsed ${icons.length} icons`);

  const progress = loadProgress();
  const libProgress = progress[library.id] || { doneIds: [] };
  const doneSet = new Set(libProgress.doneIds);
  const todo = icons.filter(i => !doneSet.has(i.id));
  if (todo.length === 0) {
    console.log(`   ✓ already done`);
    return;
  }
  console.log(`   ${todo.length} to process (${doneSet.size} already done)`);

  const enrichedById = new Map();
  const startedAt = Date.now();
  let processed = 0;

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const prompt = buildPrompt(library, batch);
    let result;
    try {
      result = await callGemini(prompt);
    } catch (e) {
      console.error(`  ✗ batch ${i}-${i + batch.length} failed: ${e.message}`);
      // Skip batch, continue
      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
      continue;
    }
    for (const r of result) {
      if (r && r.id) enrichedById.set(r.id, r);
      doneSet.add(r.id);
    }
    processed += batch.length;
    const pct = Math.round((processed / todo.length) * 100);
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`   batch ${i / BATCH_SIZE + 1}/${Math.ceil(todo.length / BATCH_SIZE)} done — ${pct}% — ${elapsed}s`);

    // Checkpoint after each batch
    if (!opts.dry) {
      libProgress.doneIds = [...doneSet];
      progress[library.id] = libProgress;
      saveProgress(progress);
    }
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
  }

  if (opts.dry) {
    console.log(`   [dry] would update ${enrichedById.size} icons. Sample:`);
    let n = 0;
    for (const [id, e] of enrichedById) {
      if (n++ >= 5) break;
      const orig = icons.find(x => x.id === id);
      console.log(`     ${id}: tags ${JSON.stringify(orig.tags)} → +${JSON.stringify(e.tags)} | category=${e.category}`);
    }
    return;
  }

  console.log(`   ✏ rewriting ${library.file} ...`);
  rewriteFile(filePath, src, icons, enrichedById);
  console.log(`   ✓ done`);
}

// ---------- entry ----------
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const all = args.includes('--all');
  const resume = args.includes('--resume');
  const target = args.find(a => !a.startsWith('--'));

  let toRun;
  if (all || resume) {
    toRun = LIBRARIES;
  } else if (target) {
    toRun = LIBRARIES.filter(l => l.id === target);
    if (toRun.length === 0) {
      console.error(`Unknown library: ${target}`);
      console.error(`Available: ${LIBRARIES.map(l => l.id).join(', ')}`);
      process.exit(1);
    }
  } else {
    console.log('Usage: node scripts/enrich-tags-ai.js <library> [--dry]');
    console.log('       node scripts/enrich-tags-ai.js --all');
    console.log(`Libraries: ${LIBRARIES.map(l => l.id).join(', ')}`);
    process.exit(0);
  }

  for (const lib of toRun) {
    try {
      await enrichLibrary(lib, { dry });
    } catch (e) {
      console.error(`💥 ${lib.id} failed: ${e.message}`);
    }
  }
  console.log('\n✅ all done');
}

main().catch(e => { console.error(e); process.exit(1); });
