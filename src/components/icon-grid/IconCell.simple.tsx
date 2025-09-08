import React from "react";
import { type IconItem } from "@/types/icon";
import { cn } from "@/lib/utils";

interface IconCellProps {
  icon: IconItem;
  isSelected?: boolean;
  color?: string;
  strokeWidth?: number;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
}

export function IconCellSimple({ 
  icon, 
  isSelected = false, 
  color = "currentColor", 
  strokeWidth = 1.5,
  onCopy,
  onIconClick
}: IconCellProps) {
  const handleClick = () => {
    onIconClick?.(icon);
  };

  const renderIcon = () => {
    if (typeof icon.svg === 'string') {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: icon.svg }}
          className="icon-svg"
          style={{ 
            color,
            strokeWidth: strokeWidth + 'px'
          }}
        />
      );
    } else if (React.isValidElement(icon.svg) || typeof icon.svg === 'function') {
      // Handle React component icons
      const IconComponent = icon.svg as React.ComponentType<any>;
      return (
        <IconComponent 
          className="icon-component"
          style={{ 
            color,
            strokeWidth: strokeWidth + 'px'
          }}
          size={32}
          width={32}
          height={32}
        />
      );
    } else {
      // Fallback for invalid icons
      return (
        <div className="icon-error">
          <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded" />
        </div>
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "icon-cell",
        "hover:bg-icon-hover focus:bg-icon-hover",
        isSelected && "bg-accent"
      )}
      data-selected-state={isSelected}
      aria-label={`Select ${icon.name} icon`}
    >
      {renderIcon()}
    </button>
  );
}