import { useMemo } from 'react';
import { type IconItem } from '@/types/icon';

interface UseSimpleSearchReturn {
  searchIcons: (query: string, icons: IconItem[]) => IconItem[];
}

export function useSimpleSearch(): UseSimpleSearchReturn {
  const searchIcons = useMemo(
    () => (query: string, icons: IconItem[]): IconItem[] => {
      if (!query.trim()) return icons;
      
      const searchTerm = query.toLowerCase().trim();
      
      return icons.filter(icon => {
        // Search in name
        if (icon.name.toLowerCase().includes(searchTerm)) return true;
        
        // Search in tags
        if (icon.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
        
        // Search in category
        if (icon.category?.toLowerCase().includes(searchTerm)) return true;
        
        return false;
      });
    },
    []
  );

  return { searchIcons };
}