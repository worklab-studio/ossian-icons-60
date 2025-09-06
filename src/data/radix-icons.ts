import { IconItem } from '../types/icon';
import { iconMap } from '../../Radix icons';

// Radix Icons - Complete collection from https://www.radix-ui.com/icons
// All 318 professional icons imported and processed

// Helper function to convert camelCase to Title Case
function camelCaseToTitleCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

// Helper function to categorize icons based on their names
function categorizeIcon(iconName: string): string {
  const name = iconName.toLowerCase();
  
  if (name.includes('home') || name.includes('house') || name.includes('arrow') || name.includes('chevron') || name.includes('nav') || name.includes('align') || name.includes('direction')) {
    return 'navigation';
  }
  if (name.includes('person') || name.includes('user') || name.includes('people') || name.includes('profile') || name.includes('avatar') || name.includes('face')) {
    return 'user';
  }
  if (name.includes('chat') || name.includes('message') || name.includes('mail') || name.includes('envelope') || name.includes('phone') || name.includes('call') || name.includes('bell') || name.includes('notification')) {
    return 'communication';
  }
  if (name.includes('play') || name.includes('pause') || name.includes('stop') || name.includes('music') || name.includes('video') || name.includes('camera') || name.includes('image') || name.includes('photo')) {
    return 'media';
  }
  if (name.includes('pen') || name.includes('pencil') || name.includes('brush') || name.includes('draw') || name.includes('design') || name.includes('create') || name.includes('edit')) {
    return 'design';
  }
  if (name.includes('file') || name.includes('folder') || name.includes('document') || name.includes('save') || name.includes('download') || name.includes('upload') || name.includes('archive')) {
    return 'files';
  }
  if (name.includes('cart') || name.includes('bag') || name.includes('shop') || name.includes('commerce') || name.includes('money') || name.includes('card') || name.includes('payment')) {
    return 'commerce';
  }
  if (name.includes('calendar') || name.includes('clock') || name.includes('time') || name.includes('timer') || name.includes('stopwatch') || name.includes('schedule')) {
    return 'time';
  }
  if (name.includes('lock') || name.includes('key') || name.includes('shield') || name.includes('security') || name.includes('protect') || name.includes('safe')) {
    return 'security';
  }
  if (name.includes('cloud') || name.includes('weather') || name.includes('sun') || name.includes('moon') || name.includes('rain') || name.includes('wind')) {
    return 'weather';
  }
  if (name.includes('pin') || name.includes('location') || name.includes('map') || name.includes('place') || name.includes('marker') || name.includes('globe')) {
    return 'location';
  }
  if (name.includes('car') || name.includes('plane') || name.includes('ship') || name.includes('bike') || name.includes('transport') || name.includes('vehicle')) {
    return 'transport';
  }
  if (name.includes('heart') || name.includes('health') || name.includes('medical') || name.includes('hospital') || name.includes('medicine') || name.includes('doctor')) {
    return 'health';
  }
  if (name.includes('game') || name.includes('sport') || name.includes('ball') || name.includes('trophy') || name.includes('medal') || name.includes('target')) {
    return 'sports';
  }
  if (name.includes('gear') || name.includes('setting') || name.includes('config') || name.includes('tool') || name.includes('wrench') || name.includes('cog') || name.includes('slider')) {
    return 'system';
  }
  if (name.includes('accessibility') || name.includes('wheelchair') || name.includes('blind') || name.includes('deaf') || name.includes('support')) {
    return 'accessibility';
  }
  if (name.includes('badge') || name.includes('award') || name.includes('star') || name.includes('bookmark') || name.includes('flag') || name.includes('tag')) {
    return 'status';
  }
  
  return 'general';
}

// Helper function to generate tags for an icon
function generateTags(iconName: string, category: string): string[] {
  const name = iconName.toLowerCase();
  const tags = [name, category];
  
  // Add semantic tags based on icon name
  const semanticMappings: Record<string, string[]> = {
    'home': ['house', 'main', 'start', 'dashboard'],
    'person': ['user', 'profile', 'account', 'people'],
    'avatar': ['user', 'profile', 'picture', 'face'],
    'envelope': ['mail', 'email', 'message', 'contact'],
    'chat': ['message', 'talk', 'conversation', 'bubble'],
    'bell': ['notification', 'alert', 'ring', 'sound'],
    'gear': ['settings', 'config', 'preferences', 'options'],
    'magnifying': ['search', 'find', 'look', 'zoom'],
    'plus': ['add', 'create', 'new', 'insert'],
    'minus': ['remove', 'subtract', 'delete', 'less'],
    'cross': ['close', 'cancel', 'exit', 'no'],
    'check': ['tick', 'confirm', 'approve', 'yes'],
    'heart': ['love', 'like', 'favorite', 'health'],
    'star': ['favorite', 'bookmark', 'rate', 'award'],
    'calendar': ['date', 'schedule', 'event', 'time'],
    'clock': ['time', 'schedule', 'timer', 'alarm'],
    'lock': ['secure', 'protect', 'private', 'safety'],
    'unlock': ['open', 'access', 'public', 'free'],
    'download': ['save', 'get', 'import', 'receive'],
    'upload': ['send', 'export', 'share', 'publish'],
    'share': ['social', 'send', 'distribute', 'network'],
    'bookmark': ['save', 'favorite', 'mark', 'remember'],
    'archive': ['store', 'backup', 'save', 'history'],
    'trash': ['delete', 'remove', 'bin', 'waste'],
    'copy': ['duplicate', 'clone', 'reproduce', 'paste'],
    'cut': ['scissors', 'remove', 'delete', 'slice'],
    'paste': ['insert', 'add', 'place', 'attach'],
    'eye': ['view', 'see', 'visible', 'show'],
    'eyeoff': ['hide', 'invisible', 'secret', 'private']
  };
  
  // Find matching semantic tags
  Object.entries(semanticMappings).forEach(([key, values]) => {
    if (name.includes(key)) {
      tags.push(...values);
    }
  });
  
  return [...new Set(tags)]; // Remove duplicates
}

// Processed Radix icons with proper categorization and tagging
export const radixIcons: IconItem[] = Object.entries(iconMap).map(([iconName, svg]) => {
  const category = categorizeIcon(iconName);
  const tags = generateTags(iconName, category);
  const displayName = camelCaseToTitleCase(iconName);

  return {
    id: `radix-${iconName}`,
    name: displayName,
    svg: svg, // Radix icons already use currentColor
    tags: tags,
    style: 'solid',
    category: category,
  };
});