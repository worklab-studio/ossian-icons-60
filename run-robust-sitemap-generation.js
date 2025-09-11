#!/usr/bin/env node

/**
 * Run the robust sitemap generation process
 * This extracts icon data first, then generates complete sitemaps
 */

import { execSync } from 'child_process';

try {
  console.log('🚀 Starting robust sitemap generation process...');
  
  // Step 1: Extract icon data from TypeScript files
  console.log('\n📦 Step 1: Extracting icon data...');
  execSync('node scripts/extract-icon-data.js', { stdio: 'inherit' });
  
  // Step 2: Generate sitemaps using extracted data
  console.log('\n🗺️  Step 2: Generating sitemaps...');
  execSync('node scripts/generate-sitemaps-robust.js', { stdio: 'inherit' });
  
  // Step 3: Verify the results
  console.log('\n🔍 Step 3: Verifying results...');
  execSync('node scripts/verify-sitemaps.js', { stdio: 'inherit' });
  
  console.log('\n✅ Robust sitemap generation completed successfully!');
  
} catch (error) {
  console.error('❌ Error during robust sitemap generation:', error.message);
  process.exit(1);
}