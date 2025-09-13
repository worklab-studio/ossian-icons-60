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
    const isMobile = containerWidth < 640;
    if (isMobile) {
      // Fixed 4 columns on mobile for consistent square grid
      return 4;
    }
    
    // Better desktop column calculation with consistent 80px cells
    return Math.floor(Math.max(containerWidth, 320) / 80) || 4;
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
      // Calculate row height based on container width to maintain square cells
      const isMobile = containerWidth < 640;
      if (isMobile && containerWidth > 0) {
        return containerWidth / 4; // Square cells: width/4 columns = height
      }
      return 80; // Fixed 80px for desktop and tablet
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