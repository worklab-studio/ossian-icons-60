/**
 * Icon export utilities for downloading icons as PNG with transparent backgrounds
 */

export interface ExportOptions {
  size?: number;
  format?: 'png' | 'svg';
  filename?: string;
  removeBackground?: boolean;
}

/**
 * Convert SVG string to PNG blob with transparent background
 */
export const svgToPng = (svgString: string, size: number = 512): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create SVG element
    const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement as any as SVGElement;
    
    // Set size attributes
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    
    // Ensure transparent background
    svg.style.backgroundColor = 'transparent';
    
    // Convert to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create image element
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, size, size);
      
      // Draw image
      ctx.drawImage(img, 0, 0, size, size);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(svgUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        1.0
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = svgUrl;
  });
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export icon as PNG with transparent background
 */
export const exportIconAsPng = async (
  iconSvg: string,
  iconName: string,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    size = 512,
    filename = `${iconName.toLowerCase().replace(/\s+/g, '-')}-icon.png`
  } = options;
  
  try {
    // Convert SVG to PNG
    const pngBlob = await svgToPng(iconSvg, size);
    
    // Download the file
    downloadBlob(pngBlob, filename);
  } catch (error) {
    console.error('Failed to export icon as PNG:', error);
    throw error;
  }
};

/**
 * Export icon in original SVG format
 */
export const exportIconAsSvg = (
  iconSvg: string,
  iconName: string,
  filename?: string
): void => {
  const svgFilename = filename || `${iconName.toLowerCase().replace(/\s+/g, '-')}-icon.svg`;
  const svgBlob = new Blob([iconSvg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(svgBlob, svgFilename);
};

/**
 * Batch export multiple icons as PNG
 */
export const batchExportIconsAsPng = async (
  icons: Array<{ svg: string; name: string }>,
  options: ExportOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<void> => {
  const { size = 512 } = options;
  
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    try {
      await exportIconAsPng(icon.svg, icon.name, { size });
      onProgress?.(i + 1, icons.length);
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to export icon ${icon.name}:`, error);
    }
  }
};