import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconDetailHeader } from "@/components/IconDetailHeader";
import { ControlPanel } from "@/components/control-panel";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { IconCell } from "@/components/icon-grid/IconCell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertCircle, Loader2, Copy, Download, ArrowRight, Home } from "lucide-react";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { type IconItem } from "@/types/icon";
import { parseIconUrl, generateIconUrl } from "@/lib/url-helpers";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { toast } from "@/hooks/use-toast";
import { copyIcon } from "@/lib/copy";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCustomizeSheet } from "@/components/mobile/MobileCustomizeSheet";
import { MobileIconActions } from "@/components/mobile/MobileIconActions";
import { extractWords, stem } from "@/lib/search-algorithms";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useSchemaMarkup } from "@/hooks/useSchemaMarkup";
import { IconMetaService } from "@/services/IconMetaService";
import { getSimpleSvg, downloadFile, copyToClipboard } from "@/lib/simple-helpers";
import { supportsStrokeWidth } from "@/lib/icon-utils";
import { RotatingFooter } from "@/components/RotatingFooter";

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
  const [similarIconsLoading, setSimilarIconsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryMetadata, setLibraryMetadata] = useState<{ name: string; description?: string; count?: number } | null>(null);
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  // No search worker needed - we use direct main-thread matching

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

        const library = iconLibraryManager.libraries.find(lib => lib.id === parsedLibraryId);
        if (!library) {
          setError(`Library "${parsedLibraryId}" not found`);
          setLoading(false);
          return;
        }

        setLibraryMetadata({
          name: library.name,
          description: library.description,
          count: library.count
        });

        const libraryIcons = await iconLibraryManager.loadLibrary(parsedLibraryId);
        
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
        findSimilarIconsAcrossLibraries(targetIcon);

      } catch (err) {
        console.error('Failed to load icon:', err);
        setError(err instanceof Error ? err.message : 'Failed to load icon');
      } finally {
        setLoading(false);
      }
    };

    loadIconData();
  }, [parsedLibraryId, iconName]);

  // Find similar icons using direct main-thread approach (no worker needed)
  const findSimilarIconsAcrossLibraries = async (targetIcon: IconItem) => {
    try {
      setSimilarIconsLoading(true);

      // Extract searchable words from target icon
      const nameWords = extractWords(targetIcon.name).map(stem);
      const tagWords = (targetIcon.tags || []).map(t => stem(t.toLowerCase()));
      const allTargetWords = new Set([...nameWords, ...tagWords]);

      // Load ALL libraries for comprehensive similar icons
      const allLibraryIds = iconLibraryManager.libraries.map(lib => lib.id);

      const allIcons: IconItem[] = [];
      const results = await Promise.allSettled(
        allLibraryIds.map(libId => iconLibraryManager.loadLibrary(libId))
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allIcons.push(...result.value);
        }
      }

      // Score each icon by name/tag word overlap
      const scored = allIcons
        .filter(ico => ico.id !== targetIcon.id)
        .map(ico => {
          const icoNameWords = extractWords(ico.name).map(stem);
          const icoTagWords = (ico.tags || []).map(t => stem(t.toLowerCase()));
          let score = 0;
          for (const w of icoNameWords) {
            if (allTargetWords.has(w)) score += 3;
          }
          for (const w of icoTagWords) {
            if (allTargetWords.has(w)) score += 1;
          }
          return { icon: ico, score };
        })
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        ;

      setSimilarIcons(scored.map(s => s.icon));
    } catch (error) {
      console.error('Failed to find similar icons:', error);
      // Fallback: show icons from current library
      try {
        const libraryIcons = await iconLibraryManager.loadLibrary(parsedLibraryId);
        setSimilarIcons(libraryIcons.filter(ico => ico.id !== targetIcon.id));
      } catch { /* ignore */ }
    } finally {
      setSimilarIconsLoading(false);
    }
  };

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

  // Navigate to similar icon's detail page
  const handleSimilarIconClick = (clickedIcon: IconItem) => {
    // Extract library ID from icon ID (format: libraryId-iconName or libraryId-style-iconName)
    const iconIdParts = clickedIcon.id.split('-');
    let iconLibraryId = parsedLibraryId; // fallback
    
    // Try to match the icon ID prefix to a known library
    for (const lib of iconLibraryManager.libraries) {
      if (clickedIcon.id.startsWith(lib.id + '-')) {
        iconLibraryId = lib.id;
        break;
      }
    }
    
    navigate(generateIconUrl(iconLibraryId, clickedIcon.name));
  };

  // Quick copy SVG
  const handleQuickCopySVG = async () => {
    if (!icon) return;
    try {
      let svgContent = getSimpleSvg(icon);
      if (supportsStrokeWidth(icon) && customization.strokeWidth !== 2) {
        svgContent = svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
      }
      svgContent = svgContent.replace(/currentColor/g, customization.color);
      await copyToClipboard(svgContent);
      toast({ description: "SVG copied to clipboard!", duration: 2000 });
    } catch {
      toast({ description: "Failed to copy SVG", variant: "destructive", duration: 2000 });
    }
  };

  // Quick download SVG
  const handleQuickDownloadSVG = () => {
    if (!icon) return;
    try {
      let svgContent = getSimpleSvg(icon);
      if (supportsStrokeWidth(icon) && customization.strokeWidth !== 2) {
        svgContent = svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
      }
      svgContent = svgContent.replace(/currentColor/g, customization.color);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      downloadFile(blob, `${icon.name}.svg`);
      toast({ description: `${icon.name}.svg downloaded!`, duration: 2000 });
    } catch {
      toast({ description: "Failed to download SVG", variant: "destructive", duration: 2000 });
    }
  };

  // Explore other libraries (pick 3 random popular ones excluding current)
  const otherLibraries = useMemo(() => {
    const popular = ['lucide', 'tabler', 'heroicons', 'phosphor', 'feather', 'bootstrap', 'solar'];
    return popular
      .filter(id => id !== parsedLibraryId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(id => iconLibraryManager.libraries.find(lib => lib.id === id))
      .filter(Boolean);
  }, [parsedLibraryId]);

  // Generate enhanced meta tags for SEO
  const enhancedMeta = useMemo(() => {
    if (!icon || !libraryMetadata) return null;
    const library = iconLibraryManager.libraries.find(lib => lib.id === parsedLibraryId);
    if (!library) return null;
    return IconMetaService.generateEnhancedMeta(icon, library, parsedLibraryId);
  }, [icon, libraryMetadata, parsedLibraryId]);

  const pageTitle = enhancedMeta?.title || `${icon?.name || iconName} Icon - ${libraryMetadata?.name || parsedLibraryId} | Iconstack`;
  const pageDescription = enhancedMeta?.description || `Download and customize the ${icon?.name || iconName} icon from ${libraryMetadata?.name || parsedLibraryId}. Available in SVG format with customizable colors and stroke width.`;

  const { schemaMarkup } = useSchemaMarkup({
    libraryId: parsedLibraryId,
    iconName: icon?.name || iconName,
    icons: icon ? [icon] : undefined
  });

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

  // Shared icon preview — native 24x24 size
  const iconPreview = (
    <div 
      className="flex items-center justify-center w-32 h-32"
      style={{ color: customization.color }}
    >
      {typeof icon.svg === 'string' ? (
        <div 
          className="icon-svg [&>svg]:w-9 [&>svg]:h-9"
          dangerouslySetInnerHTML={{ 
            __html: icon.svg
              .replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`)
          }} 
        />
      ) : (
        React.createElement(icon.svg as React.ComponentType<any>, {
          size: 36,
          color: customization.color,
          strokeWidth: customization.strokeWidth
        })
      )}
    </div>
  );

  // Shared breadcrumbs with Home link
  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/"><Home className="h-4 w-4" /></Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/library/${parsedLibraryId}`}>{libraryMetadata?.name || parsedLibraryId}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{icon.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  // Tags as clickable search links
  const tagsSection = icon.tags && icon.tags.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {icon.tags.slice(0, 12).map(tag => (
        <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`}>
          <Badge variant="secondary" className="cursor-pointer hover:bg-accent text-xs">
            {tag}
          </Badge>
        </Link>
      ))}
    </div>
  ) : null;

  // "More from this library" + explore other libraries
  const libraryLinksSection = (
    <div className="space-y-4">
      <Link 
        to={`/library/${parsedLibraryId}`}
        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
      >
        <div>
          <div className="text-sm font-medium">Browse all {libraryMetadata?.name} icons</div>
          {libraryMetadata?.count && (
            <div className="text-xs text-muted-foreground">{libraryMetadata.count.toLocaleString()} icons available</div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>
      
      {otherLibraries.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">Explore other libraries</div>
          <div className="space-y-1.5">
            {otherLibraries.map(lib => lib && (
              <Link 
                key={lib.id} 
                to={`/library/${lib.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors text-sm"
              >
                <span>{lib.name}</span>
                <span className="text-xs text-muted-foreground">{lib.count.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Similar icons section — simple CSS grid, no virtualization
  const similarIconsSection = (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground">SIMILAR ICONS</h3>
      </div>
      <div className="border-b border-border/30"></div>
      <div className="flex-1 p-6 pt-4 overflow-y-auto">
        {similarIconsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Finding similar icons across libraries...</span>
            </div>
          </div>
        ) : similarIcons.length > 0 ? (
          <div 
            className="grid gap-0"
            style={{ 
              gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
              gridAutoRows: '64px'
            }}
          >
            {similarIcons.map((simIcon) => (
              <IconCell
                key={simIcon.id}
                icon={simIcon}
                isSelected={false}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                onCopy={handleIconCopy}
                onIconClick={handleSimilarIconClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <span className="text-sm text-muted-foreground">No similar icons found</span>
          </div>
        )}
      </div>
    </div>
  );

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          {enhancedMeta && (
            <>
              <meta name="keywords" content={enhancedMeta.keywords} />
              <meta property="og:title" content={enhancedMeta.ogTitle} />
              <meta property="og:description" content={enhancedMeta.ogDescription} />
              <meta name="twitter:title" content={enhancedMeta.twitterTitle} />
              <meta name="twitter:description" content={enhancedMeta.twitterDescription} />
            </>
          )}
          <meta property="og:type" content="website" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={`https://iconstack.io/icon/${parsedLibraryId}/${iconNameParam}`} />
        </Helmet>

        <SchemaMarkup schema={schemaMarkup} />

        <div className="flex flex-col min-h-screen bg-background">
          <IconDetailHeader />
          
          {/* Breadcrumbs */}
          <div className="px-4 py-3 border-b border-border/30">
            {breadcrumbs}
          </div>
          
          {/* Icon Preview */}
          <div className="flex flex-col items-center py-8 px-4 border-b border-border/30">
            {iconPreview}
            
            {/* Quick actions */}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={handleQuickCopySVG}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy SVG
              </Button>
              <Button variant="default" size="sm" onClick={handleQuickDownloadSVG}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Icon Info */}
          <div className="px-4 py-5">
            <h1 className="text-xl font-semibold mb-1">{icon.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">
              From {libraryMetadata?.name || parsedLibraryId}
              {icon.style && ` • ${icon.style} style`}
            </p>
            {tagsSection}
          </div>
          
          <div className="border-b border-border/30 mx-4"></div>
          
          {/* Technical Details */}
          <div className="px-4 py-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Format</div>
                <div>SVG</div>
              </div>
              <div>
                <div className="text-muted-foreground">Library</div>
                <div>{libraryMetadata?.name || parsedLibraryId}</div>
              </div>
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
          
          <div className="border-b border-border/30 mx-4"></div>
          
          {/* Library Links */}
          <div className="px-4 py-5">
            {libraryLinksSection}
          </div>
          
          <div className="border-b border-border/30 mx-4"></div>
          
          {/* Similar Icons */}
          <div className="px-4 py-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">SIMILAR ICONS</h3>
            {similarIconsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Finding similar icons...</span>
                </div>
              </div>
            ) : similarIcons.length > 0 ? (
              <IconGrid
                items={similarIcons}
                selectedId={null}
                onCopy={handleIconCopy}
                onIconClick={handleSimilarIconClick}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                ariaLabel="Similar icons grid"
              />
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-muted-foreground">No similar icons found</span>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <RotatingFooter />
        </div>

        <MobileCustomizeSheet
          isOpen={showCustomizeSheet}
          onClose={() => setShowCustomizeSheet(false)}
        />
        <MobileIconActions
          isOpen={showMobileActions}
          onClose={() => setShowMobileActions(false)}
          selectedIcon={icon}
        />
      </>
    );
  }

  // DESKTOP LAYOUT
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {enhancedMeta && (
          <>
            <meta name="keywords" content={enhancedMeta.keywords} />
            <meta property="og:title" content={enhancedMeta.ogTitle} />
            <meta property="og:description" content={enhancedMeta.ogDescription} />
            <meta name="twitter:title" content={enhancedMeta.twitterTitle} />
            <meta name="twitter:description" content={enhancedMeta.twitterDescription} />
          </>
        )}
        
        {!enhancedMeta && (
          <>
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta name="keywords" content={`${icon?.name}, ${libraryMetadata?.name}, icon, svg, ${icon?.tags?.join(', ') || ''}, free icons, web development`} />
          </>
        )}
        
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`https://iconstack.io/icon/${parsedLibraryId}/${iconNameParam}`} />
        <meta property="og:image" content="https://iconstack.io/lovable-uploads/98f14649-ca6b-4fda-8694-18be1925419a.png" />
        <meta property="og:url" content={`https://iconstack.io/icon/${parsedLibraryId}/${iconNameParam}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://iconstack.io/lovable-uploads/98f14649-ca6b-4fda-8694-18be1925419a.png" />
        <meta name="author" content="Iconstack" />
        <meta property="og:site_name" content="Iconstack" />
        <meta property="og:locale" content="en_US" />
      </Helmet>

      <SchemaMarkup schema={schemaMarkup} />

      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="flex-1 flex flex-col h-screen">
            <IconDetailHeader />
            
            {/* Breadcrumb section with Home */}
            <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-background">
              {breadcrumbs}
            </div>
            
            <main className="flex-1 overflow-hidden flex h-full">
              {/* Left: Icon Display with quick actions */}
              <div className="w-[360px] flex-shrink-0 border-r border-border/30 flex flex-col">
              <div className="p-6 flex-shrink-0">
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center justify-center w-40 h-40 rounded-2xl bg-muted/40 border border-border/50 shadow-sm">
                      {iconPreview}
                    </div>
                  </div>
                  
                  {/* Quick action buttons */}
                  <div className="flex gap-2 justify-center mb-2">
                    <Button variant="outline" size="sm" className="h-9 px-4" onClick={handleQuickCopySVG}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy SVG
                    </Button>
                    <Button variant="default" size="sm" className="h-9 px-4" onClick={handleQuickDownloadSVG}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download SVG
                    </Button>
                  </div>
                </div>
                <div className="border-b border-border"></div>
              </div>
              
              {/* Right: Details - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col min-h-full">
                  {/* Icon Info Header */}
                  <div className="p-6">
                    <h1 className="text-xl font-semibold mb-2">{icon.name}</h1>
                    <p className="text-sm text-muted-foreground mb-3">
                      From {libraryMetadata?.name || parsedLibraryId}
                      {icon.style && ` • ${icon.style} style`}
                    </p>
                    {tagsSection}
                  </div>
                  
                  <div className="border-b border-border"></div>
                  
                  {/* Technical Details */}
                  <div className="p-6 border-b border-border/30">
                    <div className="grid grid-cols-2 gap-6 text-sm">
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
                  
                  {/* Library Links Section */}
                  <div className="p-6 border-b border-border/30">
                    {libraryLinksSection}
                  </div>
                  
                  {/* Similar Icons Section */}
                  {similarIconsSection}
                </div>
              </div>
            </main>
            
            {/* Footer */}
            <RotatingFooter />
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
