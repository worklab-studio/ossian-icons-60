import * as BootstrapIcons from 'react-bootstrap-icons';
import { type IconItem } from '@/types/icon';

// Get all Bootstrap icons by filtering the exported names
const bootstrapIconNames = Object.keys(BootstrapIcons).filter(name => name !== 'default');

// Category mapping for Bootstrap icons
const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('arrow') || lowerName.includes('chevron') || lowerName.includes('skip') || lowerName.includes('caret') || lowerName.includes('back') || lowerName.includes('forward') || lowerName.includes('menu') || lowerName.includes('nav')) return 'navigation';
  if (lowerName.includes('mail') || lowerName.includes('envelope') || lowerName.includes('chat') || lowerName.includes('telephone') || lowerName.includes('phone') || lowerName.includes('whatsapp') || lowerName.includes('messenger') || lowerName.includes('telegram') || lowerName.includes('bell')) return 'communication';
  if (lowerName.includes('play') || lowerName.includes('pause') || lowerName.includes('stop') || lowerName.includes('music') || lowerName.includes('volume') || lowerName.includes('speaker') || lowerName.includes('camera') || lowerName.includes('film') || lowerName.includes('video') || lowerName.includes('image') || lowerName.includes('youtube') || lowerName.includes('vimeo') || lowerName.includes('spotify')) return 'media';
  if (lowerName.includes('file') || lowerName.includes('folder') || lowerName.includes('archive') || lowerName.includes('download') || lowerName.includes('upload') || lowerName.includes('save') || lowerName.includes('cloud') || lowerName.includes('dropbox') || lowerName.includes('google') && lowerName.includes('drive')) return 'files';
  if (lowerName.includes('gear') || lowerName.includes('tools') || lowerName.includes('wrench') || lowerName.includes('hammer') || lowerName.includes('screwdriver') || lowerName.includes('nut') || lowerName.includes('sliders') || lowerName.includes('toggles')) return 'system';
  if (lowerName.includes('currency') || lowerName.includes('bank') || lowerName.includes('credit') || lowerName.includes('wallet') || lowerName.includes('paypal') || lowerName.includes('stripe') || lowerName.includes('bitcoin') || lowerName.includes('coin')) return 'finance';
  if (lowerName.includes('heart') || lowerName.includes('star') || lowerName.includes('share') || lowerName.includes('like') || lowerName.includes('thumbs') || lowerName.includes('facebook') || lowerName.includes('twitter') || lowerName.includes('instagram') || lowerName.includes('linkedin') || lowerName.includes('github') || lowerName.includes('discord') || lowerName.includes('reddit') || lowerName.includes('tiktok') || lowerName.includes('snapchat')) return 'social';
  if (lowerName.includes('person') || lowerName.includes('people') || lowerName.includes('user') || lowerName.includes('account') || lowerName.includes('profile')) return 'users';
  if (lowerName.includes('lock') || lowerName.includes('unlock') || lowerName.includes('key') || lowerName.includes('shield') || lowerName.includes('eye') || lowerName.includes('fingerprint') || lowerName.includes('incognito')) return 'security';
  if (lowerName.includes('calendar') || lowerName.includes('clock') || lowerName.includes('time') || lowerName.includes('watch') || lowerName.includes('alarm') || lowerName.includes('stopwatch')) return 'time';
  if (lowerName.includes('cloud') || lowerName.includes('sun') || lowerName.includes('moon') || lowerName.includes('snow') || lowerName.includes('wind') || lowerName.includes('umbrella') || lowerName.includes('brightness')) return 'weather';
  if (lowerName.includes('geo') || lowerName.includes('map') || lowerName.includes('pin') || lowerName.includes('compass') || lowerName.includes('globe') || lowerName.includes('building') || lowerName.includes('house') || lowerName.includes('hospital') || lowerName.includes('shop') || lowerName.includes('bank') && !lowerName.includes('piggy')) return 'location';
  if (lowerName.includes('plus') || lowerName.includes('dash') || lowerName.includes('x') || lowerName.includes('check') || lowerName.includes('search') || lowerName.includes('zoom') || lowerName.includes('filter') || lowerName.includes('sort') || lowerName.includes('refresh') || lowerName.includes('reload')) return 'actions';
  if (lowerName.includes('exclamation') || lowerName.includes('question') || lowerName.includes('info') || lowerName.includes('patch') || lowerName.includes('bug') || lowerName.includes('radioactive')) return 'alerts';
  if (lowerName.includes('bag') || lowerName.includes('cart') || lowerName.includes('shop') || lowerName.includes('basket') || lowerName.includes('receipt') || lowerName.includes('tag') || lowerName.includes('handbag')) return 'commerce';
  if (lowerName.includes('device') || lowerName.includes('laptop') || lowerName.includes('phone') || lowerName.includes('tablet') || lowerName.includes('desktop') || lowerName.includes('tv') || lowerName.includes('display') || lowerName.includes('monitor') || lowerName.includes('router') || lowerName.includes('cpu') || lowerName.includes('memory') || lowerName.includes('hdd') || lowerName.includes('ssd') || lowerName.includes('usb') || lowerName.includes('ethernet') || lowerName.includes('wifi') || lowerName.includes('bluetooth') || lowerName.includes('battery') || lowerName.includes('power') || lowerName.includes('plug')) return 'technology';
  if (lowerName.includes('controller') || lowerName.includes('xbox') || lowerName.includes('playstation') || lowerName.includes('nintendo') || lowerName.includes('steam') || lowerName.includes('twitch') || lowerName.includes('dice')) return 'gaming';
  if (lowerName.includes('book') || lowerName.includes('journal') || lowerName.includes('card') || lowerName.includes('newspaper') || lowerName.includes('pencil') || lowerName.includes('pen') || lowerName.includes('fonts') || lowerName.includes('type') || lowerName.includes('text') || lowerName.includes('quote') || lowerName.includes('chat') || lowerName.includes('alphabet') || lowerName.includes('paragraph')) return 'text';
  if (lowerName.includes('award') || lowerName.includes('trophy') || lowerName.includes('medal') || lowerName.includes('ribbon') || lowerName.includes('crown') || lowerName.includes('gem') || lowerName.includes('diamond')) return 'awards';
  if (lowerName.includes('truck') || lowerName.includes('bus') || lowerName.includes('car') || lowerName.includes('bicycle') || lowerName.includes('scooter') || lowerName.includes('train') || lowerName.includes('airplane') || lowerName.includes('rocket') || lowerName.includes('ship') || lowerName.includes('boat') || lowerName.includes('fuel') || lowerName.includes('ev')) return 'transport';
  if (lowerName.includes('cup') || lowerName.includes('egg') || lowerName.includes('apple') || lowerName.includes('cake')) return 'food';
  if (lowerName.includes('suit') || lowerName.includes('heart') && lowerName.includes('fill') || lowerName.includes('diamond') && lowerName.includes('fill') || lowerName.includes('club') || lowerName.includes('spade')) return 'cards';
  
  return 'general';
};

