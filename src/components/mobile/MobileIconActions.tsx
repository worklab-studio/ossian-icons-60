import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileCode, Braces, Image } from "lucide-react";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { toast } from "@/hooks/use-toast";
import React from "react";
import { copyIcon } from "@/lib/copy";
import { getSimpleSvg, downloadFile, copyToClipboard } from "@/lib/simple-helpers";
import { supportsStrokeWidth } from "@/lib/icon-utils";
import { HapticsManager } from "@/lib/haptics";

interface MobileIconActionsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: {
    id: string;
    name: string;
    svg: string | React.ComponentType<any>;
    style?: string;
  } | null;
}

export function MobileIconActions({
  isOpen,
  onClose,
  selectedIcon,
}: MobileIconActionsProps) {
  const { customization } = useIconCustomization();

  const getCustomizedSVG = () => {
    if (!selectedIcon) return '';
    
    let svgContent = getSimpleSvg(selectedIcon);
    
    // Apply stroke-width customization if supported and not default
    if (supportsStrokeWidth(selectedIcon) && customization.strokeWidth !== 2) {
      svgContent = svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
    }
    
    // Apply color customization - replace all color attributes
    // Replace currentColor in stroke and fill attributes
    svgContent = svgContent.replace(/stroke="currentColor"/g, `stroke="${customization.color}"`);
    svgContent = svgContent.replace(/fill="currentColor"/g, `fill="${customization.color}"`);
    // Replace standalone currentColor references
    svgContent = svgContent.replace(/currentColor/g, customization.color);
    
    return svgContent;
  };

  const handleDownloadSVG = async () => {
    if (!selectedIcon) return;
    
    await HapticsManager.medium();
    
    try {
      const customizedSVG = getCustomizedSVG();
      
      const blob = new Blob([customizedSVG], { type: 'image/svg+xml' });
      downloadFile(blob, `${selectedIcon.name}.svg`);
      
      toast({
        description: `${selectedIcon.name}.svg downloaded successfully!`,
        duration: 2000
      });
      await HapticsManager.notification('success');
      onClose();
    } catch (error) {
      toast({
        description: "Failed to download SVG",
        variant: "destructive",
        duration: 2000
      });
      await HapticsManager.notification('error');
    }
  };

  const handleDownloadPNG = async () => {
    if (!selectedIcon) return;
    
    await HapticsManager.medium();
    
    try {
      const customizedSVG = getCustomizedSVG();
      
      if (!customizedSVG.includes('xmlns=')) {
        throw new Error('Invalid SVG structure');
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      canvas.width = 500;
      canvas.height = 500;
      
      const img = document.createElement('img');
      const svgBlob = new Blob([customizedSVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = async () => {
        ctx.clearRect(0, 0, 500, 500);
        ctx.drawImage(img, 0, 0, 500, 500);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          downloadFile(blob, `${selectedIcon.name}.png`);
          URL.revokeObjectURL(url);
          
          toast({
            description: `${selectedIcon.name}.png downloaded successfully!`,
            duration: 2000
          });
          await HapticsManager.notification('success');
          onClose();
        }, 'image/png');
      };
      
      img.src = url;
    } catch (error) {
      toast({
        description: "Failed to download PNG",
        variant: "destructive",
        duration: 2000
      });
      await HapticsManager.notification('error');
    }
  };

  const handleCopySVG = async () => {
    if (!selectedIcon) return;
    
    await HapticsManager.light();
    
    try {
      const customizedSVG = getCustomizedSVG();
      await copyToClipboard(customizedSVG);
      toast({
        description: "SVG copied to clipboard!",
        duration: 2000
      });
      await HapticsManager.notification('success');
      onClose();
    } catch (error) {
      toast({
        description: "Failed to copy SVG",
        variant: "destructive",
        duration: 2000
      });
      await HapticsManager.notification('error');
    }
  };

  const handleCopyXML = async () => {
    if (!selectedIcon) return;
    
    await HapticsManager.light();
    
    try {
      const customizedSVG = getCustomizedSVG();
      // Convert to data URI format with URL encoding
      const encodedSVG = encodeURIComponent(customizedSVG);
      const dataURI = `data:image/svg+xml,${encodedSVG}`;
      await copyToClipboard(dataURI);
      toast({
        description: "SVG XML copied to clipboard!",
        duration: 2000
      });
      await HapticsManager.notification('success');
      onClose();
    } catch (error) {
      toast({
        description: "Failed to copy XML",
        variant: "destructive",
        duration: 2000
      });
      await HapticsManager.notification('error');
    }
  };

  if (!selectedIcon) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="sticky top-0 bg-background border-b z-10">
          <DrawerHeader>
            <DrawerTitle className="text-left text-lg font-semibold">
              {selectedIcon.name}
            </DrawerTitle>
          </DrawerHeader>
        </div>
        
        <div className="flex-1 px-4">
          <div className="flex flex-col justify-end h-full pb-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Export
              </h3>
              
              <div className="space-y-2">
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
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}