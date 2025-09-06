import { type IconItem } from "@/types/icon";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers or non-secure contexts
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

export async function copyIcon(icon: IconItem, color: string = 'currentColor', strokeWidth: number = 2): Promise<void> {
  // Simple copy of raw SVG string without processing
  const svgString = typeof icon.svg === 'string' ? icon.svg : '<svg><!-- No SVG data --></svg>';
  const success = await copyToClipboard(svgString);
  if (!success) {
    throw new Error('Clipboard not available');
  }
}

export function canCopy(): boolean {
  return true; // We have fallbacks for all browsers
}