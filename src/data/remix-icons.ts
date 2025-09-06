import { type IconItem } from "@/types/icon";
import * as RemixIcons from "@remixicon/react";
import { sortIconsByStyleThenName } from '@/lib/icon-utils';

// Category mapping based on Remix Icon naming patterns
function getCategoryFromName(name: string): string {
  const normalizedName = name.toLowerCase();
  
  // System and interface
  if (normalizedName.includes('arrow') || normalizedName.includes('chevron') || normalizedName.includes('corner')) return 'arrows';
  if (normalizedName.includes('cursor') || normalizedName.includes('drag') || normalizedName.includes('hand')) return 'cursors';
  if (normalizedName.includes('loader') || normalizedName.includes('refresh') || normalizedName.includes('restart')) return 'loaders';
  if (normalizedName.includes('checkbox') || normalizedName.includes('radio') || normalizedName.includes('toggle')) return 'forms';
  if (normalizedName.includes('eye') || normalizedName.includes('visible') || normalizedName.includes('invisible')) return 'visibility';
  
  // Communication
  if (normalizedName.includes('mail') || normalizedName.includes('message') || normalizedName.includes('chat')) return 'communication';
  if (normalizedName.includes('phone') || normalizedName.includes('telephone') || normalizedName.includes('mobile')) return 'communication';
  if (normalizedName.includes('notification') || normalizedName.includes('alarm') || normalizedName.includes('bell')) return 'notifications';
  
  // Media and files
  if (normalizedName.includes('image') || normalizedName.includes('photo') || normalizedName.includes('camera')) return 'media';
  if (normalizedName.includes('video') || normalizedName.includes('film') || normalizedName.includes('movie')) return 'media';
  if (normalizedName.includes('music') || normalizedName.includes('sound') || normalizedName.includes('volume')) return 'media';
  if (normalizedName.includes('file') || normalizedName.includes('folder') || normalizedName.includes('document')) return 'files';
  if (normalizedName.includes('download') || normalizedName.includes('upload') || normalizedName.includes('cloud')) return 'files';
  
  // Navigation and layout
  if (normalizedName.includes('menu') || normalizedName.includes('sidebar') || normalizedName.includes('panel')) return 'navigation';
  if (normalizedName.includes('tab') || normalizedName.includes('window') || normalizedName.includes('layout')) return 'layout';
  if (normalizedName.includes('grid') || normalizedName.includes('list') || normalizedName.includes('table')) return 'layout';
  
  // Social and brands
  if (normalizedName.includes('facebook') || normalizedName.includes('twitter') || normalizedName.includes('instagram')) return 'social';
  if (normalizedName.includes('github') || normalizedName.includes('linkedin') || normalizedName.includes('youtube')) return 'social';
  if (normalizedName.includes('google') || normalizedName.includes('microsoft') || normalizedName.includes('apple')) return 'brands';
  
  // Business and finance
  if (normalizedName.includes('money') || normalizedName.includes('coin') || normalizedName.includes('wallet')) return 'finance';
  if (normalizedName.includes('bank') || normalizedName.includes('card') || normalizedName.includes('payment')) return 'finance';
  if (normalizedName.includes('shopping') || normalizedName.includes('store') || normalizedName.includes('cart')) return 'commerce';
  
  // Location and maps
  if (normalizedName.includes('map') || normalizedName.includes('location') || normalizedName.includes('pin')) return 'maps';
  if (normalizedName.includes('navigation') || normalizedName.includes('compass') || normalizedName.includes('direction')) return 'maps';
  
  // Weather and nature
  if (normalizedName.includes('sun') || normalizedName.includes('moon') || normalizedName.includes('cloud')) return 'weather';
  if (normalizedName.includes('rain') || normalizedName.includes('snow') || normalizedName.includes('storm')) return 'weather';
  if (normalizedName.includes('plant') || normalizedName.includes('leaf') || normalizedName.includes('tree')) return 'nature';
  
  // Transportation
  if (normalizedName.includes('car') || normalizedName.includes('bus') || normalizedName.includes('train')) return 'transportation';
  if (normalizedName.includes('plane') || normalizedName.includes('ship') || normalizedName.includes('bike')) return 'transportation';
  
  // Security and tools
  if (normalizedName.includes('lock') || normalizedName.includes('key') || normalizedName.includes('shield')) return 'security';
  if (normalizedName.includes('tool') || normalizedName.includes('settings') || normalizedName.includes('gear')) return 'tools';
  if (normalizedName.includes('code') || normalizedName.includes('terminal') || normalizedName.includes('bug')) return 'development';
  
  // Health and medical
  if (normalizedName.includes('health') || normalizedName.includes('heart') || normalizedName.includes('pulse')) return 'health';
  if (normalizedName.includes('medicine') || normalizedName.includes('hospital') || normalizedName.includes('first')) return 'health';
  
  // Time and calendar
  if (normalizedName.includes('time') || normalizedName.includes('clock') || normalizedName.includes('watch')) return 'time';
  if (normalizedName.includes('calendar') || normalizedName.includes('date') || normalizedName.includes('schedule')) return 'time';
  
  // Sports and games
  if (normalizedName.includes('game') || normalizedName.includes('play') || normalizedName.includes('sport')) return 'games';
  if (normalizedName.includes('ball') || normalizedName.includes('football') || normalizedName.includes('basketball')) return 'sports';
  
  // Default categories
  if (normalizedName.includes('user') || normalizedName.includes('person') || normalizedName.includes('account')) return 'users';
  if (normalizedName.includes('star') || normalizedName.includes('bookmark') || normalizedName.includes('favorite')) return 'bookmarks';
  if (normalizedName.includes('edit') || normalizedName.includes('delete') || normalizedName.includes('add')) return 'actions';
  
  return 'general';
}

// Generate tags from icon name
function generateTags(name: string, category: string): string[] {
  const tags = new Set<string>();
  
  // Add category as a tag
  tags.add(category);
  
  // Split name by common separators and add as tags
  const nameParts = name
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(part => part.length > 1);
  
  nameParts.forEach(part => tags.add(part));
  
  // Add specific tags based on name patterns
  if (name.toLowerCase().includes('line')) tags.add('outline');
  if (name.toLowerCase().includes('fill')) tags.add('solid');
  
  return Array.from(tags);
}

// Transform Remix Icons into IconItem format
const rawRemixIcons: IconItem[] = Object.entries(RemixIcons)
  .filter(([name]) => name !== 'default' && typeof RemixIcons[name as keyof typeof RemixIcons] === 'function')
  .map(([name, IconComponent]) => {
    const cleanName = name.replace(/^Ri/, '').replace(/(Line|Fill)$/, '');
    const category = getCategoryFromName(cleanName);
    const tags = generateTags(cleanName, category);
    const style = name.endsWith('Line') ? 'outline' : name.endsWith('Fill') ? 'solid' : 'regular';
    
    return {
      id: `remix-${name}`,
      name: cleanName,
      svg: IconComponent,
      style,
      category,
      tags
    };
  });

export const remixIcons: IconItem[] = sortIconsByStyleThenName(rawRemixIcons);