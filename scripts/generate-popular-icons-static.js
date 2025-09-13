#!/usr/bin/env node

/**
 * Generate 500 static popular icons (50 from each of 10 libraries)
 * for immediate HTML rendering and SEO benefits
 */

import fs from 'fs';
import path from 'path';

// Import icon libraries
import { tablerIcons } from '../src/data/tabler.js';
import { heroicons } from '../src/data/heroicons.js';
import { materialIcons } from '../src/data/material.js';
import { lucideIcons } from '../src/data/lucide.js';
import { featherIcons } from '../src/data/feather.js';
import { phosphorIcons } from '../src/data/phosphor.js';
import { bootstrapIcons } from '../src/data/bootstrap.js';
import { solarIcons } from '../src/data/solar.js';
import { carbonIcons } from '../src/data/carbon.js';
import { radixIcons } from '../src/data/radix.js';

// Library configurations
const libraries = [
  { id: 'tabler', name: 'Tabler', icons: tablerIcons },
  { id: 'heroicons', name: 'Heroicons', icons: heroicons },
  { id: 'material', name: 'Material Design', icons: materialIcons },
  { id: 'lucide', name: 'Lucide', icons: lucideIcons },
  { id: 'feather', name: 'Feather', icons: featherIcons },
  { id: 'phosphor', name: 'Phosphor', icons: phosphorIcons },
  { id: 'bootstrap', name: 'Bootstrap', icons: bootstrapIcons },
  { id: 'solar', name: 'Solar', icons: solarIcons },
  { id: 'carbon', name: 'Carbon', icons: carbonIcons },
  { id: 'radix', name: 'Radix', icons: radixIcons }
];

// Priority tags for selecting popular icons
const popularTags = [
  'home', 'user', 'settings', 'search', 'edit', 'delete', 'add', 'heart',
  'star', 'mail', 'phone', 'calendar', 'clock', 'download', 'upload',
  'share', 'check', 'close', 'arrow', 'menu', 'play', 'pause', 'stop',
  'volume', 'wifi', 'bluetooth', 'battery', 'camera', 'image', 'video',
  'music', 'file', 'folder', 'trash', 'lock', 'unlock', 'eye', 'hide',
  'notification', 'bell', 'bookmark', 'tag', 'filter', 'sort', 'refresh',
  'sync', 'loading', 'success', 'error', 'warning', 'info'
];

/**
 * Score an icon based on popularity heuristics
 */
function scoreIcon(icon) {
  let score = 0;
  const name = icon.name.toLowerCase();
  const tags = (icon.tags || []).join(' ').toLowerCase();
  const searchText = `${name} ${tags}`;

  // Higher score for shorter, simpler names
  score += Math.max(0, 20 - name.length);

  // Boost score for popular tags
  popularTags.forEach(tag => {
    if (searchText.includes(tag)) {
      score += 10;
    }
  });

  // Boost for common UI patterns
  if (name.includes('home') || name.includes('house')) score += 20;
  if (name.includes('user') || name.includes('person') || name.includes('profile')) score += 18;
  if (name.includes('settings') || name.includes('config')) score += 16;
  if (name.includes('search') || name.includes('find')) score += 16;
  if (name.includes('edit') || name.includes('pencil')) score += 15;
  if (name.includes('heart') || name.includes('favorite')) score += 15;
  if (name.includes('star') || name.includes('rating')) score += 15;
  if (name.includes('mail') || name.includes('email')) score += 14;
  if (name.includes('phone') || name.includes('call')) score += 14;
  if (name.includes('calendar') || name.includes('date')) score += 14;
  if (name.includes('clock') || name.includes('time')) score += 14;
  if (name.includes('download') || name.includes('upload')) score += 13;
  if (name.includes('share') || name.includes('export')) score += 13;
  if (name.includes('check') || name.includes('tick') || name.includes('success')) score += 12;
  if (name.includes('close') || name.includes('x') || name.includes('cancel')) score += 12;
  if (name.includes('arrow') || name.includes('chevron')) score += 11;
  if (name.includes('menu') || name.includes('hamburger')) score += 11;
  if (name.includes('play') || name.includes('pause') || name.includes('stop')) score += 10;

  // Prefer outline/regular styles over filled
  if (icon.style === 'outline' || icon.style === 'regular' || !icon.style) score += 5;

  return score;
}

/**
 * Ensure SVG string is properly formatted for static rendering
 */
function ensureStaticSvg(icon) {
  if (typeof icon.svg !== 'string') {
    console.warn(`Skipping non-string SVG for ${icon.id}`);
    return null;
  }

  let svgString = icon.svg;
  
  // Ensure proper SVG attributes for static rendering
  if (!svgString.includes('width=') && !svgString.includes('height=')) {
    svgString = svgString.replace('<svg', '<svg width="24" height="24"');
  }
  
  // Ensure viewBox if missing
  if (!svgString.includes('viewBox=')) {
    svgString = svgString.replace('<svg', '<svg viewBox="0 0 24 24"');
  }

  return {
    ...icon,
    svg: svgString
  };
}

/**
 * Generate static popular icons data
 */
function generateStaticData() {
  console.log('🚀 Generating 500 static popular icons...');
  
  const staticSections = [];
  
  for (const library of libraries) {
    console.log(`\n📦 Processing ${library.name}...`);
    
    // Filter string SVGs and score them
    const validIcons = library.icons
      .filter(icon => typeof icon.svg === 'string')
      .map(icon => ({
        ...icon,
        score: scoreIcon(icon)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top 50 icons
    
    console.log(`   Selected ${validIcons.length} icons from ${library.icons.length} total`);
    
    // Convert to static format
    const staticIcons = validIcons
      .map(icon => ensureStaticSvg(icon))
      .filter(Boolean);
    
    staticSections.push({
      libraryId: library.id,
      libraryName: library.name,
      icons: staticIcons
    });
    
    console.log(`   ✅ Generated ${staticIcons.length} static icons`);
  }
  
  const totalIcons = staticSections.reduce((sum, section) => sum + section.icons.length, 0);
  console.log(`\n🎉 Generated ${totalIcons} total static icons across ${staticSections.length} libraries`);
  
  return staticSections;
}

/**
 * Write static data to file
 */
function writeStaticData(sections) {
  const content = `// Static popular icons for immediate HTML rendering and SEO
// Generated on: ${new Date().toISOString()}
// Total icons: ${sections.reduce((sum, section) => sum + section.icons.length, 0)}

import { type LibrarySection } from '@/types/icon';

export const popularIconsStatic: LibrarySection[] = ${JSON.stringify(sections, null, 2)};
`;

  const outputPath = path.join(process.cwd(), 'src/data/popular-icons-static.ts');
  fs.writeFileSync(outputPath, content, 'utf8');
  
  console.log(`\n💾 Written static data to ${outputPath}`);
}

// Main execution
try {
  const sections = generateStaticData();
  writeStaticData(sections);
  console.log('\n✅ Static popular icons generated successfully!');
} catch (error) {
  console.error('❌ Error generating static icons:', error);
  process.exit(1);
}