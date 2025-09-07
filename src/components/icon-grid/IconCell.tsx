import React, { useState, useCallback, useRef, useMemo, memo } from "react";
import { Copy, Download, Check } from "lucide-react";
import { type IconItem } from "@/types/icon";
import { copyIcon } from "@/lib/copy";
import { getSimpleSvg, copyToClipboard } from "@/lib/simple-helpers";
import { getIconAriaLabel } from "@/lib/a11y";
import { CopyTooltip } from "@/components/ui/copy-tooltip";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { useTheme } from "next-themes";
import { supportsStrokeWidth } from "@/lib/icon-utils";
import { HapticsManager } from "@/lib/haptics";
import { useIsMobile } from "@/hooks/use-mobile";
import { exportIconAsPng, exportIconAsSvg } from "@/lib/icon-export";
import { toast } from "sonner";

interface IconCellProps {
  icon: IconItem;
  isSelected?: boolean;
  color?: string;
  strokeWidth?: number;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
}

export function IconCell({ 
  icon, 
  isSelected = false, 
  color = "#666", 
  strokeWidth = 1.5,
  onCopy,
  onIconClick
}: IconCellProps) {
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

  // Use centralized SVG processing for consistent display and export
  const renderedIcon = useMemo(() => {
    const iconColor = customization.color;
    
    if (!icon.svg) {
      return '<div class="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>';
    }
    
    try {
      const processedSvg = getSimpleSvg(icon);
      let finalSvg = processedSvg;

      // Apply stroke-width customization for supported icons
      if (supportsStrokeWidth(icon) && customization.strokeWidth !== 2) {
        finalSvg = processedSvg.replace(
          /stroke-width="[\d.]+"/g, 
          `stroke-width="${customization.strokeWidth}"`
        );
      }

      // Apply color
      finalSvg = finalSvg.replace(/stroke="currentColor"/g, `stroke="${iconColor}"`);
      finalSvg = finalSvg.replace(/fill="currentColor"/g, `fill="${iconColor}"`);
      
      return finalSvg;
    } catch (error) {
      console.error('Error processing icon:', icon.id, error);
      return '<span>⚠</span>';
    }
  }, [icon, customization.color, customization.strokeWidth]);

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
      const svgString = getSimpleSvg(icon);
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

  const handleExportPng = async (size: number = 512) => {
    try {
      await exportIconAsPng(renderedIcon, icon.name, { size });
      toast.success(`${icon.name} exported as PNG (${size}px)`);
    } catch (error) {
      toast.error('Failed to export PNG');
    }
  };

  const handleExportSvg = () => {
    try {
      exportIconAsSvg(renderedIcon, icon.name);
      toast.success(`${icon.name} exported as SVG`);
    } catch (error) {
      toast.error('Failed to export SVG');
    }
  };

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
      <div className="group relative">
        <button
          ref={buttonRef}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "border border-border hover:border-border/80 hover:bg-accent/50",
            "sm:h-20 sm:w-20",
            isSelected && "ring-2 ring-primary",
            !isHovered && "hover:shadow-md"
          )}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
          aria-label={getIconAriaLabel(icon.name, isSelected)}
          style={colorStyles}
        >
          {/* Icon */}
          <div 
            className="h-6 w-6 sm:h-8 sm:w-8 transition-all duration-200"
            dangerouslySetInnerHTML={{ __html: renderedIcon }}
          />
          
          {/* Copy indicator */}
          {showCopied && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}
          
          {/* Hover overlay with actions */}
          {isHovered && (
            <div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(e);
                }}
                className="h-7 w-7 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => handleExportPng(256)}>
                    Download PNG (256px)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPng(512)}>
                    Download PNG (512px)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPng(1024)}>
                    Download PNG (1024px)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportSvg}>
                    Download SVG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </button>
        
        {!isMobile && showTooltip && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
            Double click to copy icon
          </div>
        )}
      </div>
    </CopyTooltip>
  );
}