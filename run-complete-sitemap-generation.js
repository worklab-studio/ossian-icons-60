#!/usr/bin/env node

/**
 * Complete sitemap generation script that creates all individual icon page sitemaps
 * This will generate 47,740+ URLs across all library sitemaps
 */

import { execSync } from 'child_process';

try {
  console.log('🚀 Starting complete sitemap generation...');
  console.log('📋 This will create sitemaps for all 47,740+ icon pages');
  
  // Generate all sitemaps with real data
  console.log('⚙️  Generating sitemaps...');
  execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });
  
  console.log('✅ Sitemap generation completed!');
  
  // Verify the results
  console.log('🔍 Verifying sitemap completeness...');
  execSync('node scripts/verify-sitemaps.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error during sitemap generation:', error);
  process.exit(1);
}