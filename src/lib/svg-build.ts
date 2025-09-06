import React from "react";
import { createRoot } from "react-dom/client";
import { type IconItem } from "@/types/icon";
import { optimizeSvg } from "./svg-optimize";
import { detectLibraryFromIconId, applyStrokeConfiguration } from "@/Data/stroke-config";

/**
 * @deprecated Use detectLibraryFromIconId from stroke-config instead
 * Detect icon library from icon ID for library-specific handling
 */
function detectIconLibrary(iconId: string): string {
  return detectLibraryFromIconId(iconId);
}

/**
 * Get library-specific props for React component rendering
 */
function getLibrarySpecificProps(library: string, color: string, strokeWidth: number) {
  const baseProps = {
    'aria-hidden': true
    // Removed color: 'currentColor' to prevent conflicts
  };

  switch (library) {
    case 'lucide':
      return {
        size: 24,
        color: color,
        strokeWidth: strokeWidth
      };
    
    case 'phosphor':
      // Phosphor from react-icons uses color prop directly
      return {
        size: 24,
        color: color, // Pass actual color, not currentColor
        weight: 'regular' // Phosphor-specific weight prop
      };
    
    case 'boxicons':
      // Boxicons from react-icons uses color prop directly
      return {
        size: 24,
        color: color // Pass actual color, not currentColor
      };
    
    case 'bootstrap':
      return {
        ...baseProps,
        size: 24,
        width: 24,
        height: 24,
        fill: 'currentColor'
      };
    
    case 'remix':
      return {
        ...baseProps,
        size: 24,
        width: 24,
        height: 24
      };
    
    case 'material':
    case 'heroicons':
      return {
        ...baseProps,
        width: 24,
        height: 24
      };
    
    case 'feather':
      return {
        ...baseProps,
        size: 24,
        strokeWidth: strokeWidth
      };
    
    case 'radix':
      return {
        ...baseProps,
        width: 24,
        height: 24
      };
    
    default:
      // Generic fallback props
      return {
        ...baseProps,
        size: 24,
        width: 24,
        height: 24,
        strokeWidth: strokeWidth
      };
  }
}

/**
 * Enhanced component rendering with off-DOM rendering for better client-side reliability
 */
