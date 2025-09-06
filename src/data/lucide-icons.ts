// Lucide Icons
// Generated from lucide-react package

import { type IconItem } from '@/types/icon';
import * as Icons from 'lucide-react';

export const lucideIcons: IconItem[] = Object.entries(Icons)
  .filter(([name, Component]) => 
    typeof Component === 'function' && 
    name !== 'createLucideIcon' &&
    name !== 'default' &&
    !name.startsWith('use') &&
    name.charAt(0) === name.charAt(0).toUpperCase() // Icon components start with uppercase
  )
  .map(([name, Component]) => ({
    id: `lucide-${name.toLowerCase()}`,
    name: name.replace(/([A-Z])/g, ' $1').trim(),
    svg: Component as any,
    style: 'outline',
    category: 'icon',
    tags: [name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()]
  }));