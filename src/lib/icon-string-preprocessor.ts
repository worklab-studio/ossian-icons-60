import React from 'react';
import { createRoot } from 'react-dom/client';
import { type IconItem } from '@/types/icon';

// Safe SVG fallback for failed conversions
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
  <circle cx="9" cy="9" r="2"/>
  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
</svg>`;

/**
 * Converts a React component to SVG string
 */
function renderComponentToSvg(Component: React.ComponentType<any>, props: any): Promise<string> {
  return new Promise((resolve) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    try {
      const root = createRoot(container);
      
      // Render the component
      root.render(React.createElement(Component, props));
      
      // Wait for next tick to ensure rendering is complete
      setTimeout(() => {
        try {
          const svgElement = container.querySelector('svg');
          if (svgElement) {
            // Clean up attributes and ensure proper structure
            svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svgElement.removeAttribute('class');
            svgElement.removeAttribute('className');
            
            const svgString = svgElement.outerHTML;
            resolve(svgString);
          } else {
            resolve(FALLBACK_SVG);
          }
        } catch (error) {
          console.warn('Error extracting SVG:', error);
          resolve(FALLBACK_SVG);
        } finally {
          // Clean up
          root.unmount();
          document.body.removeChild(container);
        }
      }, 10);
    } catch (error) {
      console.warn('Error rendering component:', error);
      document.body.removeChild(container);
      resolve(FALLBACK_SVG);
    }
  });
}

/**
 * Get library-specific props for rendering
 */
function getLibraryProps(iconId: string): any {
  const baseProps = {
    size: 24,
    width: 24,
    height: 24,
  };

  if (iconId.startsWith('lucide-')) {
    return { ...baseProps, strokeWidth: 2 };
  }
  
  if (iconId.startsWith('phosphor-') || iconId.startsWith('feather-') || iconId.startsWith('boxicons-')) {
    return { ...baseProps, color: 'currentColor' };
  }
  
  if (iconId.startsWith('bootstrap-')) {
    return { ...baseProps, fill: 'currentColor' };
  }
  
  return baseProps;
}

/**
 * Preprocess a single icon to convert React component to SVG string
 */
export async function preprocessIcon(icon: IconItem): Promise<IconItem> {
  // If it's already a string, validate and normalize it
  if (typeof icon.svg === 'string') {
    try {
      // Validate that it's a proper SVG
      if (icon.svg.trim().startsWith('<svg') && icon.svg.trim().endsWith('</svg>')) {
        return {
          ...icon,
          svg: icon.svg // Keep the original string SVG
        };
      } else {
        console.warn(`Invalid SVG string for icon ${icon.id}`);
        return {
          ...icon,
          svg: FALLBACK_SVG
        };
      }
    } catch (error) {
      console.warn(`Error validating SVG string for icon ${icon.id}:`, error);
      return {
        ...icon,
        svg: FALLBACK_SVG
      };
    }
  }

  try {
    const props = getLibraryProps(icon.id);
    const svgString = await renderComponentToSvg(icon.svg as React.ComponentType<any>, props);
    
    return {
      ...icon,
      svg: svgString
    };
  } catch (error) {
    console.warn(`Failed to preprocess icon ${icon.id}:`, error);
    return {
      ...icon,
      svg: FALLBACK_SVG
    };
  }
}

/**
 * Preprocess an array of icons, converting React components to SVG strings
 */
export async function preprocessIcons(icons: IconItem[]): Promise<IconItem[]> {
  const batchSize = 50; // Process in batches to avoid overwhelming the browser
  const results: IconItem[] = [];
  
  for (let i = 0; i < icons.length; i += batchSize) {
    const batch = icons.slice(i, i + batchSize);
    const processedBatch = await Promise.all(
      batch.map(icon => preprocessIcon(icon))
    );
    results.push(...processedBatch);
    
    // Small delay between batches to keep UI responsive
    if (i + batchSize < icons.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return results;
}

/**
 * Check if preprocessing is needed for an icon library
 */
export function needsPreprocessing(icons: IconItem[]): boolean {
  return icons.some(icon => typeof icon.svg !== 'string');
}
