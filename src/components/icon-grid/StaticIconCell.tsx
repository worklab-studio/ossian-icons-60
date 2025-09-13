import React from 'react';
import { type IconItem } from '@/types/icon';
import { cn } from '@/lib/utils';

interface StaticIconCellProps {
  icon: IconItem;
  isSelected?: boolean;
  color?: string;
  strokeWidth?: number;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
}

export function StaticIconCell({
  icon,
  isSelected = false,
  color = "currentColor",
  strokeWidth = 1.5,
  onCopy,
  onIconClick
}: StaticIconCellProps) {
  const handleClick = () => {
    onIconClick?.(icon);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(icon);
  };

  // Apply customization to SVG string
  const customizedSvg = React.useMemo(() => {
    if (typeof icon.svg !== 'string') return '';
    
    let svgString = icon.svg;
    
    // Apply color customization
    if (color !== "currentColor") {
      svgString = svgString.replace(/stroke="currentColor"/g, `stroke="${color}"`);
      svgString = svgString.replace(/fill="currentColor"/g, `fill="${color}"`);
    }
    
    // Apply stroke-width customization for outline icons
    if (strokeWidth !== 1.5 && strokeWidth !== 2) {
      svgString = svgString.replace(/stroke-width="[\d.]+"/g, `stroke-width="${strokeWidth}"`);
    }
    
    return svgString;
  }, [icon.svg, color, strokeWidth]);

  return (
    <div
      className={cn(
        "group relative flex h-[80px] cursor-pointer items-center justify-center border-r border-b border-border/50 bg-background transition-all duration-200 hover:bg-accent hover:border-accent-foreground/20",
        isSelected && "bg-accent border-accent-foreground/20"
      )}
      onClick={handleClick}
      role="gridcell"
      tabIndex={0}
      aria-label={`${icon.name} icon from ${icon.id.split('-')[0]} library`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon */}
      <div 
        className="flex h-6 w-6 items-center justify-center text-foreground group-hover:text-accent-foreground transition-colors"
        style={{ color }}
        dangerouslySetInnerHTML={{ __html: customizedSvg }}
      />
      
      {/* Copy button - shows on hover */}
      <button
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm bg-background/80 p-1 hover:bg-accent border border-border/50 shadow-sm"
        onClick={handleCopy}
        aria-label={`Copy ${icon.name} icon`}
        title={`Copy ${icon.name}`}
      >
        <svg
          className="h-3 w-3 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="1.5" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}