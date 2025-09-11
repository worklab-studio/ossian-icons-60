#!/usr/bin/env node

/**
 * Debug script to test TypeScript imports
 */

import { execSync } from 'child_process';

async function testImports() {
  console.log('🧪 Testing TypeScript imports...');
  
  try {
    // Test direct import from TypeScript file
    console.log('📦 Testing Tabler import...');
    const tablerData = await import('./src/data/tabler.ts');
    console.log('✅ Tabler import successful!');
    console.log('📊 Exports:', Object.keys(tablerData));
    console.log('📊 tablerIcons type:', typeof tablerData.tablerIcons);
    console.log('📊 tablerIcons length:', tablerData.tablerIcons?.length);
    
    if (tablerData.tablerIcons && tablerData.tablerIcons.length > 0) {
      console.log('🔍 First 3 icons:', tablerData.tablerIcons.slice(0, 3).map(icon => icon.name || icon.id));
    }
    
    // Test Material import
    console.log('\n📦 Testing Material import...');
    const materialData = await import('./src/data/material.ts');
    console.log('✅ Material import successful!');
    console.log('📊 Exports:', Object.keys(materialData));
    console.log('📊 materialIcons type:', typeof materialData.materialIcons);
    console.log('📊 materialIcons length:', materialData.materialIcons?.length);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testImports();