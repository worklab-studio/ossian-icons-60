import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "./color-picker";
import { StrokeSlider } from "./stroke-slider";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileCode, Braces, Image } from "lucide-react";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { toast } from "@/hooks/use-toast";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { copyIcon } from "@/lib/copy";
import { getSimpleSvg, downloadFile, copyToClipboard } from "@/lib/simple-helpers";
import { supportsStrokeWidth } from "@/lib/icon-utils";
// Dynamic import for GIF functionality to reduce bundle size

// Force HMR refresh - no Card components used in this file

interface ControlPanelProps {
  selectedIcon?: {
    id: string;
    name: string;
    svg: string | React.ComponentType<any>;
    style?: string;
  } | null;
  selectedSet?: string;
}

export function ControlPanel({
  selectedIcon,
  selectedSet
}: ControlPanelProps) {
  const {
    customization
  } = useIconCustomization();

  const handleDownloadSVG = async () => {
    if (!selectedIcon) return;
    
    try {
      const customizedSVG = getSimpleSvg(selectedIcon);
      
      const blob = new Blob([customizedSVG], { type: 'image/svg+xml' });
      downloadFile(blob, `${selectedIcon.name}.svg`);
      
      toast({
        description: `${selectedIcon.name}.svg downloaded successfully!`,
        duration: 2000
      });
    } catch (error) {
      toast({
        description: `Failed to download SVG: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleDownloadPNG = async () => {
    if (!selectedIcon) return;
    
    try {
      const customizedSVG = getSimpleSvg(selectedIcon);
      
      // Enhanced PNG conversion with retry mechanism
      await convertSvgToPng(customizedSVG, selectedIcon.name);
      
    } catch (error) {
      toast({
        description: `Failed to download PNG: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 2000
      });
    }
  };

  // Enhanced PNG conversion with retry mechanism and timeout
  const convertSvgToPng = (svgContent: string, fileName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Use devicePixelRatio for high-DPI displays
      const size = 500;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = size * ratio;
      canvas.height = size * ratio;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(ratio, ratio);
      
      const img = document.createElement('img');
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Set timeout for image loading (10 seconds)
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('PNG conversion timeout - SVG took too long to load'));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
        try {
          // Canvas starts with transparent background by default
          
          // Draw the SVG image (use original size since we already scaled the context)
          ctx.drawImage(img, 0, 0, size, size);
          
          // Convert to PNG blob
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            
            if (blob) {
              downloadFile(blob, `${fileName}.png`);
              toast({
                description: `${fileName}.png downloaded successfully!`,
                duration: 2000
              });
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob from canvas'));
            }
          }, 'image/png', 1.0);
          
        } catch (canvasError) {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          reject(new Error(`Canvas rendering failed: ${canvasError instanceof Error ? canvasError.message : 'Unknown error'}`));
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image - the SVG may be malformed or unsupported'));
      };
      
      // Set the image source to start loading
      img.src = url;
    });
  };

  const getCustomizedSVG = () => {
    if (!selectedIcon) return '';
    
    let svgContent = getSimpleSvg(selectedIcon);
    
    // Apply stroke-width customization if supported and not default
    if (supportsStrokeWidth(selectedIcon) && customization.strokeWidth !== 2) {
      svgContent = svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
    }
    
    // Apply color customization by replacing currentColor with the actual color
    if (customization.color !== '#000000') {
      svgContent = svgContent.replace(/currentColor/g, customization.color);
    }
    
    return svgContent;
  };

  const handleCopySVG = async () => {
    if (!selectedIcon) {
      toast({
        description: "Please select an icon first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    try {
      const customizedSVG = getSimpleSvg(selectedIcon);

      const encodedSVG = encodeURIComponent(customizedSVG);
      const dataURL = `data:image/svg+xml,${encodedSVG}`;
      await copyToClipboard(dataURL);
      toast({
        description: "SVG data URL copied to clipboard!",
        duration: 2000
      });
    } catch (error) {
      toast({
        description: "Failed to copy SVG",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleCopyXML = async () => {
    if (!selectedIcon) {
      toast({
        description: "Please select an icon first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    try {
      const customizedSVG = getSimpleSvg(selectedIcon);
      await copyToClipboard(customizedSVG);
      toast({
        description: "SVG XML copied to clipboard!",
        duration: 2000
      });
    } catch (error) {
      toast({
        description: "Failed to copy XML",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleCopyJSON = async () => {
    if (!selectedIcon) {
      toast({
        description: "Please select an icon first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      // Extract animation properties from the React component
      const animationConfig = {
        name: selectedIcon.name,
        id: selectedIcon.id,
        type: "animated-svg",
        properties: {
          size: 24,
          color: customization.color,
          animations: []
        }
      };

      // If it's a React component, try to extract animation info from the rendered SVG
      if (typeof selectedIcon.svg !== 'string') {
        const IconComponent = selectedIcon.svg as React.ComponentType<any>;
        const element = React.createElement(IconComponent, {
          size: 24,
          color: customization.color
        });
        const svgString = renderToStaticMarkup(element);
        
        // Extract animation elements and their properties
        const animations: any[] = [];
        
        // Extract <animate> elements
        const animateRegex = /<animate[^>]*>/g;
        let match;
        while ((match = animateRegex.exec(svgString)) !== null) {
          const animateElement = match[0];
          const animation: any = { type: 'animate' };
          
          // Extract common animation attributes
          const attrRegex = /(\w+)="([^"]*)"/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(animateElement)) !== null) {
            animation[attrMatch[1]] = attrMatch[2];
          }
          animations.push(animation);
        }
        
        // Extract <animateTransform> elements
        const transformRegex = /<animateTransform[^>]*>/g;
        while ((match = transformRegex.exec(svgString)) !== null) {
          const transformElement = match[0];
          const animation: any = { type: 'animateTransform' };
          
          const attrRegex = /(\w+)="([^"]*)"/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(transformElement)) !== null) {
            animation[attrMatch[1]] = attrMatch[2];
          }
          animations.push(animation);
        }
        
        animationConfig.properties.animations = animations;
      }

      const jsonString = JSON.stringify(animationConfig, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast({
        description: "Animation JSON copied to clipboard!",
        duration: 2000
      });
    } catch (error) {
      toast({
        description: "Failed to copy JSON",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleCopyTSX = async () => {
    if (!selectedIcon) {
      toast({
        description: "Please select an icon first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      // Generate TSX component code
      const componentName = selectedIcon.name.replace(/[-\s]/g, '') + 'Icon';
      const tsxCode = `import React from 'react';

interface ${componentName}Props {
  size?: number;
  color?: string;
  className?: string;
}

export const ${componentName} = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}: ${componentName}Props) => {
  return (
${getCustomizedSVG().split('\n').map(line => `    ${line}`).join('\n')}
  );
};`;

      await navigator.clipboard.writeText(tsxCode);
      toast({
        description: "TSX component copied to clipboard!",
        duration: 2000
      });
    } catch (error) {
      toast({
        description: "Failed to copy TSX",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleDownloadGIF = async () => {
    if (!selectedIcon) {
      toast({
        description: "Please select an icon first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      toast({
        description: "Generating GIF... This may take a moment",
        duration: 3000
      });

      const svgContent = getCustomizedSVG();
      
      // Dynamic import to reduce bundle size
      const { default: GIF } = await import('gif.js');
      
      // Create GIF using gif.js
      const gif = new (GIF as any)({
        workers: 2,
        quality: 10,
        width: 200,
        height: 200,
        transparent: 0x000000
      });

      // Create frames by capturing the animated SVG at different time intervals
      const frameCount = 60; // Number of frames
      const duration = 2000; // Animation duration in ms
      const frameDelay = duration / frameCount;

      // Create a container for the SVG
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '200px';
      container.style.height = '200px';
      document.body.appendChild(container);

      // Create SVG element
      const svgElement = document.createElement('div');
      svgElement.innerHTML = svgContent;
      svgElement.style.width = '200px';
      svgElement.style.height = '200px';
      container.appendChild(svgElement);

      // Capture frames
      for (let i = 0; i < frameCount; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create image from SVG
          const img = document.createElement('img');
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.fillStyle = 'transparent';
              ctx.fillRect(0, 0, 200, 200);
              ctx.drawImage(img, 0, 0, 200, 200);
              gif.addFrame(canvas, { delay: frameDelay });
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });
        }
      }

      // Clean up container
      document.body.removeChild(container);

      // Render GIF
      gif.on('finished', function(blob: Blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedIcon.name}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          description: `${selectedIcon.name}.gif downloaded successfully!`,
          duration: 2000
        });
      });

      gif.render();
      
    } catch (error) {
      toast({
        description: "Failed to generate GIF",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  return (
    <div className="w-80 border-l bg-background h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="h-16 border-b flex items-center px-6">
        <h2 className="text-lg font-semibold">Customize</h2>
      </div>
      
      {/* Scrollable Middle Section */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full scrollbar-none">
          <div className="p-6 space-y-6">
            <ColorPicker />
            
            <Separator />
            
            {/* Show stroke slider only for icons that support stroke width */}
            {(!selectedIcon || supportsStrokeWidth(selectedIcon)) && (
              <>
                <StrokeSlider />
                <Separator />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Fixed Footer - Export Section */}
      <div className="p-6 pt-4 border-t bg-background">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Export</h4>
          
          {/* Animated Icon Export Options */}
          {selectedSet === "animated" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyJSON} 
                  disabled={!selectedIcon} 
                  className="text-xs"
                >
                  <Braces className="h-3 w-3 mr-1" />
                  Copy JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyTSX} 
                  disabled={!selectedIcon} 
                  className="text-xs"
                >
                  <FileCode className="h-3 w-3 mr-1" />
                  Copy TSX
                </Button>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleDownloadGIF} 
                disabled={!selectedIcon} 
                className="w-full text-xs"
              >
                <Image className="h-3 w-3 mr-1" />
                Download GIF
              </Button>
            </div>
          ) : (
            /* Regular Icon Export Options */  
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopySVG} 
                  disabled={!selectedIcon} 
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy SVG
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyXML} 
                  disabled={!selectedIcon} 
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy XML
                </Button>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleDownloadSVG} 
                disabled={!selectedIcon} 
                className="w-full text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download SVG
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPNG} 
                disabled={!selectedIcon} 
                className="w-full text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download PNG
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}