import { IconItem } from '../types/icon';

// Convert Fluent icon name from camelCase to readable format
const formatName = (name: string): string => {
  // Remove the icFluent prefix and 24Filled/24Regular suffix
  let baseName = name.replace(/^icFluent/, '').replace(/24(Filled|Regular)$/, '');
  
  // Convert camelCase to spaced words
  return baseName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, str => str.toUpperCase());
};

// Generate icon ID from name
const generateId = (name: string): string => {
  const baseName = name.replace(/^icFluent/, '').replace(/24(Filled|Regular)$/, '');
  const style = name.includes('Filled') ? '-filled' : '-regular';
  
  return 'fluent-' + baseName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '') + style;
};

// Categorize icons based on their names
const categorizeIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('home') || lowerName.includes('navigation') || lowerName.includes('arrow') || 
      lowerName.includes('chevron') || lowerName.includes('back') || lowerName.includes('forward') ||
      lowerName.includes('menu') || lowerName.includes('breadcrumb')) {
    return 'navigation';
  }
  
  if (lowerName.includes('person') || lowerName.includes('user') || lowerName.includes('profile') ||
      lowerName.includes('contact') || lowerName.includes('people') || lowerName.includes('group')) {
    return 'user';
  }
  
  if (lowerName.includes('settings') || lowerName.includes('config') || lowerName.includes('gear') ||
      lowerName.includes('options') || lowerName.includes('preferences') || lowerName.includes('admin')) {
    return 'system';
  }
  
  if (lowerName.includes('mail') || lowerName.includes('message') || lowerName.includes('chat') ||
      lowerName.includes('call') || lowerName.includes('phone') || lowerName.includes('communication')) {
    return 'communication';
  }
  
  if (lowerName.includes('file') || lowerName.includes('folder') || lowerName.includes('document') ||
      lowerName.includes('save') || lowerName.includes('open') || lowerName.includes('storage')) {
    return 'file';
  }
  
  if (lowerName.includes('media') || lowerName.includes('play') || lowerName.includes('pause') ||
      lowerName.includes('music') || lowerName.includes('video') || lowerName.includes('image')) {
    return 'media';
  }
  
  if (lowerName.includes('edit') || lowerName.includes('delete') || lowerName.includes('add') ||
      lowerName.includes('remove') || lowerName.includes('create') || lowerName.includes('modify')) {
    return 'action';
  }
  
  return 'general';
};

// Generate tags from icon name
const generateTags = (name: string, category: string): string[] => {
  const tags = new Set<string>();
  
  // Add category as tag
  tags.add(category);
  
  // Extract words from name
  const words = name
    .replace(/^icFluent/, '')
    .replace(/24(Filled|Regular)$/, '')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 1);
  
  words.forEach(word => tags.add(word.trim()));
  
  return Array.from(tags);
};

// Process SVG to use currentColor theming
const processSvg = (svg: string): string => {
  return svg.replace(/fill="#212121"/g, 'fill="currentColor"')
            .replace(/stroke="#212121"/g, 'stroke="currentColor"');
};

// Import the raw icon data
import iconMap from '../../Fluent  Icons.ts';

// Process all valid Fluent icons (starting from icFluent prefix)
export const fluentIcons: IconItem[] = Object.entries(iconMap)
  .filter(([key, value]) => 
    key.startsWith('icFluent') && 
    (key.includes('24Filled') || key.includes('24Regular')) &&
    typeof value === 'string' &&
    value.includes('<svg')
  )
  .map(([key, svg]) => ({
    id: generateId(key),
    name: formatName(key),
    svg: processSvg(svg),
    tags: generateTags(key, categorizeIcon(key)),
    style: key.includes('Filled') ? 'filled' : 'regular',
    category: categorizeIcon(key)
  }))
  .sort((a, b) => a.name.localeCompare(b.name));