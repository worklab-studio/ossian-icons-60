import { Home, Search, Settings, User } from 'lucide-react';
import { type IconItem } from '@/types/icon';

export const lucideIcons: IconItem[] = [
  {
    id: 'lucide-home',
    name: 'home',
    svg: Home,
    tags: ['house', 'building', 'residence', 'main'],
    category: 'navigation',
    style: 'outline'
  },
  {
    id: 'lucide-search',
    name: 'search',
    svg: Search,
    tags: ['find', 'magnify', 'look', 'discover'],
    category: 'system',
    style: 'outline'
  },
  {
    id: 'lucide-settings',
    name: 'settings',
    svg: Settings,
    tags: ['gear', 'options', 'preferences', 'config'],
    category: 'system',
    style: 'outline'
  },
  {
    id: 'lucide-user',
    name: 'user',
    svg: User,
    tags: ['person', 'profile', 'account', 'avatar'],
    category: 'people',
    style: 'outline'
  }
];