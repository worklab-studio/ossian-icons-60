import { IconItem } from '../types/icon';
import { iconMap } from '../../line icons';

const categorizeIcon = (key: string): string => {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('arrow') || lowerKey.includes('navigation') || lowerKey.includes('direction')) {
    return 'navigation';
  }
  if (lowerKey.includes('user') || lowerKey.includes('person') || lowerKey.includes('profile') || lowerKey.includes('account')) {
    return 'user';
  }
  if (lowerKey.includes('message') || lowerKey.includes('chat') || lowerKey.includes('mail') || lowerKey.includes('phone') || lowerKey.includes('communication')) {
    return 'communication';
  }
  if (lowerKey.includes('settings') || lowerKey.includes('config') || lowerKey.includes('gear') || lowerKey.includes('system')) {
    return 'system';
  }
  if (lowerKey.includes('file') || lowerKey.includes('folder') || lowerKey.includes('document') || lowerKey.includes('storage')) {
    return 'files';
  }
  if (lowerKey.includes('media') || lowerKey.includes('video') || lowerKey.includes('audio') || lowerKey.includes('image') || lowerKey.includes('camera')) {
    return 'media';
  }
  if (lowerKey.includes('shopping') || lowerKey.includes('cart') || lowerKey.includes('commerce') || lowerKey.includes('money') || lowerKey.includes('payment')) {
    return 'commerce';
  }
  if (lowerKey.includes('security') || lowerKey.includes('lock') || lowerKey.includes('shield') || lowerKey.includes('password')) {
    return 'security';
  }
  
  return 'general';
};

const generateTags = (key: string): string[] => {
  const tags = [key];
  const words = key.replace(/([A-Z])/g, ' $1').toLowerCase().split(/[\s\-_]+/).filter(Boolean);
  tags.push(...words);
  return [...new Set(tags)];
};

const processIconSvg = (svg: string): string => {
  return svg
    // Convert all 6-digit hex colors to currentColor
    .replace(/#[0-9A-Fa-f]{6}/g, 'currentColor')
    // Convert all 3-digit hex colors to currentColor  
    .replace(/#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, 'currentColor')
    // Convert CSS style attributes with colors
    .replace(/style="[^"]*fill:\s*#[0-9A-Fa-f]{3,6}[^"]*"/g, (match) => 
      match.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor'))
    // Convert SVG class-based styling
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, (match) =>
      match.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor'))
    // Convert gradient stop-color attributes
    .replace(/stop-color="[^"]*#[0-9A-Fa-f]{3,6}[^"]*"/g, (match) =>
      match.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor'))
    // Preserve fill="none" and stroke="none"
    .replace(/currentColor/g, (match, offset, string) => {
      const before = string.substring(Math.max(0, offset - 20), offset);
      if (before.includes('fill="none"') || before.includes('stroke="none"')) {
        return 'none';
      }
      return match;
    });
};

export const lineIcons: IconItem[] = Object.entries(iconMap)
  .filter(([_, svg]) => typeof svg === 'string' && svg.includes('<svg'))
  .map(([key, svg]) => ({
    id: `line-${key}`,
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    svg: processIconSvg(svg as string),
    tags: generateTags(key),
    style: 'outline',
    category: categorizeIcon(key),
  }));