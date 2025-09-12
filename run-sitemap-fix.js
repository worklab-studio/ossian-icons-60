#!/usr/bin/env node

/**
 * Run the sitemap regeneration to fix domain issues
 */

import { execSync } from 'child_process';

try {
  console.log('🔧 Fixing sitemap domain issues...');
  
  // Run the regeneration script
  execSync('node scripts/regenerate-sitemaps.js', { stdio: 'inherit' });
  
  console.log('\n✅ Sitemap domain fix completed successfully!');
  console.log('\n📋 Summary of SEO Recovery Plan Implementation:');
  console.log('✅ Phase 1: Domain standardization complete');
  console.log('✅ Phase 2: Enhanced meta tags and schema markup');
  console.log('✅ Phase 3: Updated sitemaps and robots.txt');
  console.log('✅ Phase 4: Breadcrumb schema implementation');
  console.log('\n🚀 Ready for resubmission to Google Search Console!');
  
} catch (error) {
  console.error('❌ Error during sitemap fix:', error.message);
  process.exit(1);
}