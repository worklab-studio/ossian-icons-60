import { type IconItem } from '@/types/icon';

// Import the async function from processed file
import { getProcessedTablerIcons, hasProcessedIcons } from './processed/tabler-icons-processed';

// Fallback runtime processing - same logic but different entry point
let fallbackIcons: IconItem[] | null = null;

async function getRuntimeProcessedIcons(): Promise<IconItem[]> {
  if (fallbackIcons) return fallbackIcons;

  const { tablerIconMap } = await import('../../TrablerStroke');
  const { sortIconsByStyleThenName } = await import('@/lib/icon-utils');

  // Helper function to parse metadata from HTML comments
  function parseIconMetadata(svgString: string): { category?: string; tags?: string[] } {
    const commentMatch = svgString.match(/<!--\s*(.*?)\s*-->/s);
    if (!commentMatch) return {};

    const commentContent = commentMatch[1];
    const categoryMatch = commentContent.match(/category:\s*([^\n]+)/);
    const tagsMatch = commentContent.match(/tags:\s*\[(.*?)\]/);

    return {
      category: categoryMatch?.[1]?.trim(),
      tags: tagsMatch?.[1]?.split(',').map(tag => tag.trim().replace(/['"]/g, '')) || []
    };
  }

  // Helper function to clean SVG content (remove HTML comments)
  function cleanSvgContent(svgString: string): string {
    // Use a more precise regex that only matches complete comment blocks
    // This prevents accidentally removing parts of SVG attributes
    let cleaned = svgString.replace(/<!--[^>]*?-->/g, '');
    
    // Handle multi-line comments more carefully
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, (match) => {
      // Only remove if it's a complete comment block
      return match.includes('-->') ? '' : match;
    });
    
    // Validate and fix common SVG structure issues
    cleaned = validateAndFixSvg(cleaned);
    
    return cleaned.trim();
  }

  // Helper function to validate and fix SVG structure
  function validateAndFixSvg(svgString: string): string {
    // Fix broken stroke-width attributes (common issue from comment removal)
    svgString = svgString.replace(/stroke-\s+stroke-/g, 'stroke-');
    
    // Ensure proper attribute formatting
    svgString = svgString.replace(/(\w+)="\s*(\w+)/g, '$1="$2');
    
    // Fix any orphaned attribute fragments
    svgString = svgString.replace(/\s+\w+\s*=\s*"?\s*$/gm, '');
    
    return svgString;
  }

  // Process icons at runtime (fallback)
  const rawTablerIcons: IconItem[] = Object.entries(tablerIconMap).map(([iconName, svgContent]: [string, string]) => {
    const metadata = parseIconMetadata(svgContent);
    const cleanSvg = cleanSvgContent(svgContent);

    return {
      id: `tabler-${iconName}`,
      name: iconName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      svg: cleanSvg,
      tags: metadata.tags || [],
      style: 'outline',
      category: metadata.category || 'General'
    };
  });

  fallbackIcons = sortIconsByStyleThenName(rawTablerIcons);
  return fallbackIcons;
}

// Export promise for async processing (works for both static and runtime processing)
export const tablerIcons: Promise<IconItem[]> = hasProcessedIcons 
  ? getProcessedTablerIcons()
  : getRuntimeProcessedIcons();