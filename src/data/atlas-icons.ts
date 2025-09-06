import { type IconItem } from "@/types/icon";
import { iconMap } from "../../atlas";
import { preprocessIcons } from '../lib/icon-string-preprocessor';

// Complete Atlas Icons Collection
// Auto-imported from atlas.ts - Contains thousands of professionally designed icons

// Convert iconMap to IconItem format with proper theming
const atlasIconsRaw: IconItem[] = Object.entries(iconMap).map(([key, svg]) => {
  // Ensure svg is a string and convert ALL hardcoded colors to currentColor for proper theming
  const svgString = String(svg);
  const themedSvg = svgString
    // Replace all hex colors in fill attributes (3 and 6 digit)
    .replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="currentColor"')
    .replace(/fill="#[0-9A-Fa-f]{3}"/g, 'fill="currentColor"')
    // Replace all hex colors in stroke attributes (3 and 6 digit)
    .replace(/stroke="#[0-9A-Fa-f]{6}"/g, 'stroke="currentColor"')
    .replace(/stroke="#[0-9A-Fa-f]{3}"/g, 'stroke="currentColor"')
    // Replace hex colors in CSS style attributes
    .replace(/style="([^"]*?)fill:\s*#[0-9A-Fa-f]{3,6}([^"]*?)"/gi, 'style="$1fill: currentColor$2"')
    .replace(/style="([^"]*?)stroke:\s*#[0-9A-Fa-f]{3,6}([^"]*?)"/gi, 'style="$1stroke: currentColor$2"')
    // Replace hex colors in CSS classes (common in Atlas icons like .cls-1{fill:#020202;})
    .replace(/<style[^>]*>([^<]*\.cls-\d+[^}]*fill:\s*#[0-9A-Fa-f]{3,6}[^<]*)<\/style>/gi, 
      (match, content) => match.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor'))
    .replace(/<style[^>]*>([^<]*\.cls-\d+[^}]*stroke:\s*#[0-9A-Fa-f]{3,6}[^<]*)<\/style>/gi, 
      (match, content) => match.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor'))
    // Replace stop-color in gradients
    .replace(/stop-color="#[0-9A-Fa-f]{3,6}"/gi, 'stop-color="currentColor"')
    // Preserve fill="none" and stroke="none" - restore them if they were converted
    .replace(/fill="currentColor"([^>]*?)stroke="currentColor"/g, 'fill="none"$1stroke="currentColor"')
    .replace(/fill="currentColor"([^>]*?)stroke="none"/g, 'fill="currentColor"$1stroke="none"')
    .replace(/fill="none"([^>]*?)stroke="currentColor"/g, 'fill="none"$1stroke="currentColor"');

  // Determine category based on key prefix
  let category = 'general';
  if (key.includes('achievement')) category = 'achievement';
  else if (key.includes('arrow') || key.includes('direction')) category = 'navigation';
  else if (key.includes('communication') || key.includes('message') || key.includes('mail')) category = 'communication';
  else if (key.includes('business') || key.includes('finance') || key.includes('money')) category = 'business';
  else if (key.includes('device') || key.includes('computer') || key.includes('mobile')) category = 'device';
  else if (key.includes('media') || key.includes('video') || key.includes('audio') || key.includes('music')) category = 'media';
  else if (key.includes('security') || key.includes('lock') || key.includes('shield')) category = 'security';
  else if (key.includes('weather') || key.includes('sun') || key.includes('cloud') || key.includes('rain')) category = 'weather';
  else if (key.includes('medical') || key.includes('health')) category = 'medical';
  else if (key.includes('transport') || key.includes('car') || key.includes('plane')) category = 'transport';
  else if (key.includes('social') || key.includes('people') || key.includes('user')) category = 'social';
  else if (key.includes('file') || key.includes('document') || key.includes('folder')) category = 'file';
  else if (key.includes('edit') || key.includes('design') || key.includes('tool')) category = 'design';

  return {
    id: `atlas-${key}`,
    name: key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim(),
    svg: themedSvg,
    tags: [
      key.replace(/[-_]/g, ' '),
      ...key.split(/[-_]/).filter(tag => tag.length > 2)
    ],
    style: 'outline',
    category
  };
});

// Cache for processed icons
let processedIconsCache: IconItem[] | null = null;

// Async function to get preprocessed icons
export async function getAtlasIcons(): Promise<IconItem[]> {
  if (processedIconsCache) {
    return processedIconsCache;
  }
  
  try {
    processedIconsCache = await preprocessIcons(atlasIconsRaw);
    return processedIconsCache;
  } catch (error) {
    console.warn('Failed to preprocess Atlas icons:', error);
    return atlasIconsRaw; // Fallback to raw icons
  }
}

// Synchronous export for backward compatibility
export const atlasIcons: IconItem[] = atlasIconsRaw;