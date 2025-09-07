// Ant Icons Fixer Script
// This script fixes the ant.ts file to ensure proper color customization and clean SVG structure

export function fixAntIconsSvg(svgString: string): string {
  let fixed = svgString;
  
  // Remove DOCTYPE declarations
  fixed = fixed.replace(/<!DOCTYPE[^>]*>/g, '');
  
  // Remove XML version declarations
  fixed = fixed.replace(/<\?xml[^>]*\?>/g, '');
  
  // Remove class="icon" attributes
  fixed = fixed.replace(/\s+class="icon"/g, '');
  
  // Remove t="..." attributes
  fixed = fixed.replace(/\s+t="[^"]*"/g, '');
  
  // Remove p-id="..." attributes
  fixed = fixed.replace(/\s+p-id="[^"]*"/g, '');
  
  // Remove version="..." attributes
  fixed = fixed.replace(/\s+version="[^"]*"/g, '');
  
  // Remove xmlns:xlink="..." attributes
  fixed = fixed.replace(/\s+xmlns:xlink="[^"]*"/g, '');
  
  // Remove width and height attributes that are not 24
  fixed = fixed.replace(/\s+width="(?!24)[^"]*"/g, '');
  fixed = fixed.replace(/\s+height="(?!24)[^"]*"/g, '');
  
  // Ensure consistent width and height
  fixed = fixed.replace(/<svg([^>]*?)>/g, (match, attrs) => {
    // Remove existing width/height
    let cleanAttrs = attrs.replace(/\s+(?:width|height)="[^"]*"/g, '');
    // Add standard dimensions
    return `<svg height="24" width="24"${cleanAttrs}>`;
  });
  
  // Add fill="currentColor" to path elements that don't have fill attribute
  fixed = fixed.replace(/<path(?![^>]*fill=)([^>]*?)>/g, '<path fill="currentColor"$1>');
  
  // Clean up extra whitespace
  fixed = fixed.replace(/\s+/g, ' ');
  fixed = fixed.replace(/>\s+</g, '><');
  
  // Remove any remaining standalone attributes
  fixed = fixed.replace(/\s+standalone="[^"]*"/g, '');
  
  return fixed.trim();
}

export function fixAntIconCategory(style: string, name: string): string {
  // Map styles to proper categories
  if (style === 'outline') {
    // Check name for clues about the actual category
    if (name.toLowerCase().includes('fill') || name.toLowerCase().includes('solid')) {
      return 'filled';
    }
    if (name.toLowerCase().includes('two') || name.toLowerCase().includes('tone')) {
      return 'twotone';
    }
    return 'outlined';
  }
  
  // Keep existing mapping for other styles
  return style === 'twotone' ? 'twotone' : 'outlined';
}
