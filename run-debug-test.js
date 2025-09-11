#!/usr/bin/env node

/**
 * Run debug test and then sitemap generation
 */

import { execSync } from 'child_process';

try {
  console.log('🧪 Running import debug test...');
  execSync('node debug-import.js', { stdio: 'inherit' });
  
  console.log('\n🚀 Running sitemap generation...');
  execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });
  
  console.log('\n🔍 Verifying results...');
  execSync('node scripts/verify-sitemaps.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}