// Atlas icon color standardization utility
import { type IconItem } from '@/types/icon';

/**
 * Standardizes Atlas icons to ensure consistent color behavior
 * Handles both inline attributes and CSS class-based styling
 */
export function standardizeAtlasIcon(icon: IconItem): IconItem {
  if (!icon.id.startsWith('atlas-') || typeof icon.svg !== 'string') {
    return icon;
  }

  let processedSvg = icon.svg;

  // Handle CSS-based icons with <style> blocks
  processedSvg = convertCssStylesToInlineAttributes(processedSvg);

  // Convert fill="currentColor" to stroke-based outline version
  processedSvg = processedSvg.replace(
    /fill="currentColor"/g, 
    'fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="1.91"'
  );

  // Ensure all stroke elements use currentColor
  processedSvg = processedSvg.replace(
    /stroke="(?!currentColor)[^"]*"/g,
    'stroke="currentColor"'
  );

  // Remove any hardcoded colors and replace with currentColor
  processedSvg = processedSvg.replace(
    /fill="#[0-9a-fA-F]{3,6}"/g,
    'fill="none" stroke="currentColor"'
  );

  processedSvg = processedSvg.replace(
    /stroke="#[0-9a-fA-F]{3,6}"/g,
    'stroke="currentColor"'
  );

  return {
    ...icon,
    svg: processedSvg
  };
}

/**
 * Converts CSS class-based styles to inline SVG attributes
 * Handles <defs><style>.cls-1{...}</style></defs> patterns
 */
function convertCssStylesToInlineAttributes(svg: string): string {
  // Extract CSS styles from <defs><style> blocks
  const styleRegex = /<defs><style>(.*?)<\/style><\/defs>/s;
  const styleMatch = svg.match(styleRegex);
  
  if (!styleMatch) {
    return svg;
  }

  const cssContent = styleMatch[1];
  let processedSvg = svg;

  // Parse CSS rules for .cls-1, .cls-2, etc.
  const cssRuleRegex = /\.cls-(\d+)\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = cssRuleRegex.exec(cssContent)) !== null) {
    const className = `cls-${match[1]}`;
    const cssProperties = match[2];
    
    // Convert CSS properties to SVG attributes
    const attributes = parseCssPropertiesToSvgAttributes(cssProperties);
    
    // Replace all elements with this class
    const classRegex = new RegExp(`class="${className}"`, 'g');
    processedSvg = processedSvg.replace(classRegex, attributes);
  }

  // Remove the <defs><style> block entirely
  processedSvg = processedSvg.replace(styleRegex, '');
  
  return processedSvg;
}

/**
 * Converts CSS properties to SVG attributes
 */
function parseCssPropertiesToSvgAttributes(cssProperties: string): string {
  const attributes: string[] = [];
  
  // Split by semicolon and process each property
  const properties = cssProperties.split(';').map(p => p.trim()).filter(Boolean);
  
  for (const property of properties) {
    const [key, value] = property.split(':').map(s => s.trim());
    
    switch (key) {
      case 'fill':
        if (value === 'none' || value === 'currentColor') {
          attributes.push(`fill="${value}"`);
        } else {
          attributes.push('fill="currentColor"');
        }
        break;
      case 'stroke':
        if (value === 'currentColor') {
          attributes.push('stroke="currentColor"');
        } else {
          attributes.push('stroke="currentColor"');
        }
        break;
      case 'stroke-width':
        // Extract numeric value and convert px to plain number
        const strokeWidth = value.replace('px', '');
        attributes.push(`stroke-width="${strokeWidth}"`);
        break;
      case 'stroke-miterlimit':
        attributes.push(`stroke-miterlimit="${value}"`);
        break;
      case 'stroke-linecap':
        attributes.push(`stroke-linecap="${value}"`);
        break;
      case 'stroke-linejoin':
        attributes.push(`stroke-linejoin="${value}"`);
        break;
    }
  }
  
  return attributes.join(' ');
}

/**
 * Batch process Atlas icons for color consistency
 */
export function standardizeAtlasIcons(icons: IconItem[]): IconItem[] {
  return icons.map(standardizeAtlasIcon);
}