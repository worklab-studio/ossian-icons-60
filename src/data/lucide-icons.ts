import { icons } from 'lucide-react';
import { type IconItem } from '@/types/icon';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { preprocessIcons } from '@/lib/icon-string-preprocessor';

// Category mapping for Lucide icons
const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('arrow') || lowerName.includes('chevron') || lowerName === 'menu' || lowerName === 'home' || lowerName.includes('navigation')) return 'navigation';
  if (lowerName.includes('mail') || lowerName.includes('message') || lowerName.includes('phone') || lowerName.includes('bell') || lowerName.includes('send') || lowerName.includes('chat')) return 'communication';
  if (lowerName.includes('play') || lowerName.includes('pause') || lowerName.includes('music') || lowerName.includes('volume') || lowerName.includes('video') || lowerName.includes('image') || lowerName.includes('camera') || lowerName.includes('film')) return 'media';
  if (lowerName.includes('file') || lowerName.includes('folder') || lowerName.includes('archive') || lowerName.includes('bookmark') || lowerName.includes('download') || lowerName.includes('upload') || lowerName.includes('save')) return 'files';
  if (lowerName.includes('settings') || lowerName.includes('tool') || lowerName.includes('wrench') || lowerName.includes('gear') || lowerName.includes('edit') || lowerName.includes('sliders')) return 'system';
  if (lowerName.includes('dollar') || lowerName.includes('credit') || lowerName.includes('bank') || lowerName.includes('coin') || lowerName.includes('wallet')) return 'finance';
  if (lowerName.includes('heart') || lowerName.includes('star') || lowerName.includes('share') || lowerName.includes('like') || lowerName.includes('thumbs')) return 'social';
  if (lowerName.includes('user') || lowerName.includes('person') || lowerName.includes('people') || lowerName.includes('contact')) return 'users';
  if (lowerName.includes('lock') || lowerName.includes('key') || lowerName.includes('shield') || lowerName.includes('eye') || lowerName.includes('security')) return 'security';
  if (lowerName.includes('calendar') || lowerName.includes('clock') || lowerName.includes('time') || lowerName.includes('watch')) return 'time';
  if (lowerName.includes('cloud') || lowerName.includes('sun') || lowerName.includes('moon') || lowerName.includes('weather')) return 'weather';
  if (lowerName.includes('map') || lowerName.includes('location') || lowerName.includes('pin') || lowerName.includes('globe') || lowerName.includes('building')) return 'location';
  if (lowerName.includes('plus') || lowerName.includes('minus') || lowerName.includes('x') || lowerName.includes('check') || lowerName.includes('search')) return 'actions';
  if (lowerName.includes('alert') || lowerName.includes('warning') || lowerName.includes('info') || lowerName.includes('help')) return 'alerts';
  if (lowerName.includes('shopping') || lowerName.includes('cart') || lowerName.includes('store') || lowerName.includes('tag')) return 'commerce';
  
  return 'general';
};

const rawLucideIcons: IconItem[] = Object.entries(icons).map(([name, IconComponent]) => {
  const category = getCategoryFromName(name);
  
  // Add tags based on icon name patterns
  const tags = [
    name.toLowerCase(),
    category,
    'outline',
    ...(name.includes('Arrow') ? ['arrow', 'navigation'] : []),
    ...(name.includes('Alert') ? ['alert', 'warning'] : []),
    ...(name.includes('Settings') ? ['settings', 'tools'] : []),
    ...(name.includes('User') ? ['user', 'people'] : []),
    ...(name.includes('Mail') ? ['communication', 'mail'] : []),
    ...(name.includes('File') ? ['files', 'storage'] : []),
    ...(name.includes('Play') ? ['media', 'audio'] : []),
    ...(name.includes('Heart') || name.includes('Star') ? ['favorites', 'social'] : []),
    ...(name.includes('Lock') ? ['security', 'privacy'] : []),
    ...(name.includes('Calendar') || name.includes('Clock') ? ['time', 'schedule'] : []),
  ];

  return {
    id: `lucide-${name.toLowerCase()}`,
    name,
    svg: IconComponent,
    style: 'outline',
    category,
    tags: [...new Set(tags)]
  };
});

// Initialize with React components, will be preprocessed to strings when loaded
let processedLucideIcons: IconItem[] | null = null;

export async function getLucideIcons(): Promise<IconItem[]> {
  if (!processedLucideIcons) {
    processedLucideIcons = await preprocessIcons(sortIconsByStyleThenName(rawLucideIcons));
  }
  return processedLucideIcons;
}

// For backwards compatibility and synchronous access
export const lucideIcons: IconItem[] = sortIconsByStyleThenName(rawLucideIcons);