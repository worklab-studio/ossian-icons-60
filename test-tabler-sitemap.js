#!/usr/bin/env node

/**
 * Test script to debug Tabler sitemap generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTablerImport() {
  console.log('🧪 Testing Tabler import...');
  
  try {
    // Test the import
    const iconData = await import('./src/data/tabler.ts');
    console.log('📦 Available exports:', Object.keys(iconData));
    
    const tablerIcons = iconData.tablerIcons;
    console.log('📊 Type of tablerIcons:', typeof tablerIcons);
    console.log('📊 Is array:', Array.isArray(tablerIcons));
    console.log('📊 Length:', tablerIcons?.length);
    
    if (tablerIcons && tablerIcons.length > 0) {
      console.log('🔍 First 3 icons:', tablerIcons.slice(0, 3).map(icon => icon.name));
      
      // Generate a small sitemap sample
      const iconNames = tablerIcons.slice(0, 10).map(icon => icon.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      console.log('🔗 Sample URLs:', iconNames.map(name => `https://iconstack.io/icon/tabler/${name}`));
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

testTablerImport();