#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Import the tablerIconMap from the TS file using require for simple dynamic import
const tablerModule = require('../TrablerStroke.ts');
const tablerIconMap = tablerModule.tablerIconMap;

console.log(`🔄 Processing ${Object.keys(tablerIconMap).length} Tabler icons...`);

// Helper function to parse metadata from HTML comments
function parseIconMetadata(svgString) {
  const commentMatch = svgString.match(/<!--\s*(.*?)\s*-->/s);
  if (!commentMatch) return {};

  const commentContent = commentMatch[1];
  const categoryMatch = commentContent.match(/category:\s*([^\n]+)/);
  const tagsMatch = commentContent.match(/tags:\s*\[(.*?)\]/);

  return {
    category: categoryMatch?.[1]?.trim(),
    tags: tagsMatch?.[1]?.split(',').map(tag => tag.trim().replace(/['"]/g, '')) || []
  };
}

// Helper function to clean SVG content (remove HTML comments)
function cleanSvgContent(svgString) {
  return svgString.replace(/<!--[\s\S]*?-->/g, '').trim();
}

// Process all icons
const processedIcons = Object.entries(tablerIconMap).map(([iconName, svgContent]) => {
  const metadata = parseIconMetadata(svgContent);
  const cleanSvg = cleanSvgContent(svgContent);

  return {
    id: `tabler-${iconName}`,
    name: iconName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    svg: cleanSvg,
    tags: metadata.tags || [],
    style: 'outline',
    category: metadata.category || 'General'
  };
});

// Sort icons by style then name
const sortedIcons = processedIcons.sort((a, b) => {
  if (a.style !== b.style) {
    return a.style.localeCompare(b.style);
  }
  return a.name.localeCompare(b.name);
});

console.log(`📊 Processed ${sortedIcons.length} icons`);

// Generate the static TypeScript file content
const staticContent = `// Auto-generated pre-processed Tabler icons
// Generated on: ${new Date().toISOString()}
// Total icons: ${sortedIcons.length}

import { type IconItem } from '@/types/icon';

export const processedTablerIcons: IconItem[] = ${JSON.stringify(sortedIcons, null, 2)};

export const hasProcessedIcons = true;
`;

// Ensure the processed data directory exists
const outputDir = path.join(__dirname, '../src/data/processed');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the processed file
const outputPath = path.join(outputDir, 'tabler-icons-processed.ts');
fs.writeFileSync(outputPath, staticContent, 'utf8');

console.log('✅ Successfully generated static Tabler icons file');
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Total icons: ${sortedIcons.length}`);
console.log(`💾 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

// Generate statistics
const categories = [...new Set(sortedIcons.map(icon => icon.category))];
const avgTags = sortedIcons.reduce((sum, icon) => sum + icon.tags.length, 0) / sortedIcons.length;

console.log(`🏷️  Categories: ${categories.length}`);
console.log(`🔖 Average tags per icon: ${avgTags.toFixed(1)}`);