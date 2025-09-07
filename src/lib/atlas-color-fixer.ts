// Atlas icon color standardization utility
import { type IconItem } from '@/types/icon';

/**
 * Standardizes Atlas icons to ensure consistent color behavior
 * Converts filled icons to outlined versions and ensures currentColor usage
 */
export function standardizeAtlasIcon(icon: IconItem): IconItem {
  if (!icon.id.startsWith('atlas-') || typeof icon.svg !== 'string') {
    return icon;
  }

  let processedSvg = icon.svg;

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
 * Batch process Atlas icons for color consistency
 */
export function standardizeAtlasIcons(icons: IconItem[]): IconItem[] {
  return icons.map(standardizeAtlasIcon);
}