/**
 * Comprehensive stroke configuration system
 * Centralizes all stroke-related logic for consistent behavior across icon libraries
 */

export interface StrokeConfig {
  // Whether this library supports stroke width customization
  supportsCustomization: boolean;
  
  // Default stroke width for this library (when not customized)
  defaultStrokeWidth: number;
  
  // Whether to remove existing stroke-width attributes before applying custom ones
  removeExistingStroke: boolean;
  
  // Specific stroke attributes to process (allows fine-grained control)
  strokeAttributes: ('stroke-width' | 'strokeWidth')[];
  
  // CSS style properties to process
  strokeStyles: ('stroke-width')[];
  
  // Whether to add stroke-width when stroke exists but no stroke-width is present
  addMissingStrokeWidth: boolean;
  
  // Library-specific processing overrides
  customProcessor?: (svgContent: string) => string;
}

export const strokeConfigurations: Record<string, StrokeConfig> = {
  'lucide': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width', 'strokeWidth'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'feather': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'tabler': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'atlas': {
    supportsCustomization: true,
    defaultStrokeWidth: 1.5,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'heroicons': {
    supportsCustomization: true,
    defaultStrokeWidth: 1.5,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'phosphor': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'iconoir': {
    supportsCustomization: true,
    defaultStrokeWidth: 1.5,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'line': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'radix': {
    supportsCustomization: true,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  // Libraries that don't support stroke customization
  'fluent-ui': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: true, // Remove hardcoded stroke-width="2"
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: false,
    customProcessor: (svg) => {
      // Remove hardcoded stroke-width attributes
      return svg
        .replace(/\s*stroke-width="[^"]*"/gi, '')
        .replace(/stroke-width:\s*[^;]+;?/gi, '');
    }
  },
  
  'solar': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: false,
  },
  
  'css-gg': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'boxicons': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'ant': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'bootstrap': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'remix': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'material': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'octicons': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'simple': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'pixelart': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'carbon': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'iconamoon': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'mingcute': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'majesticons': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'sargam': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'ikonate': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'teeny': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  'hugeicons': {
    supportsCustomization: true,
    defaultStrokeWidth: 1.5,
    removeExistingStroke: true,
    strokeAttributes: ['stroke-width'],
    strokeStyles: ['stroke-width'],
    addMissingStrokeWidth: true,
  },
  
  'proicons': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  },
  
  // Default config for unknown libraries
  'default': {
    supportsCustomization: false,
    defaultStrokeWidth: 2,
    removeExistingStroke: false,
    strokeAttributes: [],
    strokeStyles: [],
    addMissingStrokeWidth: false,
  }
};

/**
 * Get stroke configuration for a given library
 */
export function getStrokeConfig(library: string): StrokeConfig {
  return strokeConfigurations[library] || strokeConfigurations['default'];
}

/**
 * Detect library from icon ID
 */
export function detectLibraryFromIconId(iconId: string): string {
  if (iconId.startsWith('tabler-')) return 'tabler';
  if (iconId.startsWith('lucide-')) return 'lucide';
  if (iconId.startsWith('atlas-')) return 'atlas';
  if (iconId.startsWith('phosphor-')) return 'phosphor';
  if (iconId.startsWith('boxicons-')) return 'boxicons';
  if (iconId.startsWith('octicons-')) return 'octicons';
  if (iconId.startsWith('bootstrap-')) return 'bootstrap';
  if (iconId.startsWith('remix-')) return 'remix';
  if (iconId.startsWith('material-')) return 'material';
  if (iconId.startsWith('feather-')) return 'feather';
  if (iconId.startsWith('heroicons-')) return 'heroicons';
  if (iconId.startsWith('radix-')) return 'radix';
  if (iconId.startsWith('css-gg-')) return 'css-gg';
  if (iconId.startsWith('fluent-ui-')) return 'fluent-ui';
  if (iconId.startsWith('iconsax-')) return 'iconsax';
  if (iconId.startsWith('iconoir-')) return 'iconoir';
  if (iconId.startsWith('solar-')) return 'solar';
  if (iconId.startsWith('teeny-')) return 'teeny';
  if (iconId.startsWith('ant-')) return 'ant';
  if (iconId.startsWith('line-')) return 'line';
  if (iconId.startsWith('pixelart-')) return 'pixelart';
  if (iconId.startsWith('carbon-')) return 'carbon';
  if (iconId.startsWith('iconamoon-')) return 'iconamoon';
  if (iconId.startsWith('mingcute-')) return 'mingcute';
  if (iconId.startsWith('majesticon-')) return 'majesticons';
  if (iconId.startsWith('sargam-')) return 'sargam';
  if (iconId.startsWith('ikonate-')) return 'ikonate';
  if (iconId.startsWith('hugeicon-')) return 'hugeicons';
  if (iconId.startsWith('proicons-')) return 'proicons';
  if (iconId.startsWith('simple-')) return 'simple';
  return 'default';
}

/**
 * Apply stroke processing to SVG content based on library configuration
 */
export function applyStrokeConfiguration(
  svgContent: string, 
  library: string, 
  strokeWidth: number
): string {
  const config = getStrokeConfig(library);
  let processed = svgContent;
  
  // Apply custom processor if defined
  if (config.customProcessor) {
    processed = config.customProcessor(processed);
  }
  
  // Only apply stroke customization if library supports it
  if (!config.supportsCustomization) {
    return processed;
  }
  
  // Remove existing stroke-width if configured
  if (config.removeExistingStroke) {
    config.strokeAttributes.forEach(attr => {
      const attrPattern = new RegExp(`\\s*${attr}="[^"]*"`, 'gi');
      processed = processed.replace(attrPattern, '');
    });
    
    config.strokeStyles.forEach(style => {
      const stylePattern = new RegExp(`${style}:\\s*[^;]+;?`, 'gi');
      processed = processed.replace(stylePattern, '');
    });
  }
  
  // Apply new stroke width
  if (strokeWidth !== config.defaultStrokeWidth) {
    // Replace existing stroke-width attributes
    config.strokeAttributes.forEach(attr => {
      const attrPattern = new RegExp(`${attr}="[^"]*"`, 'gi');
      processed = processed.replace(attrPattern, `${attr}="${strokeWidth}"`);
    });
    
    // Replace stroke-width in style attributes
    config.strokeStyles.forEach(style => {
      const stylePattern = new RegExp(`${style}:\\s*[^;]+`, 'gi');
      processed = processed.replace(stylePattern, `${style}: ${strokeWidth}`);
    });
    
    // Add stroke-width if missing but stroke exists
    if (config.addMissingStrokeWidth) {
      processed = processed.replace(
        /(<[^>]*stroke="[^"]*"[^>]*?)(?![^>]*stroke-width)([^>]*>)/g, 
        `$1 stroke-width="${strokeWidth}"$2`
      );
    }
  }
  
  return processed;
}