import * as FeatherIcons from 'react-icons/fi';
import { type IconItem } from '@/types/icon';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { preprocessIcons } from '@/lib/icon-string-preprocessor';

// Get all Feather icons by filtering the exported names
const featherIconNames = Object.keys(FeatherIcons).filter(name => name.startsWith('Fi'));

// Category mapping for Feather icons
const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('arrow') || lowerName.includes('chevron') || lowerName.includes('menu') || lowerName.includes('navigation')) return 'navigation';
  if (lowerName.includes('mail') || lowerName.includes('message') || lowerName.includes('phone') || lowerName.includes('bell')) return 'communication';
  if (lowerName.includes('play') || lowerName.includes('pause') || lowerName.includes('music') || lowerName.includes('volume') || lowerName.includes('video')) return 'media';
  if (lowerName.includes('file') || lowerName.includes('folder') || lowerName.includes('document') || lowerName.includes('save')) return 'files';
  if (lowerName.includes('settings') || lowerName.includes('tool') || lowerName.includes('wrench') || lowerName.includes('sliders')) return 'system';
  if (lowerName.includes('dollar') || lowerName.includes('credit') || lowerName.includes('percent')) return 'finance';
  if (lowerName.includes('heart') || lowerName.includes('star') || lowerName.includes('share') || lowerName.includes('thumbs')) return 'social';
  if (lowerName.includes('user') || lowerName.includes('users') || lowerName.includes('contact')) return 'users';
  if (lowerName.includes('lock') || lowerName.includes('key') || lowerName.includes('shield')) return 'security';
  if (lowerName.includes('calendar') || lowerName.includes('clock') || lowerName.includes('watch')) return 'time';
  if (lowerName.includes('cloud') || lowerName.includes('sun') || lowerName.includes('moon')) return 'weather';
  if (lowerName.includes('map') || lowerName.includes('navigation') || lowerName.includes('compass') || lowerName.includes('globe')) return 'location';
  if (lowerName.includes('plus') || lowerName.includes('minus') || lowerName.includes('x') || lowerName.includes('check')) return 'actions';
  if (lowerName.includes('eye') || lowerName.includes('search') || lowerName.includes('zoom')) return 'view';
  
  return 'general';
};

const rawFeatherIcons: IconItem[] = featherIconNames.map(name => {
  const IconComponent = FeatherIcons[name as keyof typeof FeatherIcons];
  const displayName = name.slice(2); // Remove 'Fi' prefix
  const category = getCategoryFromName(name);
  
  // Add tags based on icon name patterns
  const tags = [
    displayName.toLowerCase(),
    name.toLowerCase(),
    category,
    'outline',
    // Add category tags based on common patterns
    ...(name.includes('Arrow') ? ['arrow', 'navigation'] : []),
    ...(name.includes('Alert') ? ['alert', 'warning'] : []),
    ...(name.includes('Settings') || name.includes('Tool') ? ['settings', 'tools'] : []),
    ...(name.includes('User') || name.includes('Person') ? ['user', 'people'] : []),
    ...(name.includes('Mail') || name.includes('Message') ? ['communication', 'mail'] : []),
    ...(name.includes('File') || name.includes('Folder') ? ['files', 'storage'] : []),
    ...(name.includes('Play') || name.includes('Pause') || name.includes('Music') ? ['media', 'audio'] : []),
    ...(name.includes('Heart') || name.includes('Star') ? ['favorites', 'social'] : []),
    ...(name.includes('Lock') || name.includes('Shield') ? ['security', 'privacy'] : []),
  ];

  return {
    id: `feather-${name.toLowerCase()}`,
    name: displayName,
    svg: IconComponent,
    style: 'outline',
    category,
    tags: [...new Set(tags)] // Remove duplicates
  };
});

// Initialize with React components, will be preprocessed to strings when loaded
let processedFeatherIcons: IconItem[] | null = null;

export async function getFeatherIcons(): Promise<IconItem[]> {
  if (!processedFeatherIcons) {
    processedFeatherIcons = await preprocessIcons(sortIconsByStyleThenName(rawFeatherIcons));
  }
  return processedFeatherIcons;
}

// For backwards compatibility and synchronous access
export const featherIcons: IconItem[] = sortIconsByStyleThenName(rawFeatherIcons);