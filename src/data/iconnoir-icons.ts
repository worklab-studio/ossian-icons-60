import { IconItem } from '../types/icon';
import { iconMap } from '../../IconNoir icons';
import { preprocessIcons } from '../lib/icon-string-preprocessor';

// IconNoir Icons - Complete collection from https://iconoir.com/
// All 1,671 professional icons imported and processed

// Helper function to convert camelCase to Title Case
function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (match) => match.toUpperCase()) // Capitalize first letter
    .trim();
}

// Helper function to categorize icons based on their names
function categorizeIcon(iconName: string): string {
  const name = iconName.toLowerCase();
  
  // Adobe Creative Suite
  if (name.includes('adobe')) return 'design';
  
  // Accessibility
  if (name.includes('accessibility')) return 'accessibility';
  
  // Navigation & Transport
  if (name.includes('airplane') || name.includes('car') || name.includes('bus') || 
      name.includes('train') || name.includes('boat') || name.includes('bike') ||
      name.includes('rocket') || name.includes('map') || name.includes('compass') ||
      name.includes('navigation') || name.includes('location') || name.includes('pin')) {
    return 'navigation';
  }
  
  // Communication & Social
  if (name.includes('phone') || name.includes('message') || name.includes('chat') ||
      name.includes('mail') || name.includes('email') || name.includes('notification') ||
      name.includes('bell') || name.includes('social') || name.includes('share') ||
      name.includes('twitter') || name.includes('facebook') || name.includes('instagram') ||
      name.includes('linkedin') || name.includes('youtube') || name.includes('whatsapp') ||
      name.includes('telegram') || name.includes('discord')) {
    return 'communication';
  }
  
  // Media & Entertainment
  if (name.includes('play') || name.includes('pause') || name.includes('video') ||
      name.includes('audio') || name.includes('music') || name.includes('speaker') ||
      name.includes('volume') || name.includes('headphone') || name.includes('microphone') ||
      name.includes('camera') || name.includes('image') || name.includes('photo') ||
      name.includes('movie') || name.includes('media') || name.includes('album')) {
    return 'media';
  }
  
  // Files & Documents
  if (name.includes('file') || name.includes('folder') || name.includes('document') ||
      name.includes('pdf') || name.includes('word') || name.includes('excel') ||
      name.includes('zip') || name.includes('download') || name.includes('upload') ||
      name.includes('cloud') || name.includes('save') || name.includes('backup')) {
    return 'files';
  }
  
  // Design & Layout
  if (name.includes('design') || name.includes('palette') || name.includes('color') ||
      name.includes('brush') || name.includes('pen') || name.includes('pencil') ||
      name.includes('draw') || name.includes('art') || name.includes('creative') ||
      name.includes('align') || name.includes('grid') || name.includes('layout') ||
      name.includes('frame') || name.includes('crop')) {
    return 'design';
  }
  
  // System & Settings
  if (name.includes('settings') || name.includes('config') || name.includes('gear') ||
      name.includes('tool') || name.includes('wrench') || name.includes('system') ||
      name.includes('admin') || name.includes('control') || name.includes('panel') ||
      name.includes('dashboard') || name.includes('monitor') || name.includes('screen') ||
      name.includes('window') || name.includes('browser') || name.includes('web')) {
    return 'system';
  }
  
  // Finance & Business
  if (name.includes('money') || name.includes('dollar') || name.includes('coin') ||
      name.includes('bank') || name.includes('card') || name.includes('payment') ||
      name.includes('wallet') || name.includes('business') || name.includes('chart') ||
      name.includes('graph') || name.includes('analytics') || name.includes('report') ||
      name.includes('finance') || name.includes('invoice') || name.includes('receipt')) {
    return 'finance';
  }
  
  // Shopping & E-commerce
  if (name.includes('cart') || name.includes('shop') || name.includes('store') ||
      name.includes('bag') || name.includes('purchase') || name.includes('product') ||
      name.includes('price') || name.includes('tag') || name.includes('sale') ||
      name.includes('delivery') || name.includes('package') || name.includes('box')) {
    return 'shopping';
  }
  
  // User & People
  if (name.includes('user') || name.includes('person') || name.includes('people') ||
      name.includes('profile') || name.includes('avatar') || name.includes('account') ||
      name.includes('team') || name.includes('group') || name.includes('contact')) {
    return 'user';
  }
  
  // Security
  if (name.includes('lock') || name.includes('unlock') || name.includes('key') ||
      name.includes('shield') || name.includes('security') || name.includes('password') ||
      name.includes('auth') || name.includes('login') || name.includes('logout') ||
      name.includes('protect') || name.includes('safe') || name.includes('privacy')) {
    return 'security';
  }
  
  // Weather & Nature
  if (name.includes('sun') || name.includes('moon') || name.includes('cloud') ||
      name.includes('rain') || name.includes('snow') || name.includes('wind') ||
      name.includes('weather') || name.includes('temperature') || name.includes('tree') ||
      name.includes('leaf') || name.includes('flower') || name.includes('plant') ||
      name.includes('nature') || name.includes('earth') || name.includes('globe')) {
    return 'nature';
  }
  
  // Health & Medical
  if (name.includes('health') || name.includes('medical') || name.includes('hospital') ||
      name.includes('doctor') || name.includes('pill') || name.includes('medicine') ||
      name.includes('heart') || name.includes('plus') || name.includes('cross') ||
      name.includes('band') || name.includes('stethoscope') || name.includes('syringe')) {
    return 'health';
  }
  
  // Transportation & Vehicles
  if (name.includes('transport') || name.includes('vehicle') || name.includes('wheel') ||
      name.includes('engine') || name.includes('gas') || name.includes('fuel') ||
      name.includes('parking') || name.includes('traffic') || name.includes('road')) {
    return 'transport';
  }
  
  // Food & Dining
  if (name.includes('food') || name.includes('restaurant') || name.includes('coffee') ||
      name.includes('cup') || name.includes('drink') || name.includes('kitchen') ||
      name.includes('cooking') || name.includes('chef') || name.includes('utensil') ||
      name.includes('fork') || name.includes('spoon') || name.includes('knife')) {
    return 'food';
  }
  
  // Sports & Fitness
  if (name.includes('sport') || name.includes('fitness') || name.includes('gym') ||
      name.includes('exercise') || name.includes('running') || name.includes('cycling') ||
      name.includes('swimming') || name.includes('ball') || name.includes('game') ||
      name.includes('trophy') || name.includes('medal') || name.includes('target')) {
    return 'sports';
  }
  
  // Time & Calendar
  if (name.includes('time') || name.includes('clock') || name.includes('calendar') ||
      name.includes('date') || name.includes('schedule') || name.includes('alarm') ||
      name.includes('timer') || name.includes('stopwatch') || name.includes('watch')) {
    return 'time';
  }
  
  // Education
  if (name.includes('book') || name.includes('education') || name.includes('school') ||
      name.includes('student') || name.includes('teacher') || name.includes('learn') ||
      name.includes('study') || name.includes('graduation') || name.includes('certificate') ||
      name.includes('diploma') || name.includes('academic') || name.includes('research')) {
    return 'education';
  }
  
  // Actions & Controls
  if (name.includes('add') || name.includes('remove') || name.includes('delete') ||
      name.includes('edit') || name.includes('create') || name.includes('new') ||
      name.includes('refresh') || name.includes('reload') || name.includes('sync') ||
      name.includes('update') || name.includes('cancel') || name.includes('confirm') ||
      name.includes('check') || name.includes('cross') || name.includes('close') ||
      name.includes('open') || name.includes('expand') || name.includes('collapse') ||
      name.includes('more') || name.includes('menu') || name.includes('option') ||
      name.includes('filter') || name.includes('search') || name.includes('find') ||
      name.includes('sort') || name.includes('list') || name.includes('view')) {
    return 'actions';
  }
  
  // Arrows & Directions
  if (name.includes('arrow') || name.includes('up') || name.includes('down') ||
      name.includes('left') || name.includes('right') || name.includes('next') ||
      name.includes('previous') || name.includes('forward') || name.includes('back') ||
      name.includes('return') || name.includes('undo') || name.includes('redo') ||
      name.includes('rotate') || name.includes('flip') || name.includes('turn')) {
    return 'arrows';
  }
  
  // Default fallback
  return 'general';
}

