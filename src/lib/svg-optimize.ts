/**
 * SVG optimization and normalization utilities
 * Normalizes all SVGs to use currentColor as the baseline for consistent theming
 */

/**
 * Normalize SVG styles and attributes to use currentColor
 * This creates a consistent baseline for color customization
 */
function normalizeStyleColors(svgContent: string): string {
  return svgContent
    // Normalize fill in style attributes (preserve fill="none" and fill="transparent")
    .replace(/style="([^"]*?)fill:\s*(?!none|transparent|inherit|currentColor)([^;"\s]+)([^"]*?)"/gi, 
      (match, before, color, after) => {
        // Preserve none, transparent, and currentColor
        if (color.trim() === 'none' || color.trim() === 'transparent' || color.trim() === 'currentColor') {
          return match;
        }
        return `style="${before}fill: currentColor${after}"`;
      })
    // Normalize stroke in style attributes (preserve stroke="none" and stroke="transparent")  
    .replace(/style="([^"]*?)stroke:\s*(?!none|transparent|inherit|currentColor)([^;"\s]+)([^"]*?)"/gi,
      (match, before, color, after) => {
        // Preserve none, transparent, and currentColor
        if (color.trim() === 'none' || color.trim() === 'transparent' || color.trim() === 'currentColor') {
          return match;
        }
        return `style="${before}stroke: currentColor${after}"`;
      })
    // Normalize stop-color in gradients (preserve currentColor)
    .replace(/style="([^"]*?)stop-color:\s*(?!none|transparent|inherit|currentColor)([^;"\s]+)([^"]*?)"/gi,
      `style="$1stop-color: currentColor$3"`)
    // Handle CSS classes that might have fill/stroke colors
    .replace(/class="([^"]*?)"/gi, (match, classes) => {
      // Keep the classes as-is, the global CSS rules will handle color inheritance
      return match;
    });
}

/**
 * Normalize SVG attributes to use currentColor
 */
function normalizeAttributeColors(svgContent: string): string {
  return svgContent
    // Normalize fill attributes (preserve fill="none" and fill="transparent")
    .replace(/fill="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'fill="currentColor"')
    // Normalize stroke attributes (preserve stroke="none" and stroke="transparent")
    .replace(/stroke="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'stroke="currentColor"')
    // Normalize stop-color attributes in gradients
    .replace(/stop-color="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'stop-color="currentColor"');
}

/**
 * Ensure consistent SVG structure for proper scaling and compatibility
 */
function ensureConsistentStructure(svgContent: string): string {
  let result = svgContent;
  
  // Remove width and height attributes for consistent scaling
  result = result.replace(/\s*width="[^"]*"/gi, '');
  result = result.replace(/\s*height="[^"]*"/gi, '');
  
  // Ensure viewBox is present (extract from original width/height if needed)
  if (!result.includes('viewBox=')) {
    // Try to extract viewBox from existing structure or default to 24x24
    const sizeMatch = result.match(/viewBox="([^"]+)"/);
    if (sizeMatch) {
      // viewBox already exists, keep it
    } else {
      // Look for common sizes in the SVG structure  
      const hasLargeCoords = /[d="'][^"']*[1-9]\d{2,}[^"']*["']/i.test(result);
      if (hasLargeCoords) {
        // Larger coordinate system detected (like 1024x1024)
        const coordMatch = result.match(/[d="'][^"']*?(\d{3,4})[^"']*["']/);
        if (coordMatch) {
          const size = coordMatch[1];
          result = result.replace('<svg', `<svg viewBox="0 0 ${size} ${size}"`);
        } else {
          result = result.replace('<svg', '<svg viewBox="0 0 1024 1024"');
        }
      } else {
        // Standard 24x24 coordinate system
        result = result.replace('<svg', '<svg viewBox="0 0 24 24"');
      }
    }
  }
  
  // Add preserveAspectRatio for consistent scaling (helps PNG render size)
  if (!result.includes('preserveAspectRatio=')) {
    result = result.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
  }
  
  return result;
}

/**
 * Ensure SVG has minimal paintable attributes for robust canvas rendering
 */
function ensurePaintableAttributes(svgContent: string): string {
  // If SVG has no fill/stroke attributes, add minimal fill to ensure visibility
  if (!svgContent.includes('fill=') && !svgContent.includes('stroke=')) {
    // Add fill="currentColor" to the first path or shape element found
    return svgContent.replace(/<(path|circle|ellipse|rect|polygon|polyline)([^>]*)>/i, '<$1$2 fill="currentColor">');
  }
  return svgContent;
}

/**
 * Main SVG optimization function
 * Normalizes SVG content to use currentColor and ensures consistent structure
 */
export function optimizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    return svgContent;
  }
  
  let result = svgContent;
  
  // Step 1: Normalize colors in style attributes
  result = normalizeStyleColors(result);
  
  // Step 2: Normalize colors in attributes  
  result = normalizeAttributeColors(result);
  
  // Step 3: Ensure consistent scaling structure
  result = ensureConsistentStructure(result);
  
  // Step 4: Ensure paintable attributes for canvas rendering
  result = ensurePaintableAttributes(result);
  
  return result;
}