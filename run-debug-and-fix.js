#!/usr/bin/env node

/**
 * Debug and fix sitemap generation in one go
 */

import { execSync } from 'child_process';

try {
  console.log('🔧 Starting debug and fix process...');
  
  // First, run the debug test
  console.log('🧪 Testing imports...');
  execSync('node debug-import.js', { stdio: 'inherit' });
  
  // Then generate sitemaps
  console.log('\n🚀 Generating complete sitemaps...');
  execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });
  
  // Verify the results
  console.log('\n🔍 Verifying sitemap completeness...');
  execSync('node scripts/verify-sitemaps.js', { stdio: 'inherit' });
  
  console.log('\n✅ Process completed! Check the verification results above.');
  
} catch (error) {
  console.error('❌ Error during process:', error);
  process.exit(1);
}