import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { preprocessIcons } from '@/lib/icon-string-preprocessor';

const rawBootstrapIcons: IconItem[] = bootstrapIconNames.map(name => {
  const IconComponent = BootstrapIcons[name as keyof typeof BootstrapIcons];
  const category = getCategoryFromName(name);
  
  // Create display name by adding spaces before capital letters and removing common prefixes
  const displayName = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^Bs/, '')
    .trim();
  
  // Determine style based on icon name
  const style = name.toLowerCase().includes('fill') ? 'solid' : 'outline';
  
  // Add tags based on icon name patterns
  const tags = [
    displayName.toLowerCase(),
    name.toLowerCase(),
    category,
    style,
    // Add specific tags based on common patterns
    ...(name.includes('Arrow') || name.includes('Chevron') || name.includes('Caret') ? ['arrow', 'navigation'] : []),
    ...(name.includes('Heart') || name.includes('Star') ? ['favorites', 'social'] : []),
    ...(name.includes('Envelope') || name.includes('Chat') || name.includes('Telephone') ? ['communication', 'contact'] : []),
    ...(name.includes('Gear') || name.includes('Tools') ? ['settings', 'tools'] : []),
    ...(name.includes('Person') || name.includes('People') ? ['user', 'people'] : []),
    ...(name.includes('File') || name.includes('Folder') ? ['files', 'storage'] : []),
    ...(name.includes('Play') || name.includes('Pause') || name.includes('Music') ? ['media', 'audio'] : []),
    ...(name.includes('Lock') || name.includes('Shield') || name.includes('Eye') ? ['security', 'privacy'] : []),
    ...(name.includes('Calendar') || name.includes('Clock') ? ['time', 'schedule'] : []),
    ...(name.includes('Plus') || name.includes('Dash') || name.includes('X') || name.includes('Check') ? ['actions'] : []),
    ...(name.includes('Search') || name.includes('Zoom') ? ['search', 'find'] : []),
    ...(name.includes('Download') || name.includes('Upload') || name.includes('Cloud') ? ['transfer', 'sync'] : []),
    ...(name.includes('Bag') || name.includes('Cart') || name.includes('Shop') ? ['shopping', 'ecommerce'] : []),
    ...(name.includes('Award') || name.includes('Trophy') || name.includes('Medal') ? ['achievement', 'reward'] : []),
    ...(name.includes('House') || name.includes('Building') ? ['building', 'property'] : []),
    ...(name.includes('Device') || name.includes('Laptop') || name.includes('Phone') ? ['devices', 'electronics'] : []),
    ...(name.includes('Facebook') || name.includes('Twitter') || name.includes('Instagram') || name.includes('Github') ? ['brand', 'social media'] : []),
    ...(name.includes('Bootstrap') ? ['brand', 'framework'] : []),
  ];

  return {
    id: `bootstrap-${name.toLowerCase()}`,
    name: displayName,
    svg: IconComponent,
    style,
    category,
    tags: [...new Set(tags)] // Remove duplicates
  };
});

// Initialize with React components, will be preprocessed to strings when loaded
let processedBootstrapIcons: IconItem[] | null = null;

export async function getBootstrapIcons(): Promise<IconItem[]> {
  if (!processedBootstrapIcons) {
    processedBootstrapIcons = await preprocessIcons(sortIconsByStyleThenName(rawBootstrapIcons));
  }
  return processedBootstrapIcons;
}

// For backwards compatibility and synchronous access
export const bootstrapIcons: IconItem[] = sortIconsByStyleThenName(rawBootstrapIcons);