function renderReactComponent(IconComponent: React.ComponentType<any>, library: string, color: string, strokeWidth: number): string {
  // Try specific props first based on library
  const primaryProps = getLibrarySpecificProps(library, color, strokeWidth);
  
  try {
    const result = renderComponentToSvg(IconComponent, primaryProps);
    if (result && result.includes('<svg')) {
      return result;
    }
  } catch (error) {
    console.debug(`Primary props failed for ${library}:`, error);
  }
  
  // Enhanced fallback prop sets with library-specific options
  const fallbackPropSets = [
    // Standard size + color combinations
    { size: 24, color: color, strokeWidth: strokeWidth },
    { width: 24, height: 24, fill: color, stroke: color },
    { size: 24, color: color },
    { width: 24, height: 24, color: color },
    
    // react-icons specific props (Phosphor, Boxicons)
    { size: 24, weight: 'regular' }, // Phosphor specific
    { size: 24, type: 'regular' }, // Boxicons variants
    { size: 24, variant: 'outline' }, // Generic variant prop
    
    // Library-specific known working combinations
    { size: 24, fill: 'currentColor' }, // Bootstrap, Remix
    { width: 24, height: 24, fill: 'currentColor' }, // Material, Heroicons
    { size: 24 }, // Phosphor, Boxicons minimal
    { width: 24, height: 24 }, // Generic minimal
    
    // Last resort minimal props
    {},
  ];

  for (const props of fallbackPropSets) {
    try {
      const result = renderComponentToSvg(IconComponent, props);
      if (result && result.includes('<svg')) {
        console.debug(`Fallback succeeded for ${library} with:`, props);
        return result;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`Failed to render ${library} component with all prop combinations`);
}

/**
 * Off-DOM rendering for React components - more reliable than renderToStaticMarkup on client
 */
function renderComponentToSvg(IconComponent: React.ComponentType<any>, props: any): string {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.visibility = 'hidden';
  document.body.appendChild(container);
  
  try {
    const root = createRoot(container);
    root.render(React.createElement(IconComponent, props));
    
    // Wait for render to complete
    const svg = container.querySelector('svg');
    const result = svg ? svg.outerHTML : null;
    
    root.unmount();
    return result || '';
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Canonical SVG builder using the normalize-then-colorize approach
 * This creates consistent exports across all icon libraries
 */
export function buildCustomizedSvg(
  icon: IconItem,
  color: string = 'currentColor',
  strokeWidth: number = 2
): string {
  try {
    let svgContent = '';
    const library = detectIconLibrary(icon.id);
    
    // Step 1: Get SVG content from icon (string or React component)
    if (typeof icon.svg === 'string') {
      // Handle string SVGs with enhanced validation and processing
      svgContent = validateSvgStructure(icon.svg);
      
      // Special processing for Atlas icons (complex CSS classes)
      if (library === 'atlas') {
        svgContent = processAtlasIconSvg(svgContent);
      }
      
      // Special processing for Octicons (prevent double-processing)
      if (library === 'octicons') {
        svgContent = processOcticonsIconSvg(svgContent);
      }
      
      // Validate string SVG has basic structure
      if (!svgContent.includes('<svg')) {
        throw new Error('Invalid string SVG - missing <svg> tag');
      }
    } else {
      // Fallback for any remaining React components (shouldn't happen with preprocessing)
      console.warn(`Icon ${icon.id} still has React component, preprocessing may have failed`);
      const IconComponent = icon.svg as React.ComponentType<any>;
      try {
        svgContent = renderReactComponent(IconComponent, library, color, strokeWidth);
      } catch (componentError) {
        console.error(`Component rendering failed for ${icon.id} (${library}):`, componentError);
        throw new Error(`Failed to render React component: ${componentError.message}`);
      }
    }
    
    // Step 2: Validate SVG content
    if (!svgContent || !svgContent.includes('<svg')) {
      throw new Error('Empty or invalid SVG content generated');
    }
    
    // Step 3: Normalize to currentColor baseline (handles all color normalization)
    let normalizedSvg = optimizeSvg(svgContent, library);
    
    // Step 4: Apply chosen color (if not currentColor)
    if (color !== 'currentColor') {
      normalizedSvg = normalizedSvg
        .replace(/currentColor/g, color)
        // Preserve critical values that should remain unchanged
        .replace(new RegExp(`fill="${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), (match, offset, string) => {
          // Check if this fill should be "none" by looking at nearby attributes
          const surroundingContext = string.slice(Math.max(0, offset - 50), offset + match.length + 50);
          if (surroundingContext.includes('fill="none"') || surroundingContext.includes("fill='none'")) {
            return 'fill="none"';
          }
          return match;
        })
        .replace(new RegExp(`stroke="${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), (match, offset, string) => {
          // Check if this stroke should be "none"
          const surroundingContext = string.slice(Math.max(0, offset - 50), offset + match.length + 50);
          if (surroundingContext.includes('stroke="none"') || surroundingContext.includes("stroke='none'")) {
            return 'stroke="none"';
          }
          return match;
        });
    }
    
    // Step 5: Apply stroke-width using configuration system
    normalizedSvg = applyStrokeConfiguration(normalizedSvg, library, strokeWidth);
    
    // Step 6: Ensure proper SVG structure for export compatibility
    if (!normalizedSvg.includes('xmlns=')) {
      normalizedSvg = normalizedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Step 7: Final validation
    if (!isValidSvg(normalizedSvg)) {
      throw new Error(`Generated SVG is invalid for icon ${icon.id}`);
    }
    
    console.log(`Successfully built customized SVG for ${icon.id}`);
    return normalizedSvg;
    
  } catch (error) {
    console.error(`Error building customized SVG for ${icon.id}:`, error);
    
    // Return a working fallback SVG with proper structure
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`;
  }
}

/**
 * Validate and fix SVG structure, especially for Tabler icons
 * that may have been damaged during comment removal
 */
function validateSvgStructure(svgString: string): string {
  // Fix broken stroke-width attributes (common in Tabler icons after comment removal)
  let fixed = svgString.replace(/stroke-\s+stroke-/g, 'stroke-');
  
  // Fix broken attributes that span lines
  fixed = fixed.replace(/(\w+)="\s*(\w+)/g, '$1="$2');
  
  // Remove orphaned attribute fragments
  fixed = fixed.replace(/\s+\w+\s*=\s*"?\s*$/gm, '');
  
  // Ensure proper SVG tag closure
  if (fixed.includes('<svg') && !fixed.includes('</svg>')) {
    fixed = fixed.replace(/<svg([^>]*)>/, '<svg$1>') + '</svg>';
  }
  
  return fixed;
}

/**
 * Enhanced SVG validation to catch malformed exports
 */
function isValidSvg(svgString: string): boolean {
  try {
    // Check for basic SVG structure
    if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
      return false;
    }
    
    // Check for malformed attributes (common in processed icons)
    if (svgString.includes('stroke-\n') || svgString.includes('stroke-  ') || svgString.includes('fill-\n')) {
      return false;
    }
    
    // Check for orphaned quotes
    const quoteCount = (svgString.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      return false;
    }
    
    // Check for broken CSS (Atlas icons)
    if (svgString.includes('<style>') && !svgString.includes('</style>')) {
      return false;
    }
    
    // Check for unclosed tags
    const openTags = (svgString.match(/<[^\/][^>]*>/g) || []).length;
    const closeTags = (svgString.match(/<\/[^>]*>/g) || []).length;
    const selfCloseTags = (svgString.match(/<[^>]*\/>/g) || []).length;
    
    // Basic tag balance check
    if (openTags - selfCloseTags !== closeTags) {
      console.warn('Potential tag imbalance detected');
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Process Atlas icons with complex CSS styling
 */
function processAtlasIconSvg(svgContent: string): string {
  // Atlas icons often have complex CSS classes that need color replacement
  let processed = svgContent;
  
  // Handle CSS styles within <style> tags
  processed = processed.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
    // Replace specific color values in CSS with currentColor
    const updatedCss = cssContent
      .replace(/fill:\s*#[a-fA-F0-9]{3,6}/g, 'fill: currentColor')
      .replace(/stroke:\s*#[a-fA-F0-9]{3,6}/g, 'stroke: currentColor')
      .replace(/color:\s*#[a-fA-F0-9]{3,6}/g, 'color: currentColor');
    
    return `<style>${updatedCss}</style>`;
  });
  
  // Handle direct CSS properties in elements
  processed = processed.replace(/style="([^"]*)"/gi, (match, styleContent) => {
    const updatedStyle = styleContent
      .replace(/fill:\s*#[a-fA-F0-9]{3,6}/g, 'fill: currentColor')
      .replace(/stroke:\s*#[a-fA-F0-9]{3,6}/g, 'stroke: currentColor')
      .replace(/color:\s*#[a-fA-F0-9]{3,6}/g, 'color: currentColor');
    
    return `style="${updatedStyle}"`;
  });
  
  return processed;
}

/**
 * Process Octicons to prevent double-processing conflicts
 */
function processOcticonsIconSvg(svgContent: string): string {
  // Octicons need proper color normalization since they come as raw SVG strings
  // Replace hardcoded colors with currentColor for theming
  let processed = svgContent
    .replace(/fill="(?!none|transparent|inherit|currentColor)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none|transparent|inherit|currentColor)[^"]*"/g, 'stroke="currentColor"');
    
  // For SVGs without explicit fill/stroke attributes, add fill="currentColor" to path elements
  if (!processed.includes('stroke=') && !processed.includes('fill=')) {
    processed = processed.replace(/<path(?![^>]*fill=)([^>]*)>/g, '<path$1 fill="currentColor">');
    processed = processed.replace(/<(circle|ellipse|rect|polygon|polyline)(?![^>]*fill=)(?![^>]*stroke=)([^>]*)>/g, '<$1$2 fill="currentColor">');
  }
  
  return processed;
}

/**
 * Robust clipboard copy with iOS fallback
 * Returns boolean success indicator instead of throwing
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for iOS and older browsers using execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.warn('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Detect iOS devices for download fallback
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Handle file downloads with iOS support
 */
export function downloadFile(blob: Blob, filename: string): void {
  if (isIOS()) {
    // iOS fallback - open in new tab for manual save
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // If popup blocked, use data URL
      const reader = new FileReader();
      reader.onload = () => {
        window.open(reader.result as string, '_blank');
      };
      reader.readAsDataURL(blob);
    }
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    // Standard download for other browsers
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}