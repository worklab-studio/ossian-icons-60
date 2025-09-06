// Extract iconMap from Material.ts content
const fs = require('fs');

try {
  // Read the complete material file
  let content = fs.readFileSync('tmp/material-complete.ts', 'utf8');
  
  // Remove markdown wrapper and extract just the TypeScript content
  content = content.replace(/^#.*$/gm, ''); // Remove markdown headers
  content = content.replace(/^```.*$/gm, ''); // Remove code fences
  
  // Extract the iconMap object
  const iconMapMatch = content.match(/export const iconMap: Record<string, string> = \{([\s\S]*)\};/);
  
  if (iconMapMatch) {
    const iconMapContent = iconMapMatch[1].trim();
    const fullIconMap = `const iconMap: Record<string, string> = {\n${iconMapContent}\n};`;
    
    console.log('Extracted iconMap with', (iconMapContent.match(/"/g) || []).length / 4, 'icons');
    
    // Write to a new file
    fs.writeFileSync('tmp/extracted-iconmap.js', fullIconMap);
    console.log('✅ Successfully extracted iconMap to tmp/extracted-iconmap.js');
  } else {
    console.log('❌ Could not find iconMap in the content');
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}