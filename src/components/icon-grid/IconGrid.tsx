import React, { useMemo } from 'react';
import { type IconItem } from '@/types/icon';
import { IconCell } from './IconCell';
import { useIconCustomization } from '@/contexts/IconCustomizationContext';

interface IconGridProps {
  items: IconItem[];
  selectedId?: string | null;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
  color?: string;
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}

export function IconGrid({ 
  items, 
  selectedId,
  onCopy,
  onIconClick,
  color,
  strokeWidth,
  ariaLabel = "Icon grid",
  className = ""
}: IconGridProps) {
  const { customization } = useIconCustomization();

  // Use passed props or fallback to customization context
  const finalColor = color || customization.color;
  const finalStrokeWidth = strokeWidth || customization.strokeWidth;

  // Memoize the grid items for performance
  const gridItems = useMemo(() => {
    return items.filter(icon => icon.svg !== undefined && icon.svg !== null);
  }, [items]);

  if (gridItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No icons found</p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1 ${className}`}
      role="grid"
      aria-label={ariaLabel}
    >
      {gridItems.map((icon) => (
        <IconCell
          key={icon.id}
          icon={icon}
          isSelected={selectedId === icon.id}
          color={finalColor}
          strokeWidth={finalStrokeWidth}
          onCopy={onCopy}
          onIconClick={onIconClick}
        />
      ))}
    </div>
  );
}