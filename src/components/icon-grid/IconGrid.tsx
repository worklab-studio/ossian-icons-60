import React, { useRef, useMemo } from "react";
import { type IconGridProps } from "@/types/icon";
import { IconCell } from "./IconCell";
import { useVirtualGrid } from "./useVirtualGrid";
import { getGridAriaLabel } from "@/lib/a11y";
import { cn } from "@/lib/utils";

export function IconGrid({
  items,
  selectedId,
  onCopy,
  onIconClick,
  color = "currentColor",
  strokeWidth = 1.5,
  ariaLabel,
  libraryName,
}: IconGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { virtualizer, rows, columnsCount } = useVirtualGrid({
    items,
    containerRef,
    enabled: items.length > 100, // Only virtualize for large lists
  });

  const computedAriaLabel = useMemo(() => {
    return ariaLabel || getGridAriaLabel(items.length);
  }, [ariaLabel, items.length]);

  // Enhanced smooth scrolling container with consistent styling
  return (
    <div className="relative h-full">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        role="grid"
        aria-label={computedAriaLabel}
      >
        {items.length > 100 ? (
          // Virtualized rendering for large lists
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = rows[virtualItem.index];
              if (!row) return null;

              return (
                <div
                  key={virtualItem.index}
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
                   <div className="grid min-w-0 gap-0" style={{ 
                     gridTemplateColumns: `repeat(${columnsCount}, 80px)`, 
                     height: '80px'
                   }}>
                    {row.map((icon) => (
                      <IconCell
                        key={icon.id}
                        icon={icon}
                        isSelected={icon.id === selectedId}
                        color={color}
                        strokeWidth={strokeWidth}
                        onCopy={onCopy}
                        onIconClick={onIconClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Simple grid for smaller lists with fixed 80px height
          <div className="grid min-w-0 gap-0" 
               style={{ 
            gridTemplateColumns: `repeat(${columnsCount}, 80px)`,
                 gridAutoRows: '80px'
               }}>
            {items.map((icon) => (
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
        )}
      </div>
    </div>
  );
}