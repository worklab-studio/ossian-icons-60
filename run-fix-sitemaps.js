#!/usr/bin/env node

/**
 * Emergency sitemap fix script
 * Generates complete sitemaps with real data to fix Google crawling issues
 */

import { execSync } from 'child_process';

try {
  console.log('🚨 Emergency sitemap fix starting...');
  
  // Generate complete sitemaps with real data
  console.log('🔧 Generating complete sitemaps...');
  execSync('node scripts/generate-sitemaps-complete.js', { stdio: 'inherit' });
  
  console.log('✅ Emergency sitemap fix completed!');
  console.log('🎯 All library sitemaps now contain full icon data');
  
} catch (error) {
  console.error('❌ Emergency sitemap fix failed:', error.message);
  process.exit(1);
}