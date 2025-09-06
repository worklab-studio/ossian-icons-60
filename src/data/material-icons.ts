import { type IconItem } from '@/types/icon';
import { iconMap } from '../../Material';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';

// Material Design Icons data - Complete set imported from Material.ts

// Helper functions
function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function ensureCurrentColor(svg: string): string {
  // Handle both fill and stroke attributes for better color theming
  return svg
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    .replace(/<path/g, '<path fill="currentColor"');
}

function categorizeIcon(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Navigation
  if (/(arrow|chevron|navigation|menu|home|back|forward|up|down|left|right)/.test(lowerName)) return 'navigation';
  
  // Communication
  if (/(email|mail|phone|message|chat|comment|forum|bell|notification)/.test(lowerName)) return 'communication';
  
  // Action
  if (/(add|plus|minus|delete|edit|save|copy|paste|settings|search|filter|sort)/.test(lowerName)) return 'action';
  
  // Content
  if (/(text|format|content|document|page|article|blog|news)/.test(lowerName)) return 'content';
  
  // Device
  if (/(phone|computer|tablet|desktop|laptop|mobile|device|screen)/.test(lowerName)) return 'device';
  
  // File
  if (/(file|folder|document|download|upload|attachment|pdf|image)/.test(lowerName)) return 'file';
  
  // Image
  if (/(photo|camera|image|picture|gallery|album)/.test(lowerName)) return 'image';
  
  // Maps
  if (/(map|location|place|pin|marker|gps|navigation)/.test(lowerName)) return 'maps';
  
  // Social
  if (/(people|person|user|profile|account|group|share|social)/.test(lowerName)) return 'social';
  
  // Toggle
  if (/(check|toggle|switch|radio|select|option)/.test(lowerName)) return 'toggle';
  
  // AV (Audio/Video)
  if (/(play|pause|stop|music|video|audio|volume|speaker)/.test(lowerName)) return 'av';
  
  // Alert
  if (/(alert|warning|error|info|help|question|exclamation)/.test(lowerName)) return 'alert';
  
  // Hardware  
  if (/(keyboard|mouse|printer|scanner|headphone|microphone)/.test(lowerName)) return 'hardware';
  
  return 'other';
}

function generateTags(name: string, category: string): string[] {
  const tags = [name, category];
  const lowerName = name.toLowerCase();
  
  // Add semantic tags based on name patterns
  if (lowerName.includes('arrow')) tags.push('direction', 'navigation', 'pointer');
  if (lowerName.includes('heart')) tags.push('love', 'favorite', 'like');
  if (lowerName.includes('star')) tags.push('rating', 'favorite', 'bookmark');
  if (lowerName.includes('home')) tags.push('house', 'main', 'dashboard');
  if (lowerName.includes('user')) tags.push('person', 'profile', 'account');
  if (lowerName.includes('settings')) tags.push('config', 'preferences', 'options');
  if (lowerName.includes('search')) tags.push('find', 'lookup', 'magnify');
  if (lowerName.includes('delete')) tags.push('remove', 'trash', 'clear');
  
  return tags;
}

// Process all Material Design Icons from the iconMap
const processedMaterialIcons: IconItem[] = Object.entries(iconMap).map(([name, svg]) => {
  const displayName = camelCaseToTitleCase(name);
  const category = categorizeIcon(name);
  const tags = generateTags(name, category);
  
  return {
    id: `material-${name}`,
    name: displayName,
    svg: ensureCurrentColor(svg as string),
    tags,
    style: 'filled',
    category,
  };
});

export const materialIcons: IconItem[] = sortIconsByStyleThenName(processedMaterialIcons);