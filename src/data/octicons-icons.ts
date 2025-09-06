import { IconItem } from '../types/icon';
import { iconMap } from '../../octicons icons';
import { preprocessIcons } from '../lib/icon-string-preprocessor';

// Octicons Icons - Complete collection from GitHub's design system
// All 661 professional icons imported and processed

// Helper function to convert camelCase to Title Case
function camelCaseToTitleCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .replace(/(\d+)$/, ' $1') // Handle size variants like 16, 24
    .trim();
}

// Helper function to categorize icons based on their names
function categorizeIcon(iconName: string): string {
  const name = iconName.toLowerCase();
  
  if (name.includes('home') || name.includes('arrow') || name.includes('chevron') || name.includes('nav') || name.includes('link') || name.includes('external') || name.includes('internal')) {
    return 'navigation';
  }
  if (name.includes('person') || name.includes('people') || name.includes('organization') || name.includes('team') || name.includes('account') || name.includes('user') || name.includes('avatar')) {
    return 'user';
  }
  if (name.includes('mail') || name.includes('comment') || name.includes('discussion') || name.includes('mention') || name.includes('bell') || name.includes('broadcast') || name.includes('megaphone')) {
    return 'communication';
  }
  if (name.includes('play') || name.includes('video') || name.includes('unmute') || name.includes('mute') || name.includes('image') || name.includes('file-media')) {
    return 'media';
  }
  if (name.includes('pencil') || name.includes('paintbrush') || name.includes('typography') || name.includes('italic') || name.includes('bold') || name.includes('strikethrough')) {
    return 'design';
  }
  if (name.includes('file') || name.includes('folder') || name.includes('repo') || name.includes('download') || name.includes('upload') || name.includes('archive') || name.includes('package')) {
    return 'files';
  }
  if (name.includes('credit') || name.includes('gift') || name.includes('sponsor') || name.includes('heart') || name.includes('diamond') || name.includes('north-star')) {
    return 'commerce';
  }
  if (name.includes('calendar') || name.includes('clock') || name.includes('history') || name.includes('hourglass') || name.includes('stopwatch')) {
    return 'time';
  }
  if (name.includes('lock') || name.includes('unlock') || name.includes('key') || name.includes('shield') || name.includes('verified') || name.includes('unverified') || name.includes('passkey')) {
    return 'security';
  }
  if (name.includes('cloud') || name.includes('server') || name.includes('database') || name.includes('globe') || name.includes('browser') || name.includes('device')) {
    return 'infrastructure';
  }
  if (name.includes('location') || name.includes('pin') || name.includes('milestone') || name.includes('globe') || name.includes('telescope')) {
    return 'location';
  }
  if (name.includes('ai') || name.includes('copilot') || name.includes('cpu') || name.includes('dependabot') || name.includes('workflow') || name.includes('automation')) {
    return 'ai-automation';
  }
  if (name.includes('accessibility') || name.includes('screen-reader') || name.includes('rel-file-path')) {
    return 'accessibility';
  }
  if (name.includes('code') || name.includes('terminal') || name.includes('command') || name.includes('git') || name.includes('branch') || name.includes('commit') || name.includes('pull') || name.includes('push') || name.includes('merge')) {
    return 'development';
  }
  if (name.includes('issue') || name.includes('pr') || name.includes('pull-request') || name.includes('project') || name.includes('milestone') || name.includes('discussion') || name.includes('wiki')) {
    return 'project-management';
  }
  if (name.includes('star') || name.includes('bookmark') || name.includes('pin') || name.includes('trophy') || name.includes('goal') || name.includes('rocket')) {
    return 'status';
  }
  if (name.includes('gear') || name.includes('tools') || name.includes('workflow') || name.includes('kebab') || name.includes('three-bars') || name.includes('list') || name.includes('filter')) {
    return 'system';
  }
  
  return 'general';
}

