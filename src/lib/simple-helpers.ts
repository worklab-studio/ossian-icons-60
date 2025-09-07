// Simple helper functions to replace complex SVG processing
import { type IconItem } from "@/types/icon";

export function preprocessCarbonSvg(svgString: string): string {
  return svgString
    // Remove transparent background rectangles that cause deformation
    .replace(/<rect\s+width="32"\s+height="32"\s*\/>/g, '')
    .replace(/<rect\s+height="32"\s+width="32"\s*\/>/g, '')
    // Remove transparent rectangle elements with IDs
    .replace(/<rect\s+id="_Tansparent_Rectangle_"[^>]*\/>/g, '')
    .replace(/<rect\s+id="_x3C_Tranparent_Rectangle_x3E_"[^>]*\/>/g, '')
    // Clean up any remaining transparent rectangles
    .replace(/<rect\s+[^>]*fill="none"[^>]*width="32"[^>]*height="32"[^>]*\/>/g, '')
    .replace(/<rect\s+[^>]*width="32"[^>]*height="32"[^>]*fill="none"[^>]*\/>/g, '');
}

export function getSimpleSvg(icon: IconItem): string {
  if (typeof icon.svg === 'string') {
    // Apply Carbon-specific preprocessing to fix deformed icons
    if (icon.id.startsWith('carbon-')) {
      return preprocessCarbonSvg(icon.svg);
    }
    return icon.svg;
  }
  return '<svg><!-- No SVG data --></svg>';
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}