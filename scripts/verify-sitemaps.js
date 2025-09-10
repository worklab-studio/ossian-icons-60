#!/usr/bin/env node

/**
 * Verification script to count and validate sitemap completeness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function countUrlsInSitemap(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const urlMatches = content.match(/<url>/g);
    return urlMatches ? urlMatches.length : 0;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

function verifySitemaps() {
  const publicDir = path.resolve(__dirname, '../public');
  const sitemapFiles = fs.readdirSync(publicDir).filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'));
  
  console.log('📊 Sitemap Verification Report');
  console.log('================================');
  
  let totalUrls = 0;
  const results = [];
  
  // Check main sitemap
  const mainSitemapPath = path.join(publicDir, 'sitemap-main.xml');
  if (fs.existsSync(mainSitemapPath)) {
    const mainUrls = countUrlsInSitemap(mainSitemapPath);
    totalUrls += mainUrls;
    results.push({ file: 'sitemap-main.xml', urls: mainUrls });
    console.log(`✅ sitemap-main.xml: ${mainUrls} URLs`);
  }
  
  // Check library sitemaps
  sitemapFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const urlCount = countUrlsInSitemap(filePath);
    totalUrls += urlCount;
    results.push({ file, urls: urlCount });
    
    const library = file.replace('sitemap-', '').replace('.xml', '');
    if (urlCount < 10) {
      console.log(`⚠️  ${file}: ${urlCount} URLs (possibly incomplete)`);
    } else {
      console.log(`✅ ${file}: ${urlCount} URLs`);
    }
  });
  
  // Check sitemap index
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');
  if (fs.existsSync(sitemapIndexPath)) {
    const indexContent = fs.readFileSync(sitemapIndexPath, 'utf-8');
    const sitemapCount = (indexContent.match(/<sitemap>/g) || []).length;
    console.log(`✅ sitemap.xml: ${sitemapCount} sitemap references`);
  }
  
  console.log('================================');
  console.log(`📈 Total URLs indexed: ${totalUrls}`);
  console.log(`📁 Total sitemap files: ${results.length + 1}`); // +1 for main
  
  if (totalUrls < 1000) {
    console.log('⚠️  Warning: Total URL count seems low. Expected 40,000+ URLs');
    console.log('💡 Run "node scripts/generate-sitemaps.js" to generate complete sitemaps');
  } else {
    console.log('🎉 Sitemap generation appears complete!');
  }
  
  return { totalUrls, results };
}

// Run verification
verifySitemaps();