// Helper function to generate tags for an icon
function generateTags(iconName: string, category: string): string[] {
  const name = iconName.toLowerCase();
  const tags = [name, category];
  
  // Add size variant tags
  if (name.includes('16')) tags.push('small', '16px');
  if (name.includes('24')) tags.push('large', '24px');
  
  // Add semantic tags based on icon name
  const semanticMappings: Record<string, string[]> = {
    'home': ['house', 'main', 'start', 'dashboard'],
    'person': ['user', 'profile', 'account', 'individual'],
    'people': ['users', 'team', 'group', 'community'],
    'organization': ['org', 'company', 'business', 'enterprise'],
    'repo': ['repository', 'project', 'code', 'git'],
    'issue': ['bug', 'problem', 'ticket', 'task'],
    'pull-request': ['pr', 'merge', 'review', 'change'],
    'commit': ['save', 'record', 'snapshot', 'version'],
    'branch': ['fork', 'diverge', 'parallel', 'version'],
    'merge': ['combine', 'join', 'integrate', 'unite'],
    'star': ['favorite', 'bookmark', 'like', 'watch'],
    'heart': ['love', 'sponsor', 'support', 'like'],
    'eye': ['watch', 'view', 'see', 'observe'],
    'bell': ['notification', 'alert', 'ring', 'remind'],
    'gear': ['settings', 'config', 'preferences', 'options'],
    'search': ['find', 'look', 'magnify', 'discover'],
    'plus': ['add', 'create', 'new', 'insert'],
    'dash': ['minus', 'remove', 'subtract', 'delete'],
    'x': ['close', 'cancel', 'exit', 'dismiss'],
    'check': ['tick', 'confirm', 'approve', 'done'],
    'alert': ['warning', 'caution', 'important', 'notice'],
    'info': ['information', 'help', 'about', 'details'],
    'question': ['help', 'support', 'faq', 'unknown'],
    'shield': ['security', 'protect', 'safe', 'verified'],
    'lock': ['secure', 'private', 'protected', 'closed'],
    'unlock': ['open', 'public', 'accessible', 'free'],
    'key': ['access', 'password', 'auth', 'login'],
    'download': ['save', 'get', 'import', 'receive'],
    'upload': ['send', 'export', 'share', 'publish'],
    'link': ['url', 'connection', 'reference', 'hyperlink'],
    'mail': ['email', 'message', 'envelope', 'contact'],
    'comment': ['message', 'chat', 'discussion', 'feedback'],
    'mention': ['tag', 'reference', 'notify', 'at'],
    'calendar': ['date', 'schedule', 'event', 'time'],
    'clock': ['time', 'schedule', 'timer', 'duration'],
    'history': ['past', 'previous', 'log', 'timeline'],
    'milestone': ['goal', 'target', 'achievement', 'marker'],
    'project': ['plan', 'organize', 'manage', 'board'],
    'workflow': ['process', 'automation', 'pipeline', 'flow'],
    'copilot': ['ai', 'assistant', 'help', 'suggestion'],
    'dependabot': ['automation', 'updates', 'security', 'dependencies'],
    'code': ['programming', 'development', 'script', 'source'],
    'terminal': ['command', 'console', 'shell', 'cli'],
    'database': ['data', 'storage', 'table', 'records'],
    'server': ['hosting', 'cloud', 'infrastructure', 'backend'],
    'globe': ['world', 'internet', 'web', 'global'],
    'browser': ['web', 'internet', 'page', 'site'],
    'device': ['hardware', 'mobile', 'desktop', 'tablet'],
    'cpu': ['processor', 'computer', 'hardware', 'chip'],
    'cloud': ['online', 'remote', 'storage', 'sync'],
    'archive': ['backup', 'store', 'compress', 'save'],
    'package': ['bundle', 'library', 'module', 'dependency'],
    'rocket': ['deploy', 'launch', 'fast', 'performance'],
    'trophy': ['award', 'achievement', 'winner', 'success'],
    'goal': ['target', 'objective', 'aim', 'purpose'],
    'tools': ['utilities', 'instruments', 'equipment', 'settings'],
    'paintbrush': ['design', 'art', 'create', 'style'],
    'typography': ['text', 'font', 'type', 'writing'],
    'bold': ['strong', 'emphasis', 'weight', 'heavy'],
    'italic': ['slant', 'emphasis', 'style', 'oblique'],
    'strikethrough': ['cross-out', 'delete', 'cancel', 'remove']
  };
  
  // Find matching semantic tags
  Object.entries(semanticMappings).forEach(([key, values]) => {
    if (name.includes(key)) {
      tags.push(...values);
    }
  });
  
  return [...new Set(tags)]; // Remove duplicates
}

