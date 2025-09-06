import { type IconItem } from "@/types/icon";
import * as BiIcons from "react-icons/bi";
import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { preprocessIcons } from '@/lib/icon-string-preprocessor';

// Get all Boxicons dynamically
const boxiconsEntries = Object.entries(BiIcons).filter(([name]) => 
  name.startsWith('Bi') && name !== 'BiIconsProps'
);

const rawBoxicons: IconItem[] = boxiconsEntries.map(([name, Component]) => {
  // Convert PascalCase to kebab-case for search tags
  const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(3); // Remove 'bi-' prefix
  
  // Categorize icons based on common patterns
  let category = "general";
  
  if (/arrow|chevron|caret|direction|navigate|point|angle/.test(name.toLowerCase())) {
    category = "arrows";
  } else if (/add|plus|create|new|edit|delete|remove|save|copy|cut|paste|undo|redo/.test(name.toLowerCase())) {
    category = "actions";
  } else if (/mail|message|chat|phone|communication|envelope|send/.test(name.toLowerCase())) {
    category = "communication";
  } else if (/play|pause|stop|music|video|sound|volume|media|record/.test(name.toLowerCase())) {
    category = "media";
  } else if (/file|folder|document|paper|page|download|upload|save/.test(name.toLowerCase())) {
    category = "files";
  } else if (/user|person|profile|account|people|group|team/.test(name.toLowerCase())) {
    category = "users";
  } else if (/setting|config|gear|tool|wrench|adjust|option/.test(name.toLowerCase())) {
    category = "system";
  } else if (/money|dollar|payment|card|shopping|cart|bag|price|coin/.test(name.toLowerCase())) {
    category = "finance";
  } else if (/time|clock|calendar|date|schedule|alarm|timer/.test(name.toLowerCase())) {
    category = "time";
  } else if (/map|location|pin|place|gps|navigate|compass|world/.test(name.toLowerCase())) {
    category = "location";
  } else if (/share|like|heart|social|facebook|twitter|instagram|linkedin/.test(name.toLowerCase())) {
    category = "social";
  } else if (/home|house|building|office|store|shop/.test(name.toLowerCase())) {
    category = "places";
  } else if (/device|phone|computer|laptop|tablet|mobile|desktop/.test(name.toLowerCase())) {
    category = "devices";
  } else if (/weather|sun|cloud|rain|snow|wind|temperature/.test(name.toLowerCase())) {
    category = "weather";
  } else if (/transport|car|bus|train|plane|bike|ship/.test(name.toLowerCase())) {
    category = "transport";
  }

  // Generate relevant tags for search
  const tags = [
    kebabName,
    ...kebabName.split('-'),
    category,
    'boxicons',
    'bi'
  ].filter(tag => tag.length > 1);

  // Determine style based on icon name pattern
  let style = 'outline'; // Default for BoxIcons regular icons
  if (name.toLowerCase().includes('solid') || name.endsWith('S')) {
    style = 'solid';
  }

  return {
    id: `boxicons-${kebabName}`,
    name: name.slice(2), // Remove 'Bi' prefix for display name
    svg: Component,
    style,
    tags,
    category,
  };
});

// Initialize with React components, will be preprocessed to strings when loaded
let processedBoxicons: IconItem[] | null = null;

export async function getBoxicons(): Promise<IconItem[]> {
  if (!processedBoxicons) {
    processedBoxicons = await preprocessIcons(sortIconsByStyleThenName(rawBoxicons));
  }
  return processedBoxicons;
}

// For backwards compatibility and synchronous access
export const boxicons: IconItem[] = sortIconsByStyleThenName(rawBoxicons);

export default boxicons;