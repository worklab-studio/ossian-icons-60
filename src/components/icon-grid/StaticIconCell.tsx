import React, { useState, useCallback, useRef, useMemo } from 'react';
import { type IconItem } from '@/types/icon';
import { cn } from '@/lib/utils';
import { CopyTooltip } from '@/components/ui/copy-tooltip';
import { copyIcon } from '@/lib/copy';
import { getIconAriaLabel } from '@/lib/a11y';
import { HapticsManager } from '@/lib/haptics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';

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
  color = "#666",
  strokeWidth = 1.5,
  onCopy,
  onIconClick
}: StaticIconCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Memoize expensive color calculations - match IconCell behavior
  const colorStyles = useMemo(() => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 102, g: 79, b: 194 };
    };

    const selectedColor = color;
    const rgb = hexToRgb(selectedColor);
    
    const isLightModeWhite = theme === 'light' && selectedColor.toLowerCase() === '#ffffff';
    const isDarkModeBlack = theme === 'dark' && selectedColor.toLowerCase() === '#000000';
    
    return {
      '--icon-bg': isLightModeWhite 
        ? '128, 128, 128' 
        : isDarkModeBlack
        ? '200, 200, 200' 
        : `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      '--icon-color': selectedColor
    } as React.CSSProperties;
  }, [color, theme]);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger haptic feedback on mobile
    await HapticsManager.light();
    
    onIconClick?.(icon);
  }, [icon, onIconClick]);

  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    // Disable double-click on mobile - use explicit action sheet instead
    if (isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    await HapticsManager.medium();
    
    setShowTooltip(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    try {
      await copyIcon(icon, color, strokeWidth);
      setShowCopied(true);
      onCopy?.(icon);
      
      await HapticsManager.notification('success');
      setTimeout(() => setShowCopied(false), 1200);
    } catch (error) {
      console.error('Copy failed:', error);
      await HapticsManager.notification('error');
    }
  }, [icon, color, strokeWidth, onCopy, isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  }, [handleClick]);

  // Apply customization to SVG string
  const renderedIcon = useMemo(() => {
    if (typeof icon.svg !== 'string') return '';
    
    let svgString = icon.svg;
    
    // Apply color customization
    if (color !== "currentColor") {
      svgString = svgString.replace(/stroke="currentColor"/g, `stroke="${color}"`);
      svgString = svgString.replace(/fill="currentColor"/g, `fill="${color}"`);
      svgString = svgString.replace(/currentColor/g, color);
    }
    
    // Apply stroke-width customization for outline icons
    if (strokeWidth !== 1.5 && strokeWidth !== 2) {
      svgString = svgString.replace(/stroke-width="[\d.]+"/g, `stroke-width="${strokeWidth}"`);
    }
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: svgString }}
        className="icon-svg"
        style={{ 
          color: color,
          ['--icon-color' as any]: color,
        }}
      />
    );
  }, [icon.svg, color, strokeWidth]);

  // Cleanup timeout on unmount
  const cleanupTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
    cleanupTimeout();
  }, [cleanupTimeout]);

  return (
    <CopyTooltip showCopied={showCopied}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        tabIndex={0}
        role="button"
        aria-label={getIconAriaLabel(icon.name, isSelected)}
        aria-pressed={isSelected}
        data-selected={isSelected}
        data-hovered={isHovered}
        data-selected-state={isSelected}
        className="icon-cell"
        style={colorStyles}
      >
        <div className={cn(
          "icon-highlight",
          (isHovered || isSelected) && "icon-highlight--active"
        )} />
        
        {renderedIcon}
        
        {!isMobile && showTooltip && (
          <div className="icon-tooltip">
            Double click to copy icon
          </div>
        )}
      </button>
    </CopyTooltip>
  );
}