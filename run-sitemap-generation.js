#!/usr/bin/env node

/**
 * Manual sitemap generation to create all individual icon page sitemaps
 */

import { execSync } from 'child_process';

try {
  console.log('🚀 Running sitemap generation script...');
  execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });
  console.log('✅ Sitemap generation completed!');
} catch (error) {
  console.error('❌ Error running sitemap generation:', error);
  process.exit(1);
}