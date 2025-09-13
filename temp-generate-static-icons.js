#!/usr/bin/env node

/**
 * Temporary script to generate 500 static popular icons (50 from each of 10 libraries)
 */

import fs from 'fs';
import path from 'path';

// Simplified static data generation - we'll embed popular icons here
const staticSections = [
  {
    libraryId: 'tabler',
    libraryName: 'Tabler',
    icons: [
      { id: 'tabler-home', name: 'home', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>', tags: ['home', 'house'], category: 'buildings' },
      { id: 'tabler-user', name: 'user', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', tags: ['user', 'person'], category: 'system' },
      { id: 'tabler-settings', name: 'settings', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><circle cx="12" cy="12" r="3"></circle></svg>', tags: ['settings', 'config'], category: 'system' },
      { id: 'tabler-search', name: 'search', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>', tags: ['search', 'find'], category: 'system' },
      { id: 'tabler-heart', name: 'heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z"></path></svg>', tags: ['heart', 'favorite'], category: 'system' }
    ]
  },
  // Add more libraries here with their popular icons...
];

// For now, let's generate a minimal version with what we have
// and fill in the rest later

console.log('Generating expanded static icons data...');

const content = `// Static popular icons for immediate HTML rendering and SEO
// Generated on: ${new Date().toISOString()}
// Total icons: ${staticSections.reduce((sum, section) => sum + section.icons.length, 0)}

import { type LibrarySection } from '@/types/icon';

export const popularIconsStatic: LibrarySection[] = ${JSON.stringify(staticSections, null, 2)};
`;

const outputPath = path.join(process.cwd(), 'src/data/popular-icons-static.ts');
fs.writeFileSync(outputPath, content, 'utf8');

console.log(`Written static data to ${outputPath}`);
console.log('✅ Done!');