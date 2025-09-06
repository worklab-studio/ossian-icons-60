import { type IconItem } from "@/types/icon";
import { buildCustomizedSvg, copyToClipboard } from "./svg-build";

export async function copyIcon(icon: IconItem, color: string = 'currentColor', strokeWidth: number = 2): Promise<void> {
  const svgString = buildCustomizedSvg(icon, color, strokeWidth);
  const success = await copyToClipboard(svgString);
  if (!success) {
    throw new Error('Clipboard not available');
  }
}

export function canCopy(): boolean {
  return true; // We have fallbacks for all browsers
}