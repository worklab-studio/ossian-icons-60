// Runtime SVG processor for Ant Design icons
// Fixes color customization and malformed SVG issues

export function processAntSvg(svgString: string): string {
  if (typeof svgString !== 'string') {
    return '<svg height="24" width="24" viewBox="0 0 1024 1024"><rect fill="currentColor" opacity="0.3" width="1024" height="1024"/></svg>';
  }

  let processed = svgString;

  // Remove problematic XML declarations and DOCTYPE
  processed = processed.replace(/<!DOCTYPE[^>]*>/gi, '');
  processed = processed.replace(/<\?xml[^>]*\?>/gi, '');

  // Remove unwanted attributes
  processed = processed.replace(/\s+class="[^"]*"/gi, '');
  processed = processed.replace(/\s+t="[^"]*"/gi, '');
  processed = processed.replace(/\s+p-id="[^"]*"/gi, '');
  processed = processed.replace(/\s+version="[^"]*"/gi, '');
  processed = processed.replace(/\s+xmlns:xlink="[^"]*"/gi, '');
  processed = processed.replace(/\s+standalone="[^"]*"/gi, '');

  // Fix dimensions - ensure consistent 24x24
  processed = processed.replace(/<svg([^>]*?)>/gi, (match, attrs) => {
    let cleanAttrs = attrs;
    
    // Remove existing width/height that aren't 24
    cleanAttrs = cleanAttrs.replace(/\s+width="(?!24")[^"]*"/gi, '');
    cleanAttrs = cleanAttrs.replace(/\s+height="(?!24")[^"]*"/gi, '');
    
    // Ensure we have width and height
    if (!cleanAttrs.includes('width="24"')) {
      cleanAttrs = ' width="24"' + cleanAttrs;
    }
    if (!cleanAttrs.includes('height="24"')) {
      cleanAttrs = ' height="24"' + cleanAttrs;
    }
    
    return `<svg${cleanAttrs}>`;
  });

  // Ensure all path elements have fill="currentColor" for color customization
  processed = processed.replace(/<path(?![^>]*fill\s*=)([^>]*?)>/gi, '<path fill="currentColor"$1>');
  
  // Replace any hardcoded colors with currentColor
  processed = processed.replace(/fill="#[^"]*"/gi, 'fill="currentColor"');
  processed = processed.replace(/stroke="#[^"]*"/gi, 'stroke="currentColor"');

  // Clean up whitespace
  processed = processed.replace(/\s+/g, ' ');
  processed = processed.replace(/>\s+</g, '><');
  processed = processed.trim();

  // Validate the result has basic SVG structure
  if (!processed.includes('<svg') || !processed.includes('</svg>')) {
    return '<svg height="24" width="24" viewBox="0 0 1024 1024"><rect fill="currentColor" opacity="0.3" width="1024" height="1024"/></svg>';
  }

  return processed;
}

export function processAntIconCategory(style: string, tags: string[]): string {
  // Improve category mapping based on style and tags
  const tagString = tags.join(' ').toLowerCase();
  
  if (tagString.includes('brand') || tagString.includes('logo') || tagString.includes('social')) {
    return 'brand';
  }
  
  if (tagString.includes('business') || tagString.includes('finance') || tagString.includes('account')) {
    return 'business';
  }
  
  if (tagString.includes('system') || tagString.includes('setting') || tagString.includes('config')) {
    return 'system';
  }
  
  if (tagString.includes('navigation') || tagString.includes('arrow') || tagString.includes('direction')) {
    return 'navigation';
  }
  
  if (tagString.includes('media') || tagString.includes('play') || tagString.includes('video')) {
    return 'media';
  }
  
  // Default mapping
  if (style === 'outline') return 'outlined';
  if (style === 'filled') return 'filled';
  if (style === 'twotone') return 'twotone';
  
  return 'general';
}