#!/usr/bin/env node
/**
 * Tabler stores tags + category inside the SVG `<!-- ... -->` header comment
 * (legacy from the upstream tabler-icons repo). This one-off script promotes
 * those values to proper top-level `tags: [...]` and `category: "..."` fields
 * on each icon so the rest of our tooling (search index, AI enrichment, MCP)
 * can see them.
 *
 * Idempotent: if an icon already has top-level tags/category, we MERGE the
 * comment values in (deduped, lowercased) instead of overwriting.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(__dirname, '../src/data/tabler.ts');

const src = fs.readFileSync(FILE, 'utf8');

// Walk each icon object literal
const idRegex = /id:\s*"([^"]+)"/g;
const positions = [];
let m;
while ((m = idRegex.exec(src)) !== null) positions.push({ start: m.index, id: m[1] });

let out = src;
const offsets = [];
for (let i = 0; i < positions.length; i++) {
  const startIdx = positions[i].start;
  // Find object start `{` going backwards
  let openIdx = src.lastIndexOf('{', startIdx);
  // Find matching close `}`
  let depth = 0, endIdx = -1;
  for (let j = openIdx; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { endIdx = j; break; } }
    else if (c === '"') { j++; while (j < src.length && src[j] !== '"') { if (src[j] === '\\') j++; j++; } }
    else if (c === '`') { j++; while (j < src.length && src[j] !== '`') { if (src[j] === '\\') j++; j++; } }
  }
  if (endIdx === -1) continue;
  offsets.push({ id: positions[i].id, openIdx, endIdx });
}

// Process in reverse so byte offsets remain valid
let touched = 0, withTags = 0, withCat = 0;
for (let i = offsets.length - 1; i >= 0; i--) {
  const { id, openIdx, endIdx } = offsets[i];
  let block = out.slice(openIdx, endIdx + 1);

  // Pull tags + category from comment
  const commentMatch = block.match(/`<!--([\s\S]*?)-->/);
  if (!commentMatch) continue;
  const comment = commentMatch[1];

  const tagMatch = comment.match(/tags:\s*\[([^\]]*)\]/);
  const catMatch = comment.match(/category:\s*([^\n\r]+)/);

  const commentTags = tagMatch
    ? tagMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, '').toLowerCase()).filter(Boolean)
    : [];
  const commentCat = catMatch ? catMatch[1].trim().replace(/^["']|["']$/g, '').toLowerCase() : '';

  if (!commentTags.length && !commentCat) continue;

  // Split block into svg-template part and metadata-tail part. We only want
  // to read/write the metadata tail, never the comment inside the SVG.
  const cmIdx = commentMatch.index ?? block.indexOf('`<!--');
  const tailStart = block.indexOf('`,', cmIdx);
  if (tailStart === -1) continue;
  const head = block.slice(0, tailStart + 2); // include the closing "`,"
  let tail = block.slice(tailStart + 2);

  const existingTagsMatch = tail.match(/(\n\s*)tags:\s*\[([^\]]*)\]/);
  const existingTags = existingTagsMatch
    ? [...existingTagsMatch[2].matchAll(/"([^"]*)"/g)].map(x => x[1])
    : [];
  const merged = [];
  const seen = new Set();
  for (const t of [...existingTags, ...commentTags]) {
    const n = t.toLowerCase().trim();
    if (n && !seen.has(n)) { seen.add(n); merged.push(n); }
  }

  const tagsLiteral = `[${merged.map(t => JSON.stringify(t)).join(', ')}]`;

  if (existingTagsMatch) {
    tail = tail.replace(/(\n\s*)tags:\s*\[[^\]]*\]/, `$1tags: ${tagsLiteral}`);
  } else if (merged.length) {
    tail = tail.replace(/(\n\s*)\}$/, `,$1  tags: ${tagsLiteral}$1}`);
    withTags++;
  }

  if (commentCat) {
    const existingCatMatch = tail.match(/(\n\s*)category:\s*"([^"]*)"/);
    if (existingCatMatch) {
      if (!existingCatMatch[2]) {
        tail = tail.replace(/(\n\s*)category:\s*"[^"]*"/, `$1category: ${JSON.stringify(commentCat)}`);
      }
    } else {
      tail = tail.replace(/(\n\s*)\}$/, `,$1  category: ${JSON.stringify(commentCat)}$1}`);
      withCat++;
    }
  }

  block = head + tail;
  out = out.slice(0, openIdx) + block + out.slice(endIdx + 1);
  touched++;
}

fs.writeFileSync(FILE, out);
console.log(`✔ tabler: touched ${touched} icons (added top-level tags on ${withTags}, category on ${withCat})`);
