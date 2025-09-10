#!/usr/bin/env node

/**
 * Temporary script to generate all sitemaps with real icon data
 */

import('./scripts/generate-sitemaps.js')
  .then(() => {
    console.log('✅ All sitemaps generated successfully!');
  })
  .catch((error) => {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  });