// REMOVED: ensureCurrentColor function to prevent double-processing
// Color normalization is now handled by optimizeSvg() in svg-build.ts

// Helper function to normalize icon names (remove size suffixes and clean up)
function normalizeIconName(iconName: string): string {
  return iconName
    .replace(/(\d+)$/, '') // Remove size suffixes like 16, 24
    .replace(/Fill$/, '') // Remove Fill suffix
    .replace(/Inset$/, '') // Remove Inset suffix
    .toLowerCase();
}

// Helper function to check if an icon should be excluded
function shouldExcludeIcon(iconName: string): boolean {
  const name = iconName.toLowerCase();
  
  // Exclude GitHub branding and size-specific duplicates
  const excludePatterns = [
    'github', 'copilot', 'dependabot', // GitHub branding
    'mark-github', // GitHub specific
    'inset', // Inset variants (prefer regular versions)
  ];
  
  // Exclude if matches any exclude pattern
  if (excludePatterns.some(pattern => name.includes(pattern))) {
    return true;
  }
  
  return false;
}

// Helper function to prefer specific size variants
function getPreferredIcon(icons: [string, string][]): [string, string] {
  // Prefer 16px versions for consistency, or the one without size suffix
  const size16 = icons.find(([name]) => name.includes('16'));
  const withoutSize = icons.find(([name]) => !/\d+$/.test(name));
  
  return size16 || withoutSize || icons[0];
}

// Process and deduplicate icons by normalized name
const processedIcons = new Map<string, { iconName: string; svg: string }>();

Object.entries(iconMap).forEach(([iconName, svg]) => {
  // Skip excluded icons
  if (shouldExcludeIcon(iconName)) {
    return;
  }
  
  const normalizedName = normalizeIconName(iconName);
  
  // If we already have this icon (by normalized name), prefer the better variant
  if (processedIcons.has(normalizedName)) {
    const existing = processedIcons.get(normalizedName)!;
    const currentEntry: [string, string] = [iconName, svg];
    const existingEntry: [string, string] = [existing.iconName, existing.svg];
    
    const preferred = getPreferredIcon([existingEntry, currentEntry]);
    if (preferred[0] === iconName) {
      // Current icon is preferred, update the entry
      processedIcons.set(normalizedName, { iconName, svg });
    }
    // If existing is preferred, skip processing current icon
    return;
  }
  
  // Store the raw data for this new normalized icon
  processedIcons.set(normalizedName, { iconName, svg });
});

// Convert processed icons to IconItem array
const octiconsIconsRaw: IconItem[] = Array.from(processedIcons.entries()).map(([normalizedName, { iconName, svg }]) => {
  const category = categorizeIcon(normalizedName);
  const tags = generateTags(normalizedName, category);
  const displayName = camelCaseToTitleCase(normalizedName);
  // REMOVED: ensureCurrentColor(svg) to prevent double-processing
  // Color normalization is now handled by optimizeSvg() in svg-build.ts

  return {
    id: `octicons-${normalizedName}`,
    name: displayName,
    svg: svg, // Use raw SVG, let svg-build.ts handle color normalization
    tags: tags,
    style: 'solid',
    category: category,
  };
});

// Cache for processed icons
let processedIconsCache: IconItem[] | null = null;

// Async function to get preprocessed icons
export async function getOcticonsIcons(): Promise<IconItem[]> {
  if (processedIconsCache) {
    return processedIconsCache;
  }
  
  try {
    processedIconsCache = await preprocessIcons(octiconsIconsRaw);
    return processedIconsCache;
  } catch (error) {
    console.warn('Failed to preprocess Octicons icons:', error);
    return octiconsIconsRaw; // Fallback to raw icons
  }
}

// Synchronous export for backward compatibility
export const octiconsIcons: IconItem[] = octiconsIconsRaw;