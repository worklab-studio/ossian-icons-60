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
    .replace(/\bfill="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'fill="currentColor"')
    // Normalize stroke attributes but only the color value, not other stroke attributes
    .replace(/\bstroke="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'stroke="currentColor"')
    // Normalize stop-color attributes in gradients
    .replace(/\bstop-color="(?!none|transparent|inherit|currentColor)([^"]+)"/gi, 'stop-color="currentColor"');
}

/**
 * Remove XML declarations and clean up malformed attributes
 */
function cleanupSvgStructure(svgContent: string): string {
  return svgContent
    // Remove XML declarations that break parsing (Ant icons)
    .replace(/<\?xml[^>]*\?>\s*/gi, '')
    // Remove DOCTYPE declarations
    .replace(/<!DOCTYPE[^>]*>\s*/gi, '')
    // Fix self-closing tags that may be malformed
    .replace(/(<[^>]+)\s*\/\s*>/g, '$1/>')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ensure consistent SVG structure for proper scaling and compatibility
 */
function ensureConsistentStructure(svgContent: string): string {
  let result = svgContent;
  
  // Remove width and height attributes for consistent scaling
  result = result.replace(/\s*width="[^"]*"/gi, '');
  result = result.replace(/\s*height="[^"]*"/gi, '');
  
  // Don't override existing valid viewBox - only add if missing
  if (!result.includes('viewBox=')) {
    // Check for common icon library viewBox patterns
    const bootstrapPattern = /version="1\.1".*?xmlns/i.test(result);
    const isBootstrapIcon = bootstrapPattern || result.includes('bootstrap');
    
    if (isBootstrapIcon) {
      // Bootstrap Icons use 16x16 viewBox
      result = result.replace('<svg', '<svg viewBox="0 0 16 16"');
    } else {
      // Look for coordinate system clues in path data
      const hasLargeCoords = /[d="'][^"']*[1-9]\d{2,}[^"']*["']/i.test(result);
      if (hasLargeCoords) {
        // Detect coordinate system size more accurately
        const pathData = result.match(/d="([^"]+)"/i);
        if (pathData) {
          const coords = pathData[1].match(/\d+/g);
          if (coords) {
            const maxCoord = Math.max(...coords.map(Number));
            if (maxCoord >= 1000) {
              result = result.replace('<svg', '<svg viewBox="0 0 1024 1024"');
            } else if (maxCoord >= 100) {
              result = result.replace('<svg', '<svg viewBox="0 0 256 256"');
            } else {
              result = result.replace('<svg', '<svg viewBox="0 0 24 24"');
            }
          } else {
            result = result.replace('<svg', '<svg viewBox="0 0 24 24"');
          }
        } else {
          result = result.replace('<svg', '<svg viewBox="0 0 24 24"');
        }
      } else {
        // Standard 24x24 coordinate system
        result = result.replace('<svg', '<svg viewBox="0 0 24 24"');
      }
    }
  }
  
  // Add preserveAspectRatio for consistent scaling
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
 * Library-specific SVG processing
 */
function processLibrarySpecificSvg(svgContent: string, library: string): string {
  let processed = svgContent;
  
  switch (library) {
    case 'atlas':
      // Atlas icons have complex CSS with hardcoded colors
      processed = processed.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
        const updatedCss = cssContent
          .replace(/stroke:\s*#[a-fA-F0-9]{3,6}/g, 'stroke: currentColor')
          .replace(/fill:\s*#[a-fA-F0-9]{3,6}/g, 'fill: currentColor')
          .replace(/color:\s*#[a-fA-F0-9]{3,6}/g, 'color: currentColor')
          // Handle more specific color patterns
          .replace(/stroke:\s*#020202/g, 'stroke: currentColor')
          .replace(/fill:\s*#020202/g, 'fill: currentColor');
        return `<style>${updatedCss}</style>`;
      });
      break;
      
    case 'iconamoon':
      // Iconamoon icons often have clipPath issues
      processed = processed.replace(/(<clipPath[^>]*>[\s\S]*?<\/clipPath>)/gi, '');
      // Ensure proper fill for paths without explicit fill
      if (!processed.includes('fill=') && !processed.includes('stroke=')) {
        processed = processed.replace(/<path([^>]*)>/g, '<path$1 fill="currentColor">');
      }
      break;
      
    case 'carbon':
      // Carbon icons sometimes have transform issues
      processed = processed.replace(/transform="translate\([^)]*\)"/g, '');
      break;
      
    case 'mingcute':
    case 'majesticons':
    case 'sargam':
      // These libraries often have nested groups that cause issues
      processed = processed.replace(/<g[^>]*>\s*<g[^>]*>/g, '<g>');
      processed = processed.replace(/<\/g>\s*<\/g>/g, '</g>');
      break;
      
    case 'ikonate':
      // Ikonate icons may have animation attributes that interfere
      processed = processed.replace(/\s*(animate|animation)[^=]*="[^"]*"/gi, '');
      break;
  }
  
  return processed;
}

/**
 * Main SVG optimization function
 * Normalizes SVG content to use currentColor and ensures consistent structure
 */
export function optimizeSvg(svgContent: string, library?: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    return svgContent;
  }
  
  let result = svgContent;
  
  // Step 1: Clean up XML declarations and malformed structure
  result = cleanupSvgStructure(result);
  
  // Step 2: Apply library-specific processing
  if (library) {
    result = processLibrarySpecificSvg(result, library);
  }
  
  // Step 3: Normalize colors in style attributes
  result = normalizeStyleColors(result);
  
  // Step 4: Normalize colors in attributes  
  result = normalizeAttributeColors(result);
  
  // Step 5: Ensure consistent scaling structure
  result = ensureConsistentStructure(result);
  
  // Step 6: Ensure paintable attributes for canvas rendering
  result = ensurePaintableAttributes(result);
  
  return result;
}