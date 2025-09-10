import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconDetailHeader } from "@/components/IconDetailHeader";
import { ControlPanel } from "@/components/control-panel";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  // Render the icon with current customization
  const renderIcon = (iconToRender: IconItem) => {
    if (typeof iconToRender.svg === 'string') {
      let svgContent = iconToRender.svg;
      
      // Apply customizations
      if (customization.strokeWidth !== 2) {
        svgContent = svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
      }
      
      return (
        <div 
          className="flex items-center justify-center w-72 h-72 rounded-xl bg-muted/30 border-2 border-border shadow-sm"
          style={{ color: customization.color }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      );
    } else {
      const IconComponent = iconToRender.svg as React.ComponentType<any>;
      return (
        <div className="flex items-center justify-center w-72 h-72 rounded-xl bg-muted/30 border-2 border-border shadow-sm">
          <IconComponent 
            size={256} 
            color={customization.color}
            strokeWidth={customization.strokeWidth}
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <IconDetailHeader onCustomizeClick={() => setShowCustomizeSheet(true)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading icon...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !icon) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <IconDetailHeader onCustomizeClick={() => setShowCustomizeSheet(true)} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Icon not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Generate page title and description for SEO
  const pageTitle = `${icon.name} Icon - ${libraryMetadata?.name || parsedLibraryId} | IconStack`;
  const pageDescription = `Download and customize the ${icon.name} icon from ${libraryMetadata?.name || parsedLibraryId}. Available in SVG format with customizable colors and stroke width.`;

  // Mobile layout for small screens
  if (isMobile) {
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

        <div className="flex h-screen flex-col overflow-hidden">
          <IconDetailHeader 
            libraryName={libraryMetadata?.name || parsedLibraryId} 
            iconName={icon.name}
            onCustomizeClick={() => setShowCustomizeSheet(true)}
          />
          
          <main className="flex-1 overflow-y-auto">
            {/* Icon Display */}
            <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] space-y-6">
              {renderIcon(icon)}
              
              {/* Icon Info Card */}
              <Card className="w-full max-w-sm bg-card border shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-foreground mb-1">{icon.name}</h1>
                    <p className="text-muted-foreground text-sm">{libraryMetadata?.name || parsedLibraryId}</p>
                  </div>
                  
                  {/* Tags */}
                  {icon.tags && icon.tags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {icon.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Similar Icons Section */}
            {similarIcons.length > 0 && (
              <section className="border-t bg-muted/20 py-6">
                <div className="px-4">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    Similar Icons
                  </h2>
                  <div className="bg-background rounded-lg border shadow-sm p-4">
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
              </section>
            )}
          </main>
          
          {/* Footer */}
          <footer className="border-t p-3 text-center text-xs text-muted-foreground bg-background">
            <p>Built by Ossian Design Lab</p>
          </footer>
        </div>
        
        <MobileCustomizeSheet
          isOpen={showCustomizeSheet}
          onClose={() => setShowCustomizeSheet(false)}
        />
      </>
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

      <div className="flex h-screen w-full overflow-hidden">{/* Fixed viewport height exactly like homepage */}
        <div className="flex-1 flex flex-col h-screen">{/* Fixed layout container like homepage */}
          <IconDetailHeader 
            libraryName={libraryMetadata?.name || parsedLibraryId} 
            iconName={icon.name}
            onCustomizeClick={() => setShowCustomizeSheet(true)}
          />
          
          <main className="flex-1 overflow-y-auto">{/* Scrollable content area like homepage */}
            {/* Icon Display Section */}
            <div className="p-6 lg:p-12 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
              {/* Large Icon Display */}
              <div className="flex flex-col items-center space-y-6">
                {renderIcon(icon)}
                
                {/* Icon Info Card */}
                <Card className="w-full max-w-lg bg-card border shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-foreground mb-2">{icon.name}</h1>
                      <p className="text-muted-foreground text-lg">{libraryMetadata?.name || parsedLibraryId}</p>
                    </div>
                    
                    {/* Tags */}
                    {icon.tags && icon.tags.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {icon.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator className="bg-border" />
                    
                    {/* Technical Info */}
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Format</span>
                        <div className="font-semibold text-foreground">SVG</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">License</span>
                        <div className="font-semibold text-foreground">Open Source</div>
                      </div>
                      {icon.style && (
                        <div>
                          <span className="text-muted-foreground block mb-1">Style</span>
                          <div className="font-semibold text-foreground capitalize">{icon.style}</div>
                        </div>
                      )}
                      {icon.category && (
                        <div>
                          <span className="text-muted-foreground block mb-1">Category</span>
                          <div className="font-semibold text-foreground capitalize">{icon.category}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-muted-foreground text-xs block mb-1">Icon ID</span>
                      <code className="font-mono text-xs text-muted-foreground break-all bg-muted px-2 py-1 rounded">
                        {icon.id}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Similar Icons Section */}
            {similarIcons.length > 0 && (
              <section className="border-t bg-muted/20 py-12">
                <div className="px-6 lg:px-12">
                  <div className="max-w-none">
                    <h2 className="text-2xl font-bold text-foreground mb-8">
                      Similar Icons from {libraryMetadata?.name || parsedLibraryId}
                    </h2>
                    <div className="bg-background rounded-lg border shadow-sm p-6">
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
                </div>
              </section>
            )}
          </main>
          
          {/* Footer matching homepage - sticky to bottom */}
          <footer className="border-t p-4 text-center text-xs text-muted-foreground bg-background">
            <p>Built by Ossian Design Lab • <a href="https://buymeacoffee.com/thedeepflux" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Support creator</a></p>
          </footer>
        </div>
        
        {/* Fixed Control Panel at right edge - exactly like homepage */}
        <ControlPanel selectedIcon={icon} selectedSet={parsedLibraryId} />
      </div>
      
      <MobileCustomizeSheet
        isOpen={showCustomizeSheet}
        onClose={() => setShowCustomizeSheet(false)}
      />
    </>
  );
}