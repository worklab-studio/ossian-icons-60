import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconDetailHeader } from "@/components/IconDetailHeader";
import { ControlPanel } from "@/components/control-panel";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertCircle, Loader2 } from "lucide-react";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { type IconItem } from "@/types/icon";
import { parseIconUrl } from "@/lib/url-helpers";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { toast } from "@/hooks/use-toast";
import { copyIcon } from "@/lib/copy";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCustomizeSheet } from "@/components/mobile/MobileCustomizeSheet";

export default function IconDetailPage() {
  const { libraryId, iconName: iconNameParam } = useParams<{
    libraryId: string;
    iconName: string;
  }>();
  const navigate = useNavigate();
  const { customization } = useIconCustomization();
  const isMobile = useIsMobile();
  
  const [icon, setIcon] = useState<IconItem | null>(null);
  const [similarIcons, setSimilarIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libraryMetadata, setLibraryMetadata] = useState<{ name: string; description?: string } | null>(null);
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);

  // Parse URL parameters
  const { libraryId: parsedLibraryId, iconName } = useMemo(() => {
    if (!libraryId || !iconNameParam) {
      return { libraryId: '', iconName: '' };
    }
    return parseIconUrl(libraryId, iconNameParam);
  }, [libraryId, iconNameParam]);

  // Load icon and similar icons
  useEffect(() => {
    const loadIconData = async () => {
      if (!parsedLibraryId || !iconName) {
        setError('Invalid icon URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if library exists
        const library = iconLibraryManager.libraries.find(lib => lib.id === parsedLibraryId);
        if (!library) {
          setError(`Library "${parsedLibraryId}" not found`);
          setLoading(false);
          return;
        }

        setLibraryMetadata({
          name: library.name,
          description: library.description
        });

        // Load library icons
        const libraryIcons = await iconLibraryManager.loadLibrary(parsedLibraryId);
        
        // Find the specific icon
        const targetIcon = libraryIcons.find(icon => 
          icon.name.toLowerCase() === iconName.toLowerCase() ||
          icon.id.toLowerCase().includes(iconName.toLowerCase().replace(/\s+/g, '-'))
        );

        if (!targetIcon) {
          setError(`Icon "${iconName}" not found in ${library.name} library`);
          setLoading(false);
          return;
        }

        setIcon(targetIcon);

        // Find similar icons (same library, similar tags or names)
        const similar = libraryIcons
          .filter(ico => ico.id !== targetIcon.id)
          .filter(ico => {
            // Check for similar tags
            if (targetIcon.tags && ico.tags) {
              const commonTags = targetIcon.tags.filter(tag => ico.tags?.includes(tag));
              if (commonTags.length > 0) return true;
            }
            
            // Check for similar names (same category or style)
            if (targetIcon.category && ico.category === targetIcon.category) return true;
            if (targetIcon.style && ico.style === targetIcon.style) return true;
            
            // Check for similar name words
            const targetWords = targetIcon.name.toLowerCase().split(/\s+/);
            const iconWords = ico.name.toLowerCase().split(/\s+/);
            const commonWords = targetWords.filter(word => iconWords.includes(word));
            if (commonWords.length > 0) return true;
            
            return false;
          })
          .slice(0, 24); // Limit to 24 similar icons

        // If no similar icons found, show popular icons from same library
        if (similar.length === 0) {
          const fallbackIcons = libraryIcons
            .filter(ico => ico.id !== targetIcon.id)
            .slice(0, 24);
          setSimilarIcons(fallbackIcons);
        } else {
          setSimilarIcons(similar);
        }

      } catch (err) {
        console.error('Failed to load icon:', err);
        setError(err instanceof Error ? err.message : 'Failed to load icon');
      } finally {
        setLoading(false);
      }
    };

    loadIconData();
  }, [parsedLibraryId, iconName]);

  // Handle icon copy
  const handleIconCopy = async (iconToCopy: IconItem) => {
    try {
      await copyIcon(iconToCopy, customization.color, customization.strokeWidth);
      toast({
        description: `${iconToCopy.name} copied to clipboard!`,
        duration: 2000
      });
    } catch (error) {
      toast({
        description: "Failed to copy icon",
        variant: "destructive",
        duration: 2000
      });
    }
  };


  // Generate page title and description for SEO
  const pageTitle = `${icon?.name || iconName} Icon - ${libraryMetadata?.name || parsedLibraryId} | IconStack`;
  const pageDescription = `Download and customize the ${icon?.name || iconName} icon from ${libraryMetadata?.name || parsedLibraryId}. Available in SVG format with customizable colors and stroke width.`;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="flex-1 flex flex-col h-screen">
            <IconDetailHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading icon...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !icon) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="flex-1 flex flex-col h-screen">
            <IconDetailHeader />
            <div className="flex-1 flex items-center justify-center p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Icon not found'}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Desktop layout - exactly matching homepage structure
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://iconstack.app/icon/${parsedLibraryId}/${iconNameParam}`} />
        
        {/* JSON-LD Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": icon.name,
            "description": pageDescription,
            "creator": {
              "@type": "Organization",
              "name": libraryMetadata?.name || parsedLibraryId
            },
            "url": `https://iconstack.app/icon/${parsedLibraryId}/${iconNameParam}`,
            "keywords": icon.tags?.join(', ') || '',
            "category": icon.category || 'Icon',
            "fileFormat": "SVG"
          })}
        </script>
      </Helmet>

      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">{/* Fixed viewport height exactly like homepage */}
          <div className="flex-1 flex flex-col h-screen">{/* Fixed layout container like homepage */}
            <IconDetailHeader />
            
            {/* Fixed breadcrumb section */}
            <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-background">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/?library=${parsedLibraryId}`}>{libraryMetadata?.name || parsedLibraryId}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{icon.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <main className="flex-1 overflow-hidden flex h-full">
              {/* Left: Fixed Icon Display - Non-scrollable */}
              <div className="w-96 flex-shrink-0 border-r border-border/30">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className="flex items-center justify-center w-80 h-80"
                      style={{ color: customization.color }}
                    >
                      {typeof icon.svg === 'string' ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: icon.svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`)
                        }} />
                      ) : (
                        React.createElement(icon.svg as React.ComponentType<any>, {
                          size: 320,
                          color: customization.color,
                          strokeWidth: customization.strokeWidth
                        })
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
              
              {/* Right: Fixed Details - Non-scrollable */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Icon Info Header */}
                  <div className="p-6">
                    <h1 className="text-xl font-semibold mb-2">{icon.name}</h1>
                    <p className="text-sm text-muted-foreground mb-4">
                      From {libraryMetadata?.name || parsedLibraryId}
                      {icon.style && ` • ${icon.style} style`}
                    </p>
                  </div>
                  
                  {/* Edge-to-edge segment */}
                  <div className="border-b border-border"></div>
                  
                  {/* Technical Details Section - 2 Column Layout */}
                  <div className="p-6 border-b border-border/30">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      {/* Column 1 */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-muted-foreground">Format</div>
                          <div>SVG</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Library</div>
                          <div>{libraryMetadata?.name || parsedLibraryId}</div>
                        </div>
                      </div>
                      
                      {/* Column 2 */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-muted-foreground">ID</div>
                          <div className="font-mono text-xs break-all">{icon.id}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">License</div>
                          <div>Open Source</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Similar Icons Section */}
                  {similarIcons.length > 0 && (
                    <div className="flex-1 flex flex-col">
                      <div className="p-6 pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">SIMILAR ICONS</h3>
                      </div>
                      <div className="border-b border-border/30"></div>
                      <div className="flex-1 p-6 pt-4 overflow-hidden">
                        <IconGrid
                          items={similarIcons}
                          selectedId={null}
                          onCopy={handleIconCopy}
                          color={customization.color}
                          strokeWidth={customization.strokeWidth}
                          ariaLabel="Similar icons grid"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
            
            
            {/* Footer - exactly like homepage */}
            <footer className="border-t p-4 text-center text-xs text-muted-foreground bg-background">
              <p>Built by Ossian Design Lab • <a href="https://buymeacoffee.com/thedeepflux" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Support creator</a></p>
            </footer>
          </div>
          
          <ControlPanel selectedIcon={icon} selectedSet={parsedLibraryId} />
        </div>
      </SidebarProvider>
      
      <MobileCustomizeSheet
        isOpen={showCustomizeSheet}
        onClose={() => setShowCustomizeSheet(false)}
      />
    </>
  );
}