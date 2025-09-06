import { type IconItem } from "@/types/icon";

/**
 * Determines if an icon supports stroke width customization
 * Excludes filled, solid, bold, bulk icons, BoxIcons (which are primarily filled), and CSS.gg icons
 */
export function supportsStrokeWidth(icon: IconItem): boolean {
  // Special handling for Solar icons - only outline variants support stroke
  if (icon.id.startsWith('solar-')) {
    return icon.style === 'outline';
  }

  // CSS.gg icons don't support stroke width customization
  if (icon.id.startsWith('css-gg-')) {
    return false;
  }

  // If no style is defined, check against known filled library prefixes
  if (!icon.style) {
    // Exception: BoxIcons and Ant icons don't have explicit style but are primarily filled
    if (icon.id.startsWith('boxicons-') || icon.id.startsWith('ant-')) {
      return false;
    }
    // Default: icons without style support stroke width (like Line icons, Radix icons)
    return true;
  }

  // List of styles that explicitly support stroke width (outline/line variants)
  const strokeSupportStyles = [
    'outline',
    'regular', 
    'line',
    'thin',
    'light',
    'stroke'
  ];

  // List of styles that don't support stroke width (filled variants)
  const nonStrokeStyles = [
    'solid',
    'filled', 
    'bold',
    'bulk',
    'fill'
  ];

  const style = icon.style.toLowerCase();
  
  // First check if it's explicitly a stroke-supporting style
  if (strokeSupportStyles.includes(style)) {
    return true;
  }
  
  // Then check if it's explicitly a non-stroke style
  if (nonStrokeStyles.includes(style)) {
    return false;
  }
  
  // Default: assume it supports stroke width for unknown styles
  return true;
}

/**
 * Determines if an icon library primarily uses filled icons
 * Used for libraries that don't have explicit style definitions
 */
export function isFilledIconLibrary(iconId: string): boolean {
  const filledLibraryPrefixes = [
    'boxicons-', // BoxIcons are primarily filled
    'ant-', // Many Ant Design icons are filled
  ];

  return filledLibraryPrefixes.some(prefix => iconId.startsWith(prefix));
}

/**
 * Get style priority for sorting (lower number = higher priority)
 * Prioritizes outline/line/stroke icons first, then regular, then solid/filled
 * Special handling for Solar icons with custom order
 */
export function getStylePriority(style: string, iconId?: string): number {
  if (!style) return 1; // Default priority for no style

  const styleLower = style.toLowerCase();
  
  // Special handling for Solar icons
  if (iconId?.startsWith('solar-')) {
    const solarOrder: { [key: string]: number } = {
      'outline': 0,
      'linear': 1,
      'line duotone': 2,
      'broken': 3,
      'bold duotone': 4,
      'bold': 5
    };
    
    return solarOrder[styleLower] ?? 6;
  }
  
  // Priority 0: outline, line, stroke styles (most preferred)
  if (['outline', 'line', 'stroke', 'thin', 'light', 'regular'].includes(styleLower)) {
    return 0;
  }
  
  // Priority 1: default/unknown styles
  if (['default', 'normal'].includes(styleLower)) {
    return 1;
  }
  
  // Priority 2: filled, solid, bold styles (less preferred)  
  if (['solid', 'filled', 'bold', 'bulk', 'fill'].includes(styleLower)) {
    return 2;
  }
  
  // Priority 3: other styles (animations, etc.)
  return 3;
}

/**
 * Sort icons by style priority first, then alphabetically by name
 * Ensures outline/line/stroke icons appear before filled/solid icons
 */
export function sortIconsByStyleThenName(icons: IconItem[]): IconItem[] {
  return [...icons].sort((a, b) => {
    // First sort by style priority
    const stylePriorityA = getStylePriority(a.style || '', a.id);
    const stylePriorityB = getStylePriority(b.style || '', b.id);
    
    if (stylePriorityA !== stylePriorityB) {
      return stylePriorityA - stylePriorityB;
    }
    
    // If same style priority, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}