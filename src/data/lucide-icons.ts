import { type IconItem } from '@/types/icon';
import * as LucideIcons from 'lucide-react';

// Convert Lucide icons to IconItem format
export const lucideIcons: IconItem[] = Object.entries(LucideIcons)
  .filter(([name, component]) => {
    // Filter out non-icon exports
    return name !== 'createLucideIcon' && 
           name !== 'Icon' && 
           typeof component === 'function' &&
           name[0] === name[0].toUpperCase(); // Component names start with uppercase
  })
  .map(([name, IconComponent]) => ({
    id: `lucide-${name.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`,
    name: name.replace(/([A-Z])/g, ' $1').trim(),
    svg: IconComponent as React.ComponentType<any>,
    tags: [
      'lucide',
      'outline',
      'stroke',
      name.toLowerCase()
    ],
    category: 'general',
    style: 'outline'
  }));