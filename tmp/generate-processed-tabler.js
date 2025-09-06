#!/usr/bin/env node

// Simple script to generate processed Tabler icons
const fs = require('fs');
const path = require('path');

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

// Helper function to sort icons by style then name
function sortIconsByStyleThenName(icons) {
  return icons.sort((a, b) => {
    if (a.style !== b.style) {
      return a.style.localeCompare(b.style);
    }
    return a.name.localeCompare(b.name);
  });
}

// Generate processed icons
console.log('🔄 Generating processed Tabler icons...');

// Read and evaluate the TrablerStroke.ts file
const tablerPath = path.join(__dirname, '../TrablerStroke.ts');
const tablerContent = fs.readFileSync(tablerPath, 'utf8');

// Extract the tablerIconMap object
const mapMatch = tablerContent.match(/export const tablerIconMap: Record<string, string> = ({[\s\S]*?});/);
if (!mapMatch) {
  console.error('❌ Could not find tablerIconMap in TrablerStroke.ts');
  process.exit(1);
}

// Parse the icon map
const tablerIconMap = eval('(' + mapMatch[1] + ')');
console.log(`📊 Processing ${Object.keys(tablerIconMap).length} icons...`);

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

console.log('📝 Sorting icons...');
const sortedIcons = sortIconsByStyleThenName(processedIcons);

// Generate the processed file content
const processedContent = `// Auto-generated pre-processed Tabler icons
// Generated on: ${new Date().toISOString()}
// Source icons: ${sortedIcons.length}

import { type IconItem } from '@/types/icon';

export const processedTablerIcons: IconItem[] = ${JSON.stringify(sortedIcons, null, 2)};

export const hasProcessedIcons = true;
`;

// Write the processed file
const outputDir = path.join(__dirname, '../src/data/processed');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'tabler-icons-processed.ts');
fs.writeFileSync(outputPath, processedContent, 'utf8');

console.log('✅ Successfully generated processed Tabler icons');
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Total icons: ${sortedIcons.length}`);
console.log(`💾 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

// Generate statistics
const categories = [...new Set(sortedIcons.map(icon => icon.category))];
const avgTags = sortedIcons.reduce((sum, icon) => sum + icon.tags.length, 0) / sortedIcons.length;

console.log(`🏷️  Categories: ${categories.length}`);
console.log(`🔖 Average tags per icon: ${avgTags.toFixed(1)}`);