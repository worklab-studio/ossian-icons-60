import { type IconItem } from '@/types/icon';
import { iconMap } from '../../iconMap';

// Helper function to parse metadata and determine category from icon name
function parseIconCategory(iconName: string): string {
  const name = iconName.toLowerCase();
  
  if (name.includes('archive') || name.includes('folder') || name.includes('document') || name.includes('file')) return 'Files & Folders';
  if (name.includes('arrow') || name.includes('direction') || name.includes('navigation') || name.includes('back') || name.includes('forward')) return 'Arrows & Navigation';
  if (name.includes('heart') || name.includes('like') || name.includes('favorite') || name.includes('star') || name.includes('rating')) return 'Social & Emotions';
  if (name.includes('user') || name.includes('profile') || name.includes('people') || name.includes('person') || name.includes('account')) return 'Users & People';
  if (name.includes('home') || name.includes('house') || name.includes('building') || name.includes('location') || name.includes('map')) return 'Places & Buildings';
  if (name.includes('shopping') || name.includes('cart') || name.includes('bag') || name.includes('store') || name.includes('payment')) return 'Shopping & Commerce';
  if (name.includes('message') || name.includes('chat') || name.includes('mail') || name.includes('notification') || name.includes('bell')) return 'Communication';
  if (name.includes('camera') || name.includes('photo') || name.includes('video') || name.includes('image') || name.includes('gallery')) return 'Media & Entertainment';
  if (name.includes('setting') || name.includes('gear') || name.includes('tool') || name.includes('configuration') || name.includes('system')) return 'Settings & Tools';
  if (name.includes('time') || name.includes('clock') || name.includes('calendar') || name.includes('date') || name.includes('schedule')) return 'Time & Calendar';
  if (name.includes('weather') || name.includes('sun') || name.includes('cloud') || name.includes('rain') || name.includes('temperature')) return 'Weather';
  if (name.includes('security') || name.includes('lock') || name.includes('key') || name.includes('shield') || name.includes('protect')) return 'Security';
  if (name.includes('health') || name.includes('medical') || name.includes('hospital') || name.includes('heart-pulse') || name.includes('medicine')) return 'Health & Medical';
  if (name.includes('transport') || name.includes('car') || name.includes('bus') || name.includes('plane') || name.includes('ship')) return 'Transportation';
  if (name.includes('edit') || name.includes('pen') || name.includes('pencil') || name.includes('write') || name.includes('text')) return 'Text & Editing';
  if (name.includes('play') || name.includes('pause') || name.includes('stop') || name.includes('music') || name.includes('volume')) return 'Media Controls';
  if (name.includes('wifi') || name.includes('bluetooth') || name.includes('network') || name.includes('signal') || name.includes('connection')) return 'Connectivity';
  if (name.includes('battery') || name.includes('charge') || name.includes('power') || name.includes('energy') || name.includes('plug')) return 'Power & Energy';
  
  return 'General';
}

// Helper function to determine icon style from name
function parseIconStyle(iconName: string): string {
  if (iconName.includes('-1') || iconName.includes('-3') || iconName.includes('-7')) return 'linear';
  if (iconName.includes('-2') || iconName.includes('-6')) return 'outline';  
  if (iconName.includes('-4') || iconName.includes('-8')) return 'broken';
  if (iconName.includes('-5') || iconName.includes('-9')) return 'twotone';
  if (iconName.includes('-11')) return 'bold';
  if (iconName.includes('-bulk')) return 'bulk';
  
  // Default style based on SVG content analysis
  if (iconName.includes('fill') || iconName.includes('solid')) return 'solid';
  
  return 'linear'; // Default to linear for Iconsax
}

// Helper function to generate search tags from icon name
function generateTags(iconName: string, category: string): string[] {
  const tags = ['iconsax'];
  
  // Add base name parts
  const baseName = iconName.replace(/-\d+$/, ''); // Remove style suffix
  const nameParts = baseName.split(/(?=[A-Z])|[-_]/).filter(Boolean);
  
  nameParts.forEach(part => {
    if (part.length > 2) {
      tags.push(part.toLowerCase());
    }
  });
  
  // Add category as tag
  tags.push(category.toLowerCase().replace(/\s+/g, '-'));
  
  // Add common synonyms
  if (iconName.includes('archive')) tags.push('folder', 'storage', 'organize');
  if (iconName.includes('arrow')) tags.push('direction', 'navigation', 'pointer');
  if (iconName.includes('user')) tags.push('profile', 'account', 'person');
  if (iconName.includes('home')) tags.push('house', 'main', 'start');
  if (iconName.includes('heart')) tags.push('love', 'like', 'favorite');
  if (iconName.includes('star')) tags.push('rating', 'favorite', 'bookmark');
  if (iconName.includes('message')) tags.push('chat', 'communication', 'talk');
  if (iconName.includes('setting')) tags.push('config', 'gear', 'options');
  
  return [...new Set(tags)]; // Remove duplicates
}

// Helper function to format display name
function formatDisplayName(iconName: string): string {
  // Remove style suffix numbers
  const baseName = iconName.replace(/-\d+$/, '');
  
  // Split camelCase and clean up
  return baseName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Filter out invalid SVG entries (mainly corrupted Mac OS X metadata)
function isValidSvg(svgContent: string): boolean {
  if (!svgContent || typeof svgContent !== 'string') return false;
  
  // Basic SVG structure check
  if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) return false;
  
  // Filter out corrupted Mac OS X metadata entries and other obvious corruption
  if (svgContent.includes('Mac OS X') || 
      svgContent.includes('__MACOSX') || 
      svgContent.includes('.DS_Store') ||
      svgContent.includes('com.apple.quarantine') ||
      svgContent.includes('ATTR')) return false;
  
  // Minimal length check (but more permissive)
  if (svgContent.length < 20) return false;
  
  return true;
}

// Check if an SVG can respond to color changes
function canChangeColor(svgContent: string): boolean {
  // Test if the SVG contains colorable elements
  const hasColorableContent = 
    svgContent.includes('#292D32') || // Main Iconsax color
    svgContent.includes('#2F2F2F') ||
    svgContent.includes('#333333') ||
    svgContent.includes('fill=') ||
    svgContent.includes('stroke=') ||
    svgContent.includes('currentColor') ||
    /style="[^"]*(?:fill|stroke)/.test(svgContent);
  
  // Reject icons with complex gradients or patterns that won't work with simple color replacement
  const hasComplexStructures = 
    svgContent.includes('<defs>') ||
    svgContent.includes('<linearGradient>') ||
    svgContent.includes('<radialGradient>') ||
    svgContent.includes('<pattern>') ||
    svgContent.includes('<mask>') ||
    svgContent.includes('<clipPath>');
  
  // Accept if it has colorable content and no complex structures
  return hasColorableContent && !hasComplexStructures;
}

// Transform the iconMap into IconItem array
export const iconsaxIcons: IconItem[] = Object.entries(iconMap)
  .filter(([_, svgContent]) => isValidSvg(svgContent) && canChangeColor(svgContent))
  .map(([iconName, svgContent]: [string, string]) => {
    const category = parseIconCategory(iconName);
    const style = parseIconStyle(iconName);
    const tags = generateTags(iconName, category);
    const displayName = formatDisplayName(iconName);

    return {
      id: `iconsax-${iconName}`,
      name: displayName,
      svg: svgContent,
      tags,
      style,
      category
    };
  })
  .filter(icon => icon.name.length > 1); // Filter out any malformed entries

console.log(`Loaded ${iconsaxIcons.length} Iconsax icons`);