#!/usr/bin/env node
/**
 * Generate static per-library OG images (1200×630 PNG).
 * Each image: dark bg, library name in big type, "Iconstack" wordmark,
 * "51,378 free SVG icons" tagline, and a 6-icon sample grid pulled
 * from public/api/icons-index.json + public/api/svg/<lib>.json.
 *
 * Output: public/og/<library-id>.png
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'og');

const LIBRARIES = [
  { id: 'tabler', name: 'Tabler', tagline: 'Outline icons for the web' },
  { id: 'feather', name: 'Feather', tagline: 'Simply beautiful open icons' },
  { id: 'solar', name: 'Solar', tagline: 'Multi-style icon system' },
  { id: 'phosphor', name: 'Phosphor', tagline: 'Flexible icon family' },
  { id: 'bootstrap', name: 'Bootstrap', tagline: 'Official Bootstrap icons' },
  { id: 'iconsax', name: 'Iconsax', tagline: 'Modern twotone icons' },
  { id: 'radix', name: 'Radix', tagline: '15×15 icons by WorkOS' },
  { id: 'line', name: 'Line', tagline: 'Clean minimal outline icons' },
  { id: 'pixelart', name: 'Pixel Art', tagline: 'Retro 8-bit icons' },
  { id: 'hugeicon', name: 'Huge Icons', tagline: 'Comprehensive outline set' },
  { id: 'mingcute', name: 'Mingcute', tagline: 'Crafted with consistency' },
  { id: 'heroicons', name: 'Heroicons', tagline: 'Hand-crafted by Tailwind' },
  { id: 'material', name: 'Material', tagline: 'Google Material Design' },
  { id: 'fluent-ui', name: 'Fluent UI', tagline: "Microsoft's design system" },
  { id: 'lucide', name: 'Lucide', tagline: 'Beautiful open icons' },
  { id: 'carbon', name: 'Carbon', tagline: "IBM's design system" },
  { id: 'iconamoon', name: 'Iconamoon', tagline: 'Modern outline icons' },
  { id: 'iconoir', name: 'Iconoir', tagline: 'Beautiful open icons' },
  { id: 'majesticon', name: 'Majesticon', tagline: 'Professional outline icons' },
  { id: 'simple', name: 'Brand', tagline: 'Brand & company logos' },
  { id: 'octicons', name: 'Octicons', tagline: "GitHub's icon library" },
];

// Hand-picked icon names that are likely to exist and look good in a sample
const SAMPLE_NAMES = ['home', 'user', 'search', 'heart', 'star', 'settings'];

function loadSvgForLibrary(libraryId) {
  // Try to load 6 sample SVGs from public/api/svg/<lib>.json
  const path = join(ROOT, 'public', 'api', 'svg', `${libraryId}.json`);
  if (!existsSync(path)) {
    console.warn(`⚠️  No SVG file for ${libraryId} at ${path}`);
    return [];
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const icons = data.icons || data;
  const samples = [];
  // Handle both array and object shapes
  if (Array.isArray(icons)) {
    for (const v of icons) {
      if (typeof v === 'string' && v.startsWith('<')) samples.push(v);
      else if (v && typeof v === 'object' && typeof v.svg === 'string') samples.push(v.svg);
      if (samples.length === 6) break;
    }
    return samples;
  }
  // Object: try to find named icons first
  for (const name of SAMPLE_NAMES) {
    const found = Object.entries(icons).find(([k]) =>
      k.toLowerCase() === name || k.toLowerCase().endsWith(`-${name}`) || k.toLowerCase() === `${name}-line`
    );
    if (found && typeof found[1] === 'string') samples.push(found[1]);
    if (samples.length === 6) break;
  }
  // Fall back to first N
  const keys = Object.keys(icons);
  let i = 0;
  while (samples.length < 6 && i < keys.length) {
    const svg = icons[keys[i]];
    if (typeof svg === 'string' && svg.startsWith('<svg')) samples.push(svg);
    i++;
  }
  return samples.slice(0, 6);
}

function normalizeSvg(svg, color = '#ffffff') {
  // Replace any color references with white so it renders on dark bg
  return svg
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(/currentColor/g, color)
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/g, `stroke="${color}"`)
    .replace(/fill="#[0-9a-fA-F]{3,8}"/g, (m) => m.includes('"none"') ? m : `fill="${color}"`)
    .replace(/<svg([^>]*?)>/, (m, attrs) => {
      let a = attrs;
      if (!/width=/.test(a)) a += ' width="80"';
      else a = a.replace(/width="[^"]*"/, 'width="80"');
      if (!/height=/.test(a)) a += ' height="80"';
      else a = a.replace(/height="[^"]*"/, 'height="80"');
      return `<svg${a}>`;
    });
}

function buildOgSvg(lib, samples) {
  const W = 1200, H = 630;
  // Sample grid: 6 icons in 3×2 grid, right side
  const gridW = 3 * 110 + 2 * 20; // 370
  const gridH = 2 * 110 + 1 * 20; // 240
  const gridX = W - gridW - 80;
  const gridY = (H - gridH) / 2;

  const sampleEls = samples.map((svg, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = gridX + col * 130;
    const y = gridY + row * 130;
    const inner = normalizeSvg(svg, '#ffffff');
    return `
      <g transform="translate(${x},${y})">
        <rect x="0" y="0" width="110" height="110" rx="14" fill="#1c2333" />
        <g transform="translate(15,15)">${inner}</g>
      </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <style>
      .title { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-weight: 700; fill: #ffffff; }
      .eyebrow { font-family: 'Inter', system-ui, sans-serif; font-weight: 600; fill: #94a3b8; letter-spacing: 2px; }
      .tagline { font-family: 'Inter', system-ui, sans-serif; font-weight: 400; fill: #cbd5e1; }
      .brand { font-family: 'Inter', system-ui, sans-serif; font-weight: 600; fill: #ffffff; }
      .meta { font-family: 'Inter', system-ui, sans-serif; font-weight: 400; fill: #64748b; }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <!-- Subtle grid lines -->
  <g stroke="#1e293b" stroke-width="1" opacity="0.6">
    <line x1="0" y1="120" x2="${W}" y2="120" />
    <line x1="0" y1="510" x2="${W}" y2="510" />
  </g>

  <!-- Eyebrow -->
  <text x="80" y="180" class="eyebrow" font-size="20">ICON LIBRARY</text>
  <!-- Title -->
  <text x="80" y="260" class="title" font-size="84">${escapeXml(lib.name)}</text>
  <!-- Tagline -->
  <text x="80" y="320" class="tagline" font-size="28">${escapeXml(lib.tagline)}</text>
  <!-- Bottom row -->
  <g>
    <circle cx="100" cy="560" r="20" fill="#3b82f6" />
    <text x="100" y="568" text-anchor="middle" class="brand" font-size="18">i</text>
    <text x="138" y="566" class="brand" font-size="22">Iconstack</text>
    <text x="138" y="592" class="meta" font-size="16">51,378 free MIT icons · iconstack.io</text>
  </g>

  <!-- Icon sample grid -->
  ${sampleEls}
</svg>`;
}

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[c]));
}

function ensureMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return 'magick';
  } catch {
    try {
      execSync('convert -version', { stdio: 'ignore' });
      return 'convert';
    } catch {
      // Use nix
      return 'nix run nixpkgs#imagemagick --';
    }
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const magick = ensureMagick();
  console.log(`🎨 Generating ${LIBRARIES.length} OG images using "${magick}"`);

  let ok = 0;
  for (const lib of LIBRARIES) {
    try {
      const samples = loadSvgForLibrary(lib.id);
      if (samples.length === 0) {
        console.warn(`⚠️  Skipping ${lib.id} — no samples`);
        continue;
      }
      const svg = buildOgSvg(lib, samples);
      const svgPath = join(OUT_DIR, `${lib.id}.svg`);
      const pngPath = join(OUT_DIR, `${lib.id}.png`);
      writeFileSync(svgPath, svg);
      // Convert SVG → PNG
      execSync(`${magick} -background none -density 100 "${svgPath}" -resize 1200x630 "${pngPath}"`, { stdio: 'pipe' });
      // Clean up the intermediate SVG (keep only the PNG)
      execSync(`rm "${svgPath}"`);
      console.log(`  ✅ ${lib.id}.png (${samples.length} samples)`);
      ok++;
    } catch (e) {
      console.error(`  ❌ ${lib.id}: ${e.message}`);
    }
  }
  console.log(`\n🎉 Generated ${ok}/${LIBRARIES.length} OG images in public/og/`);
}

main().catch(err => { console.error(err); process.exit(1); });
