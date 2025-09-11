#!/usr/bin/env node

/**
 * Reliable icon data extractor - reads TypeScript files and extracts icon arrays
 * This creates JSON files that can be reliably used by the sitemap generator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIBRARIES = [
  { id: 'bootstrap', exportName: 'bootstrapIcons' },
  { id: 'carbon', exportName: 'carbonIcons' },
  { id: 'feather', exportName: 'featherIcons' },
  { id: 'fluent-ui', exportName: 'fluentUiIcons' },
  { id: 'heroicons', exportName: 'heroiconsIcons' },
  { id: 'hugeicon', exportName: 'hugeiconIcons' },
  { id: 'iconamoon', exportName: 'iconamoonIcons' },
  { id: 'iconoir', exportName: 'iconoirIcons' },
  { id: 'iconsax', exportName: 'iconsaxIcons' },
  { id: 'line', exportName: 'lineIcons' },
  { id: 'lucide', exportName: 'lucideIcons' },
  { id: 'majesticon', exportName: 'majesticonIcons' },
  { id: 'material', exportName: 'materialIcons' },
  { id: 'mingcute', exportName: 'mingcuteIcons' },
  { id: 'octicons', exportName: 'octiconsIcons' },
  { id: 'phosphor', exportName: 'phosphorIcons' },
  { id: 'pixelart', exportName: 'pixelartIcons' },
  { id: 'radix', exportName: 'radixIcons' },
  { id: 'simple', exportName: 'simpleIcons' },
  { id: 'solar', exportName: 'solarIcons' },
  { id: 'tabler', exportName: 'tablerIcons' }
];

async function extractIconData() {
  console.log('🔧 Extracting icon data from TypeScript files...');
  
  const extractedData = {};
  let totalIcons = 0;

  for (const library of LIBRARIES) {
    try {
      console.log(`📦 Processing ${library.id}...`);
      
      // Import the TypeScript module
      const iconData = await import(`../src/data/${library.id}.ts`);
      const iconArray = iconData[library.exportName];
      
      if (!iconArray || !Array.isArray(iconArray)) {
        console.warn(`⚠️  No valid icon array found for ${library.id}`);
        extractedData[library.id] = [];
        continue;
      }
      
      // Extract just the names for sitemap generation
      const iconNames = iconArray.map(icon => {
        const name = icon.name || icon.id || 'unknown';
        return name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }).filter(name => name && name !== 'unknown');
      
      extractedData[library.id] = iconNames;
      totalIcons += iconNames.length;
      
      console.log(`✅ Extracted ${iconNames.length} icons from ${library.id}`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${library.id}:`, error.message);
      extractedData[library.id] = [];
    }
  }
  
  // Write the extracted data to a JSON file
  const outputPath = path.join(__dirname, '..', 'extracted-icon-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
  
  console.log(`🎉 Extraction complete! Total icons: ${totalIcons}`);
  console.log(`📁 Data saved to: ${outputPath}`);
  
  return extractedData;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  extractIconData().catch(console.error);
}

export { extractIconData };