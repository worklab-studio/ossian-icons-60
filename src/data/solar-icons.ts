import { type IconItem } from "@/types/icon";
import { iconMap } from "../../solar";
import { sortIconsByStyleThenName } from '@/lib/icon-utils';

function formatIconName(key: string): string {
  // Remove svg prefix and convert to readable name
  let name = key.replace(/^svg(Bold|Outline)/, '');
  
  // Split camelCase and add spaces
  return name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function determineCategory(key: string): string {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes('arrow') || keyLower.includes('direction')) return 'navigation';
  if (keyLower.includes('weather') || keyLower.includes('sun') || keyLower.includes('cloud') || keyLower.includes('rain')) return 'weather';
  if (keyLower.includes('download') || keyLower.includes('upload') || keyLower.includes('share') || keyLower.includes('copy')) return 'actions';
  if (keyLower.includes('user') || keyLower.includes('people') || keyLower.includes('person') || keyLower.includes('profile')) return 'users';
  if (keyLower.includes('file') || keyLower.includes('folder') || keyLower.includes('document')) return 'files';
  if (keyLower.includes('message') || keyLower.includes('mail') || keyLower.includes('chat') || keyLower.includes('call')) return 'communication';
  if (keyLower.includes('play') || keyLower.includes('pause') || keyLower.includes('music') || keyLower.includes('video')) return 'media';
  if (keyLower.includes('settings') || keyLower.includes('tool') || keyLower.includes('gear') || keyLower.includes('config')) return 'system';
  if (keyLower.includes('calendar') || keyLower.includes('clock') || keyLower.includes('time') || keyLower.includes('date')) return 'time';
  if (keyLower.includes('map') || keyLower.includes('location') || keyLower.includes('place') || keyLower.includes('gps')) return 'location';
  if (keyLower.includes('shop') || keyLower.includes('cart') || keyLower.includes('money') || keyLower.includes('payment')) return 'commerce';
  if (keyLower.includes('home') || keyLower.includes('menu') || keyLower.includes('search') || keyLower.includes('filter')) return 'interface';
  
  return 'miscellaneous';
}

function determineStyle(key: string): string {
  if (key.startsWith('svgBold')) return 'bold';
  if (key.startsWith('svgOutline')) return 'outline';
  return 'solid';
}

function addCurrentColorToSvg(svgString: string): string {
  // Replace fill="black" with fill="currentColor" and stroke="black" with stroke="currentColor"
  return svgString
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(/stroke="black"/g, 'stroke="currentColor"')
    .replace(/fill="#000"/g, 'fill="currentColor"')
    .replace(/stroke="#000"/g, 'stroke="currentColor"');
}

function generateTags(key: string, name: string, category: string): string[] {
  const tags = [category];
  
  // Add style tag
  const style = determineStyle(key);
  tags.push(style);
  
  // Add name-based tags
  const nameParts = name.toLowerCase().split(' ');
  tags.push(...nameParts);
  
  // Add category-specific tags
  const keyLower = key.toLowerCase();
  if (keyLower.includes('arrow')) tags.push('arrow', 'direction');
  if (keyLower.includes('download')) tags.push('download', 'save');
  if (keyLower.includes('upload')) tags.push('upload', 'import');
  if (keyLower.includes('weather')) tags.push('weather', 'climate');
  if (keyLower.includes('cloud')) tags.push('cloud', 'storage');
  if (keyLower.includes('sun')) tags.push('sun', 'light', 'day');
  
  return [...new Set(tags)]; // Remove duplicates
}

const rawSolarIcons: IconItem[] = Object.entries(iconMap).map(([key, svgString]) => {
  const name = formatIconName(key);
  const category = determineCategory(key);
  const style = determineStyle(key);
  const tags = generateTags(key, name, category);
  const themedSvg = addCurrentColorToSvg(svgString);
  
  return {
    id: `solar-${key.toLowerCase()}`,
    name,
    svg: themedSvg,
    tags,
    style,
    category,
  };
});

export const solarIcons: IconItem[] = sortIconsByStyleThenName(rawSolarIcons);