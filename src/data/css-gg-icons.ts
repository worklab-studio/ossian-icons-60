import { IconItem } from '@/types/icon';
import * as CgIcons from 'react-icons/cg';

// Get all CSS.GG icons dynamically
const allCgIcons = Object.entries(CgIcons).filter(([name]) => name.startsWith('Cg'));

// Category mapping for CSS.GG icons
const categoryMap: Record<string, string> = {
  // Navigation
  'CgArrowUp': 'navigation',
  'CgArrowDown': 'navigation',
  'CgArrowLeft': 'navigation',
  'CgArrowRight': 'navigation',
  'CgArrowTopLeft': 'navigation',
  'CgArrowTopRight': 'navigation',
  'CgArrowBottomLeft': 'navigation',
  'CgArrowBottomRight': 'navigation',
  'CgChevronUp': 'navigation',
  'CgChevronDown': 'navigation',
  'CgChevronLeft': 'navigation',
  'CgChevronRight': 'navigation',
  'CgMenu': 'navigation',
  'CgMenuLeft': 'navigation',
  'CgMenuRight': 'navigation',
  'CgClose': 'navigation',
  'CgMoreVertical': 'navigation',
  'CgMoreHorizontal': 'navigation',

  // Actions
  'CgAdd': 'actions',
  'CgRemove': 'actions',
  'CgEdit': 'actions',
  'CgTrash': 'actions',
  'CgSave': 'actions',
  'CgCopy': 'actions',
  'CgCut': 'actions',
  'CgPaste': 'actions',
  'CgSearch': 'actions',
  'CgRefresh': 'actions',
  'CgUndo': 'actions',
  'CgRedo': 'actions',
  'CgDuplicate': 'actions',
  'CgImport': 'actions',
  'CgExport': 'actions',

  // Interface
  'CgHome': 'interface',
  'CgProfile': 'interface',
  'CgUser': 'interface',
  'CgUserAdd': 'interface',
  'CgUserRemove': 'interface',
  'CgSettings': 'interface',
  'CgOptions': 'interface',
  'CgInfo': 'interface',
  'CgQuestion': 'interface',
  'CgWarning': 'interface',
  'CgDanger': 'interface',
  'CgCheck': 'interface',
  'CgCheckO': 'interface',
  'CgRadioCheck': 'interface',
  'CgRadioChecked': 'interface',

  // Media
  'CgPlay': 'media',
  'CgPause': 'media',
  'CgStop': 'media',
  'CgPlayForward': 'media',
  'CgPlayBackward': 'media',
  'CgPlayNext': 'media',
  'CgPlayPrev': 'media',
  'CgVolume': 'media',
  'CgVolumeX': 'media',
  'CgImage': 'media',
  'CgVideo': 'media',
  'CgCamera': 'media',
  'CgMicrophone': 'media',

  // Communication
  'CgMail': 'communication',
  'CgMailOpen': 'communication',
  'CgMessage': 'communication',
  'CgChat': 'communication',
  'CgPhone': 'communication',
  'CgBell': 'communication',
  'CgNotification': 'communication',

  // Files
  'CgFolder': 'files',
  'CgFolderAdd': 'files',
  'CgFolderRemove': 'files',
  'CgFile': 'files',
  'CgFileAdd': 'files',
  'CgFileRemove': 'files',
  'CgFileDocument': 'files',
  'CgFilePdf': 'files',

  // System
  'CgTools': 'system',
  'CgGear': 'system',
  'CgCog': 'system',
  'CgShield': 'system',
  'CgLock': 'system',
  'CgUnlock': 'system',
  'CgKey': 'system',
  'CgDatabase': 'system',
  'CgServer': 'system',

  // Social
  'CgShare': 'social',
  'CgLink': 'social',
  'CgUnlink': 'social',
  'CgHeart': 'social',
  'CgHeartEmpty': 'social',
  'CgStar': 'social',
  'CgStarEmpty': 'social',
  'CgThumbUp': 'social',
  'CgThumbDown': 'social',

  // Design
  'CgColorPicker': 'design',
  'CgDropInvert': 'design',
  'CgEyedropper': 'design',
  'CgPaintBucket': 'design',
  'CgShapes': 'design',
  'CgPen': 'design',
  'CgBrush': 'design',

  // General
  'CgTime': 'general',
  'CgClock': 'general',
  'CgCalendar': 'general',
  'CgMath': 'general',
  'CgCalculator': 'general',
  'CgTag': 'general',
  'CgPin': 'general',
  'CgFlag': 'general',
  'CgLocation': 'general',
  'CgMap': 'general',
};

// Generate tags for better search
const generateTags = (iconName: string): string[] => {
  const name = iconName.replace('Cg', '').toLowerCase();
  const tags = [name];
  
  // Add category as tag
  const category = categoryMap[iconName];
  if (category) {
    tags.push(category);
  }

  // Add specific tags based on icon name
  if (name.includes('arrow')) tags.push('direction', 'navigation');
  if (name.includes('chevron')) tags.push('direction', 'navigation');
  if (name.includes('menu')) tags.push('hamburger', 'navigation');
  if (name.includes('user') || name.includes('profile')) tags.push('person', 'account');
  if (name.includes('mail') || name.includes('message')) tags.push('email', 'communication');
  if (name.includes('file') || name.includes('folder')) tags.push('document', 'storage');
  if (name.includes('play') || name.includes('pause')) tags.push('control', 'media');
  if (name.includes('volume')) tags.push('sound', 'audio');
  if (name.includes('heart') || name.includes('star')) tags.push('favorite', 'rating');
  if (name.includes('add') || name.includes('plus')) tags.push('create', 'new');
  if (name.includes('remove') || name.includes('trash')) tags.push('delete', 'remove');
  if (name.includes('edit')) tags.push('modify', 'change');
  if (name.includes('search')) tags.push('find', 'lookup');
  if (name.includes('settings') || name.includes('gear') || name.includes('cog')) tags.push('configuration', 'options');

  return [...new Set(tags)]; // Remove duplicates
};

export const cssGgIcons: IconItem[] = allCgIcons.map(([name, IconComponent]) => ({
  id: `css-gg-${name.toLowerCase()}`,
  name: name.replace('Cg', ''),
  svg: IconComponent,
  tags: generateTags(name),
  category: categoryMap[name] || 'general',
  style: 'outline'
}));

export default cssGgIcons;