// Helper function to generate tags from icon name and category
function generateTags(iconName: string, category: string): string[] {
  const tags = [];
  
  // Add the original name as a tag
  tags.push(iconName.toLowerCase());
  
  // Add category as a tag
  if (category !== 'general') {
    tags.push(category);
  }
  
  // Add semantic tags based on name patterns
  const name = iconName.toLowerCase();
  
  // Common semantic mappings
  if (name.includes('home') || name.includes('house')) tags.push('home', 'house', 'main');
  if (name.includes('user') || name.includes('person')) tags.push('user', 'person', 'profile');
  if (name.includes('setting') || name.includes('gear')) tags.push('settings', 'gear', 'config');
  if (name.includes('search') || name.includes('find')) tags.push('search', 'find', 'magnify');
  if (name.includes('mail') || name.includes('email')) tags.push('mail', 'email', 'message');
  if (name.includes('phone') || name.includes('call')) tags.push('phone', 'call', 'contact');
  if (name.includes('heart') || name.includes('love')) tags.push('heart', 'love', 'favorite');
  if (name.includes('star') || name.includes('favorite')) tags.push('star', 'favorite', 'bookmark');
  if (name.includes('lock') || name.includes('secure')) tags.push('lock', 'secure', 'private');
  if (name.includes('key') || name.includes('password')) tags.push('key', 'password', 'auth');
  if (name.includes('cloud') || name.includes('storage')) tags.push('cloud', 'storage', 'backup');
  if (name.includes('download') || name.includes('save')) tags.push('download', 'save', 'export');
  if (name.includes('upload') || name.includes('import')) tags.push('upload', 'import', 'add');
  if (name.includes('edit') || name.includes('pencil')) tags.push('edit', 'modify', 'change');
  if (name.includes('delete') || name.includes('trash')) tags.push('delete', 'remove', 'trash');
  if (name.includes('calendar') || name.includes('date')) tags.push('calendar', 'date', 'schedule');
  if (name.includes('clock') || name.includes('time')) tags.push('clock', 'time', 'watch');
  
  // Remove duplicates and return
  return Array.from(new Set(tags));
}

// Processed IconNoir icons with proper categorization and tagging
const iconnoirIconsRaw: IconItem[] = Object.entries(iconMap).map(([iconName, svg]) => {
  const category = categorizeIcon(iconName);
  const tags = generateTags(iconName, category);
  const displayName = camelCaseToTitleCase(iconName);

  return {
    id: `iconnoir-${iconName}`,
    name: displayName,
    svg: svg,
    tags: tags,
    style: 'outline',
    category: category,
  };
});

// Cache for processed icons
let processedIconsCache: IconItem[] | null = null;

// Async function to get preprocessed icons
export async function getIconnoirIcons(): Promise<IconItem[]> {
  if (processedIconsCache) {
    return processedIconsCache;
  }
  
  try {
    processedIconsCache = await preprocessIcons(iconnoirIconsRaw);
    return processedIconsCache;
  } catch (error) {
    console.warn('Failed to preprocess Iconoir icons:', error);
    return iconnoirIconsRaw; // Fallback to raw icons
  }
}

// Synchronous export for backward compatibility
export const iconnoirIcons: IconItem[] = iconnoirIconsRaw;