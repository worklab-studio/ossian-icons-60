import { type ComponentType } from 'react';

export type IconItem = {
  id: string;
  name: string;
  svg: string | ComponentType<any>;
  tags?: string[];
  style?: string; // outline, solid, micro, mini, etc.
  category?: string; // navigation, communication, system, etc.
};

export type LibrarySection = {
  libraryId: string;
  libraryName: string;
  icons: IconItem[];
};

export type IconGridProps = {
  items: IconItem[];
  selectedId?: string | null;        // to highlight one "featured" tile
  onCopy?: (icon: IconItem) => void; // called after successful copy
  onIconClick?: (icon: IconItem) => void; // called when icon is clicked for selection
  // global styling controls:
  color?: string;        // CSS color value, applied as currentColor
  strokeWidth?: number;  // 0.25–3.0
  ariaLabel?: string;    // e.g., "Icon results grid"
  libraryName?: string;  // Display library name header when provided
};

export type SectionedIconGridProps = {
  sections: LibrarySection[];
  selectedId?: string | null;
  onCopy?: (icon: IconItem) => void;
  onIconClick?: (icon: IconItem) => void;
  color?: string;
  strokeWidth?: number;
  ariaLabel?: string;
};