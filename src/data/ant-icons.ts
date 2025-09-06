import { IconItem } from '../types/icon';
import { iconMap } from '../../Ant design system';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';

// Helper function to convert camelCase to title case
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

// Helper function to generate tags from icon name
function generateTags(name: string): string[] {
  const words = name.toLowerCase().split(/[\s-_]+/);
  const tags = [...words];
  
  // Add common synonyms and related terms
  if (words.some(w => ['home', 'house'].includes(w))) tags.push('main', 'start');
  if (words.some(w => ['user', 'person', 'profile'].includes(w))) tags.push('account', 'avatar');
  if (words.some(w => ['setting', 'config', 'gear'].includes(w))) tags.push('preferences', 'options');
  if (words.some(w => ['search', 'find'].includes(w))) tags.push('lookup', 'query');
  if (words.some(w => ['edit', 'pencil'].includes(w))) tags.push('modify', 'update');
  if (words.some(w => ['delete', 'remove', 'trash'].includes(w))) tags.push('bin', 'clear');
  if (words.some(w => ['arrow', 'direction'].includes(w))) tags.push('navigation', 'pointer');
  
  return [...new Set(tags)]; // Remove duplicates
}

// Helper function to categorize icons based on their names
function categorizeIcon(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Navigation
  if (/home|house|arrow|direction|navigation|menu|back|forward|up|down|left|right|chevron|caret/.test(lowerName)) {
    return 'navigation';
  }
  
  // User & People
  if (/user|person|profile|account|avatar|people|team|contact|face/.test(lowerName)) {
    return 'user';
  }
  
  // System & Settings
  if (/setting|config|gear|system|preference|option|control|admin|tool/.test(lowerName)) {
    return 'system';
  }
  
  // Communication
  if (/message|chat|mail|email|phone|call|notification|bell|alert|comment/.test(lowerName)) {
    return 'communication';
  }
  
  // Media & Files
  if (/file|document|folder|image|video|audio|music|photo|picture|camera|play|pause|stop/.test(lowerName)) {
    return 'media';
  }
  
  // Business & Finance
  if (/money|dollar|bank|card|payment|shop|cart|business|finance|chart|graph/.test(lowerName)) {
    return 'business';
  }
  
  // Security
  if (/lock|unlock|key|security|shield|protect|safe|password/.test(lowerName)) {
    return 'security';
  }
  
  // Social & Brand
  if (/like|heart|star|share|social|brand|twitter|facebook|github|google/.test(lowerName)) {
    return 'social';
  }
  
  // Design & Development
  if (/code|api|database|server|cloud|design|color|palette|brush/.test(lowerName)) {
    return 'development';
  }
  
  // Time & Calendar
  if (/time|clock|calendar|date|schedule|event/.test(lowerName)) {
    return 'time';
  }
  
  // Default category
  return 'general';
}

// Helper function to process SVG content for theming
function processSvg(svgContent: string): string {
  return svgContent
    // Remove XML declarations and DOCTYPE
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    // Standardize the SVG opening tag
    .replace(/<svg[^>]*>/g, (match) => {
      // Extract viewBox if it exists, or use default
      const viewBoxMatch = match.match(/viewBox="([^"]*)"/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1024 1024';
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">`;
    })
    // Replace hardcoded colors with currentColor for theming
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    // Clean up extra whitespace and newlines
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

// Process all icons from the iconMap
const rawAntIcons: IconItem[] = Object.entries(iconMap).map(([key, svgContent]) => {
  const name = camelToTitle(key);
  const processedSvg = processSvg(svgContent);
  
  return {
    id: `ant-${key.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`,
    name,
    svg: processedSvg,
    tags: generateTags(name),
    style: 'outline',
    category: categorizeIcon(name),
  };
});

export const antIcons: IconItem[] = sortIconsByStyleThenName(rawAntIcons);