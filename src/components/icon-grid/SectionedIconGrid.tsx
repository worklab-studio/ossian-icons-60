import React from 'react';
import { type IconItem } from '@/types/icon';
import { IconCell } from './IconCell';
import { useIconCustomization } from '@/contexts/IconCustomizationContext';

export interface LibrarySection {
  libraryId: string;
  libraryName: string;
  icons: IconItem[];
}

interface SectionedIconGridProps {
  sections: LibrarySection[];
  selectedId?: string | null;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
  color?: string;
  strokeWidth?: number;
  ariaLabel?: string;
}

export function SectionedIconGrid({ 
  sections, 
  selectedId,
  onCopy,
  onIconClick,
  color,
  strokeWidth,
  ariaLabel = "Sectioned icon grid"
}: SectionedIconGridProps) {
  const { customization } = useIconCustomization();

  // Use passed props or fallback to customization context
  const finalColor = color || customization.color;
  const finalStrokeWidth = strokeWidth || customization.strokeWidth;

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No icons found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" role="grid" aria-label={ariaLabel}>
      {sections.map((section) => {
        if (section.icons.length === 0) return null;
        
        return (
          <div key={section.libraryId} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {section.libraryName}
              </h3>
              <span className="text-sm text-muted-foreground">
                {section.icons.length.toLocaleString()} icons
              </span>
            </div>
            
            {/* Section Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
              {section.icons.map((icon) => (
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
          </div>
        );
      })}
    </div>
  );
}