import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { type IconItem } from '@/types/icon';

interface UseVirtualGridProps {
  items: IconItem[];
  containerRef: React.RefObject<HTMLDivElement>;
  enabled?: boolean;
}

export function useVirtualGrid({ items, containerRef, enabled = true }: UseVirtualGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize column calculation for mobile edge-to-edge grid
  const columnsCount = useMemo(() => {
    if (!containerWidth) return 4;
    
    // Use consistent 640px breakpoint to match use-mobile hook
    const isMobile = containerWidth < 768;
    
    if (isMobile) {
      // Mobile: 4 columns minimum, then scale based on 80px width
      const minCols = 4;
      const maxCols = Math.floor(containerWidth / 80);
      return Math.max(minCols, maxCols);
    } else {
      // Desktop: scale based on exactly fitting 80px cells
      const minCols = 6;
      const maxCols = Math.floor(containerWidth / 80);
      return Math.max(minCols, maxCols);
    }
  }, [containerWidth]);

  // Memoize row grouping with better performance
  const rows = useMemo(() => {
    if (!items.length) return [];
    
    const result: IconItem[][] = [];
    for (let i = 0; i < items.length; i += columnsCount) {
      result.push(items.slice(i, i + columnsCount));
    }
    return result;
  }, [items, columnsCount]);

  // Enhanced debounced resize handler for better performance
  const debouncedUpdateWidth = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth);
          }
        });
      }
    }, 100); // Reduced debounce for faster responsiveness
  }, [containerRef]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Initial width update
    updateWidth();
    
    // Add debounced resize listener
    window.addEventListener('resize', debouncedUpdateWidth, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedUpdateWidth);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [containerRef, debouncedUpdateWidth]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => {
      // Fixed 80px row height for all devices to match CSS grid
      return 80;
    },
    overscan: enabled && rows.length > 100 ? 2 : 5, // Dynamic overscan for performance
    enabled,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
    // Enhanced scrolling options for smoother experience
    initialOffset: 0,
    scrollPaddingStart: 0,
    scrollPaddingEnd: 0,
    measureElement: undefined, // Let browser handle measurements for speed
  });

  return {
    virtualizer,
    rows,
    columnsCount,
  };
}