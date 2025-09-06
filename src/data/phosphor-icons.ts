import * as PhosphorIcons from 'react-icons/pi';
import { type IconItem } from '@/types/icon';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { preprocessIcons } from '@/lib/icon-string-preprocessor';

// Get all Phosphor icons by filtering the exported names  
const phosphorIconNames = Object.keys(PhosphorIcons).filter(name => name.startsWith('Pi'));

// Category mapping for Phosphor icons
const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('arrow') || lowerName.includes('caret') || lowerName.includes('navigation') || lowerName.includes('compass')) return 'navigation';
  if (lowerName.includes('envelope') || lowerName.includes('chat') || lowerName.includes('phone') || lowerName.includes('bell')) return 'communication';
  if (lowerName.includes('play') || lowerName.includes('pause') || lowerName.includes('music') || lowerName.includes('speaker') || lowerName.includes('film')) return 'media';
  if (lowerName.includes('file') || lowerName.includes('folder') || lowerName.includes('archive') || lowerName.includes('floppy')) return 'files';
  if (lowerName.includes('gear') || lowerName.includes('wrench') || lowerName.includes('sliders') || lowerName.includes('knob')) return 'system';
  if (lowerName.includes('currency') || lowerName.includes('coin') || lowerName.includes('percent') || lowerName.includes('receipt')) return 'finance';
  if (lowerName.includes('heart') || lowerName.includes('star') || lowerName.includes('share') || lowerName.includes('thumbs')) return 'social';
  if (lowerName.includes('user') || lowerName.includes('person') || lowerName.includes('student')) return 'users';
  if (lowerName.includes('lock') || lowerName.includes('key') || lowerName.includes('shield') || lowerName.includes('fingerprint')) return 'security';
  if (lowerName.includes('calendar') || lowerName.includes('clock') || lowerName.includes('timer') || lowerName.includes('hourglass')) return 'time';
  if (lowerName.includes('cloud') || lowerName.includes('sun') || lowerName.includes('moon') || lowerName.includes('lightning')) return 'weather';
  if (lowerName.includes('map') || lowerName.includes('pin') || lowerName.includes('globe') || lowerName.includes('house')) return 'location';
  if (lowerName.includes('plus') || lowerName.includes('minus') || lowerName.includes('x') || lowerName.includes('check')) return 'actions';
  if (lowerName.includes('eye') || lowerName.includes('magnifying') || lowerName.includes('binoculars')) return 'view';
  
  return 'general';
};

const rawPhosphorIcons: IconItem[] = phosphorIconNames.map(name => {
  const IconComponent = PhosphorIcons[name as keyof typeof PhosphorIcons];
  const displayName = name.slice(2); // Remove 'Pi' prefix
  const category = getCategoryFromName(name);
  
  // Add tags based on icon name patterns
  const tags = [
    displayName.toLowerCase(),
    name.toLowerCase(),
    category,
    'outline',
    // Add category tags
    ...(name.includes('Arrow') ? ['arrow', 'navigation'] : []),
    ...(name.includes('Warning') || name.includes('Prohibit') ? ['alert', 'warning'] : []),
    ...(name.includes('Gear') || name.includes('Wrench') ? ['settings', 'tools'] : []),
    ...(name.includes('User') || name.includes('Person') ? ['user', 'people'] : []),
    ...(name.includes('Envelope') || name.includes('Chat') ? ['communication', 'mail'] : []),
    ...(name.includes('File') || name.includes('Folder') ? ['files', 'storage'] : []),
    ...(name.includes('Play') || name.includes('Pause') || name.includes('Music') ? ['media', 'audio'] : []),
    ...(name.includes('Heart') || name.includes('Star') ? ['favorites', 'social'] : []),
    ...(name.includes('Lock') || name.includes('Shield') ? ['security', 'privacy'] : []),
    ...(name.includes('Calendar') || name.includes('Clock') ? ['time', 'schedule'] : []),
  ];

  return {
    id: `phosphor-${name.toLowerCase()}`,
    name: displayName,
    svg: IconComponent,
    style: 'outline',
    category,
    tags: [...new Set(tags)]
  };
});

// Initialize with React components, will be preprocessed to strings when loaded
let processedPhosphorIcons: IconItem[] | null = null;

export async function getPhosphorIcons(): Promise<IconItem[]> {
  if (!processedPhosphorIcons) {
    processedPhosphorIcons = await preprocessIcons(sortIconsByStyleThenName(rawPhosphorIcons));
  }
  return processedPhosphorIcons;
}

// For backwards compatibility and synchronous access
export const phosphorIcons: IconItem[] = sortIconsByStyleThenName(rawPhosphorIcons);