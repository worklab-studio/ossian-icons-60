import { useState, useCallback } from 'react';
import { type IconItem } from '@/types/icon';

interface UseSimpleIconLibraryReturn {
  icons: IconItem[];
  isLoading: boolean;
  error: string | null;
  loadIcons: (iconData: IconItem[]) => void;
  clearIcons: () => void;
}

export function useSimpleIconLibrary(): UseSimpleIconLibraryReturn {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIcons = useCallback((iconData: IconItem[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simple validation
      const validIcons = iconData.filter(icon => 
        icon && icon.id && icon.name && icon.svg
      );
      
      setIcons(validIcons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load icons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearIcons = useCallback(() => {
    setIcons([]);
    setError(null);
  }, []);

  return {
    icons,
    isLoading,
    error,
    loadIcons,
    clearIcons
  };
}