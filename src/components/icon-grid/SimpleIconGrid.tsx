import React from 'react';
import { type IconItem } from '@/types/icon';
import { IconCellSimple } from './IconCell.simple';
import { useIconCustomization } from '@/contexts/IconCustomizationContext';

interface SimpleIconGridProps {
  icons: IconItem[];
  onIconClick?: (icon: IconItem) => void;
  onCopy?: (icon: IconItem) => void;
}

export function SimpleIconGrid({ 
  icons, 
  onIconClick, 
  onCopy 
}: SimpleIconGridProps) {
  const { customization } = useIconCustomization();

  if (icons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No icons found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
      {icons.map((icon) => (
        <IconCellSimple
          key={icon.id}
          icon={icon}
          color={customization.color}
          strokeWidth={customization.strokeWidth}
          onIconClick={onIconClick}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}