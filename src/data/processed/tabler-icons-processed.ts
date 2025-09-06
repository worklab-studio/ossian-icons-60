// Auto-generated pre-processed Tabler icons - RUNTIME PROCESSING FALLBACK
// This file uses runtime processing as fallback since we couldn't generate static data
// Generated on: ${new Date().toISOString()}

import { type IconItem } from '@/types/icon';

// Function to process all icons at runtime
export async function getProcessedTablerIcons(): Promise<IconItem[]> {
  // Dynamic import to avoid loading all icons upfront
  const { tablerIconMap } = await import('../../../TrablerStroke');
  
  // Helper functions for processing
  const parseIconMetadata = (svgString: string) => {
    const commentMatch = svgString.match(/<!--\s*(.*?)\s*-->/s);
    if (!commentMatch) return { category: undefined, tags: [] };

    const commentContent = commentMatch[1];
    const categoryMatch = commentContent.match(/category:\s*([^\n]+)/);
    const tagsMatch = commentContent.match(/tags:\s*\[(.*?)\]/);

    return {
      category: categoryMatch?.[1]?.trim(),
      tags: tagsMatch?.[1]?.split(',').map(tag => tag.trim().replace(/['"]/g, '')) || []
    };
  };

  const cleanSvgContent = (svgString: string) => {
    // Use a more precise regex that only matches complete comment blocks
    let cleaned = svgString.replace(/<!--[^>]*?-->/g, '');
    
    // Handle multi-line comments more carefully
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, (match) => {
      return match.includes('-->') ? '' : match;
    });
    
    // Validate and fix common SVG structure issues
    cleaned = validateAndFixSvg(cleaned);
    
    return cleaned.trim();
  };

  const validateAndFixSvg = (svgString: string) => {
    // Fix broken stroke-width attributes (common issue from comment removal)
    svgString = svgString.replace(/stroke-\s+stroke-/g, 'stroke-');
    
    // Ensure proper attribute formatting
    svgString = svgString.replace(/(\w+)="\s*(\w+)/g, '$1="$2');
    
    // Fix any orphaned attribute fragments
    svgString = svgString.replace(/\s+\w+\s*=\s*"?\s*$/gm, '');
    
    return svgString;
  };

  // Process all icons
  const processedIcons = Object.entries(tablerIconMap).map(([iconName, svgContent]: [string, string]) => {
    const metadata = parseIconMetadata(svgContent);
    const cleanSvg = cleanSvgContent(svgContent);

    return {
      id: `tabler-${iconName}`,
      name: iconName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      svg: cleanSvg,
      tags: metadata.tags || [],
      style: 'outline' as const,
      category: metadata.category || 'General'
    };
  });

  // Sort icons
  return processedIcons.sort((a: IconItem, b: IconItem) => {
    if (a.style !== b.style) {
      return a.style.localeCompare(b.style);
    }
    return a.name.localeCompare(b.name);
  });
}

// For backwards compatibility
export const processedTablerIcons = getProcessedTablerIcons();
export const hasProcessedIcons = false; // Set to false to trigger fallback in tabler-icons.ts