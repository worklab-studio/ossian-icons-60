import React, { useState, useCallback, useRef, useMemo, memo } from "react";
import { Copy } from "lucide-react";
import { type IconItem } from "@/types/icon";
import { copyIcon } from "@/lib/copy";
import { getIconAriaLabel } from "@/lib/a11y";
import { CopyTooltip } from "@/components/ui/copy-tooltip";
import { cn } from "@/lib/utils";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { useTheme } from "next-themes";
import { renderToStaticMarkup } from "react-dom/server";
import { supportsStrokeWidth } from "@/lib/icon-utils";
import { HapticsManager } from "@/lib/haptics";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildCustomizedSvg, copyToClipboard } from "@/lib/svg-build";

console.log('IconCell module loading...', { memo, React });

interface IconCellProps {
  icon: IconItem;
  isSelected?: boolean;
  color?: string;
  strokeWidth?: number;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
}

// Export the component directly without memo for now
export function IconCell({ 
  icon, 
  isSelected = false, 
  color = "#666", 
  strokeWidth = 1.5,
  onCopy,
  onIconClick
}: IconCellProps) {
  console.log('IconCell rendering directly...', { icon, isSelected });
  const [isHovered, setIsHovered] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { customization } = useIconCustomization();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Memoize expensive color calculations
  const colorStyles = useMemo(() => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 102, g: 79, b: 194 };
    };

    const selectedColor = customization.color;
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
  }, [customization.color, theme]);

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
      const svgString = buildCustomizedSvg(icon, customization.color, customization.strokeWidth);
      await copyToClipboard(svgString);
      setShowCopied(true);
      onCopy?.(icon);
      
      await HapticsManager.notification('success');
      setTimeout(() => setShowCopied(false), 1200);
    } catch (error) {
      console.error('Copy failed:', error);
      await HapticsManager.notification('error');
    }
  }, [icon, customization.color, customization.strokeWidth, onCopy, isMobile]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await copyIcon(icon, customization.color, customization.strokeWidth);
      setShowCopied(true);
      onCopy?.(icon);
      
      // Auto-hide tooltip after 1.2s
      setTimeout(() => setShowCopied(false), 1200);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [icon, customization.color, customization.strokeWidth, onCopy]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  }, [handleClick]);

  // Use centralized SVG processing for consistent display and export
  const renderedIcon = useMemo(() => {
    const iconColor = customization.color;
    const iconStrokeWidth = customization.strokeWidth;
    
    if (!icon.svg) {
      return (
        <div className="icon-loading">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    
    try {
      // Use the centralized buildCustomizedSvg for consistent processing
      const processedSvg = buildCustomizedSvg(icon, iconColor, iconStrokeWidth);
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: processedSvg }}
          className="icon-svg"
          style={{ 
            color: iconColor,
            ['--icon-color' as any]: iconColor,
          }}
        />
      );
    } catch (error) {
      console.error('Error processing icon:', icon.id, error);
      return (
        <div className="icon-error">
          <span className="text-xs">⚠</span>
        </div>
      );
    }
  }, [icon, customization.color, customization.strokeWidth]);

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

  console.log('About to render IconCell JSX for icon:', icon.id);
  
  try {
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
  } catch (error) {
    console.error('Error in IconCell JSX return:', error);
    return <div>Error rendering icon: {icon.id}</div>;
  }
}

console.log('IconCell exported successfully');