import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type SectionedIconGridProps, type LibrarySection, type IconItem } from '@/types/icon';
import { IconCell } from './IconCell';

// Flatten sections for virtualization while keeping track of section headers
type VirtualItem = {
  type: 'header' | 'icons-row';
  sectionIndex: number;
  rowIndex?: number;
  icons?: IconItem[];
  libraryName?: string;
  sectionStart?: number; // Track where each section starts
};

export function SectionedIconGrid({
  sections,
  selectedId,
  onCopy,
  onIconClick,
  color = "currentColor",
  strokeWidth = 1.5,
  ariaLabel
}: SectionedIconGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate columns to fit container width without gaps (minimum 80px per icon)
  const columnsCount = containerWidth > 0 ? Math.floor(Math.max(containerWidth, 320) / 80) || 4 : 4;

  // Update container width and track scroll
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    updateWidth();
    const container = containerRef.current;
    
    window.addEventListener('resize', updateWidth);
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Create flattened virtual items array with section tracking
  const { virtualItems, sectionPositions } = useMemo(() => {
    const items: VirtualItem[] = [];
    const positions: { sectionIndex: number; libraryName: string; start: number }[] = [];
    let currentPosition = 0;
    
    sections.forEach((section, sectionIndex) => {
      // Track section start position
      positions.push({
        sectionIndex,
        libraryName: section.libraryName,
        start: currentPosition
      });
      
      // Add section header
      items.push({
        type: 'header',
        sectionIndex,
        libraryName: section.libraryName,
        sectionStart: currentPosition
      });
      currentPosition += 60; // Header height
      
      // Group icons into rows
      for (let i = 0; i < section.icons.length; i += columnsCount) {
        const rowIcons = section.icons.slice(i, i + columnsCount);
        items.push({
          type: 'icons-row',
          sectionIndex,
          rowIndex: Math.floor(i / columnsCount),
          icons: rowIcons
        });
        currentPosition += 80; // Row height
      }
    });
    
    return { virtualItems: items, sectionPositions: positions };
  }, [sections, columnsCount]);

  // Find which section header should be sticky
  const stickyHeader = useMemo(() => {
    let currentHeader = null;
    
    for (let i = sectionPositions.length - 1; i >= 0; i--) {
      const section = sectionPositions[i];
      if (section.start <= scrollTop) {
        currentHeader = section;
        break;
      }
    }
    
    return currentHeader;
  }, [sectionPositions, scrollTop]);

  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => {
      const item = virtualItems[index];
      return item?.type === 'header' ? 60 : 80; // Headers are 60px, icon rows are 80px
    },
    overscan: 5,
  });

  const computedAriaLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    const totalIcons = sections.reduce((sum, section) => sum + section.icons.length, 0);
    return `Icon results grid with ${totalIcons} icons across ${sections.length} libraries`;
  }, [ariaLabel, sections]);

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No icons found</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Fixed sticky header - floats over content */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[60px] bg-background/95 backdrop-blur-sm border-b border-border/50">
        {stickyHeader && (
          <div className="flex items-center pl-4 py-4 h-full">
            <h3 className="text-lg font-semibold text-foreground">
              {stickyHeader.libraryName}
            </h3>
          </div>
        )}
      </div>
      
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        role="grid"
        aria-label={computedAriaLabel}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = virtualItems[virtualItem.index];
            
            if (item?.type === 'header') {
              // Hide this header if it's the same as the sticky header
              const shouldHideHeader = stickyHeader && stickyHeader.sectionIndex === item.sectionIndex;
              
              if (shouldHideHeader) {
                return null;
              }
              
              return (
                <div
                  key={`header-${item.sectionIndex}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="flex items-center pl-4 py-4 bg-background/95 backdrop-blur-sm border-b border-border/50"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.libraryName}
                  </h3>
                </div>
              );
            }

            if (item?.type === 'icons-row' && item.icons) {
              return (
                <div
                  key={`row-${item.sectionIndex}-${item.rowIndex}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className=""
                >
                  <div className="grid min-w-0 gap-0" style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`, height: '80px' }}>
                    {item.icons.map((icon) => (
                      <IconCell
                        key={icon.id}
                        icon={icon}
                        isSelected={selectedId === icon.id}
                        color={color}
                        strokeWidth={strokeWidth}
                        onCopy={onCopy}
                        onIconClick={onIconClick}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
