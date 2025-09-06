import { type IconItem } from '@/types/icon';
import * as LucideIcons from 'lucide-react';
import { type ComponentType } from 'react';

// Extract all Lucide icons and convert to IconItem format
export const lucideIcons: IconItem[] = Object.entries(LucideIcons)
  .filter(([name, component]) => {
    // Filter out non-icon exports (like createLucideIcon, etc.)
    return typeof component === 'object' && 
           component !== null && 
           'displayName' in component &&
           name !== 'createLucideIcon' &&
           name !== 'Icon' &&
           name !== 'icons' &&
           name !== 'dynamicIconImports';
  })
  .map(([name, component]) => ({
    id: `lucide-${name.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`,
    name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
    svg: component as ComponentType<any>,
    tags: [name.toLowerCase()],
    style: 'outline',
    category: 'general'
  }));

export const lucideIconsCount = lucideIcons.length;