#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Pre-processing script for Tabler icons
 * This script processes the raw tabler icon map to extract metadata and clean SVG content,
 * then saves the processed data to avoid runtime processing overhead.
 */

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

async function processTablerIcons() {
  try {
    console.log('🔄 Loading raw Tabler icon map...');
    
    // Import the raw icon map
    const tablerModule = require('../TrablerStroke.ts');
    const tablerIconMap = tablerModule.tablerIconMap;
    
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
`;

    // Ensure the processed data directory exists
    const outputDir = path.join(__dirname, '../src/data/processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the processed file
    const outputPath = path.join(outputDir, 'tabler-icons-processed.ts');
    fs.writeFileSync(outputPath, processedContent, 'utf8');

    console.log('✅ Successfully pre-processed Tabler icons');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Total icons: ${sortedIcons.length}`);
    console.log(`💾 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

    // Generate statistics
    const categories = [...new Set(sortedIcons.map(icon => icon.category))];
    const avgTags = sortedIcons.reduce((sum, icon) => sum + icon.tags.length, 0) / sortedIcons.length;
    
    console.log(`🏷️  Categories: ${categories.length}`);
    console.log(`🔖 Average tags per icon: ${avgTags.toFixed(1)}`);

  } catch (error) {
    console.error('❌ Error processing Tabler icons:', error);
    process.exit(1);
  }
}

// Run the processing if this script is executed directly
if (require.main === module) {
  processTablerIcons();
}

module.exports = { processTablerIcons };