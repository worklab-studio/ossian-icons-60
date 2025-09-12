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
import { useSearchWorker } from "@/hooks/useSearchWorker";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useSchemaMarkup } from "@/hooks/useSchemaMarkup";
import { IconMetaService } from "@/services/IconMetaService";

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
  const [libraryMetadata, setLibraryMetadata] = useState<{ name: string; description?: string } | null>(null);
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);
  
  // Search worker for cross-library similar icon discovery
  const { search, indexLibrary, isReady: searchWorkerReady } = useSearchWorker();

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

        // Set up cross-library similar icon search
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

  // Function to find similar icons across all libraries using search worker
  const findSimilarIconsAcrossLibraries = async (targetIcon: IconItem) => {
    console.log('🔍 Starting similar icons search for:', targetIcon.name, 'from library:', parsedLibraryId);
    console.log('🔧 Search worker ready:', searchWorkerReady);
    
    if (!searchWorkerReady) {
      console.log('⚠️ Search worker not ready, using fallback');
      // Fallback to same-library search if worker not ready
      const libraryIcons = await iconLibraryManager.loadLibrary(parsedLibraryId);
      const fallback = libraryIcons
        .filter(ico => ico.id !== targetIcon.id)
        .slice(0, 24);
      console.log('📦 Fallback similar icons found:', fallback.length);
      setSimilarIcons(fallback);
      return;
    }

    try {
      setSimilarIconsLoading(true);
      console.log('🔄 Starting cross-library search...');

      // Index popular libraries for cross-library search
      const popularLibraries = ['lucide', 'tabler', 'heroicons', 'phosphor', 'feather'];
      console.log('📚 Indexing libraries:', popularLibraries);
      
      const indexPromises = popularLibraries.map(async (libId) => {
        try {
          console.log(`📖 Loading library: ${libId}`);
          const icons = await iconLibraryManager.loadLibrary(libId);
          console.log(`📖 Loaded ${icons.length} icons from ${libId}`);
          await indexLibrary(libId, icons);
          console.log(`✅ Successfully indexed ${libId}`);
        } catch (error) {
          console.warn(`❌ Failed to index library ${libId}:`, error);
        }
      });

      await Promise.all(indexPromises);
      console.log('🎯 All libraries indexed');

      // Search for similar icons using multiple strategies
      const searchQueries = [
        targetIcon.name, // Direct name search
        ...(targetIcon.tags || []), // Tag-based search
        targetIcon.category || '', // Category search
      ].filter(Boolean);

      console.log('🔎 Search queries:', searchQueries);

      const allResults = new Set<string>(); // Use Set to avoid duplicates
      const similarIconsMap = new Map<string, IconItem>();

      // Execute multiple searches and combine results
      for (const query of searchQueries) {
        if (query.trim()) {
          try {
            console.log(`🔍 Searching for: "${query}"`);
            const { results } = await search(query, {
              maxResults: 50,
              fuzzy: true,
              enableSynonyms: true,
              enablePhonetic: true
            });

            console.log(`📊 Found ${results.length} results for query "${query}"`);
            
            results
              .filter(icon => icon.id !== targetIcon.id) // Exclude current icon
              .slice(0, 20) // Limit per query
              .forEach(icon => {
                if (!allResults.has(icon.id)) {
                  allResults.add(icon.id);
                  similarIconsMap.set(icon.id, icon);
                  console.log(`➕ Added similar icon: ${icon.name} (${icon.id})`);
                }
              });
          } catch (error) {
            console.warn(`❌ Search failed for query "${query}":`, error);
          }
        }
      }

      // Convert to array and limit to 24 results
      const finalSimilarIcons = Array.from(similarIconsMap.values()).slice(0, 24);
      console.log(`🎉 Final similar icons count: ${finalSimilarIcons.length}`);
      console.log('📋 Similar icons:', finalSimilarIcons.map(i => `${i.name} (${i.id.split('-')[0]})`));

      setSimilarIcons(finalSimilarIcons);
    } catch (error) {
      console.error('💥 Failed to find similar icons:', error);
      // Fallback to same-library search
      const libraryIcons = await iconLibraryManager.loadLibrary(parsedLibraryId);
      const fallback = libraryIcons
        .filter(ico => ico.id !== targetIcon.id)
        .slice(0, 24);
      console.log('🔄 Using fallback similar icons:', fallback.length);
      setSimilarIcons(fallback);
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


  // Generate enhanced meta tags for SEO
  const enhancedMeta = useMemo(() => {
    if (!icon || !libraryMetadata) return null;
    
    const library = iconLibraryManager.libraries.find(lib => lib.id === parsedLibraryId);
    if (!library) return null;
    
    return IconMetaService.generateEnhancedMeta(icon, library, parsedLibraryId);
  }, [icon, libraryMetadata, parsedLibraryId]);

  // Fallback meta for loading states
  const pageTitle = enhancedMeta?.title || `${icon?.name || iconName} Icon - ${libraryMetadata?.name || parsedLibraryId} | IconStack`;
  const pageDescription = enhancedMeta?.description || `Download and customize the ${icon?.name || iconName} icon from ${libraryMetadata?.name || parsedLibraryId}. Available in SVG format with customizable colors and stroke width.`;

  // Generate schema markup for this icon page
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

  // Desktop layout - exactly matching homepage structure
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Enhanced SEO Meta Tags */}
        {enhancedMeta && (
          <>
            <meta name="keywords" content={enhancedMeta.keywords} />
            
            {/* Open Graph enhanced tags */}
            <meta property="og:title" content={enhancedMeta.ogTitle} />
            <meta property="og:description" content={enhancedMeta.ogDescription} />
            
            {/* Twitter Card enhanced tags */}
            <meta name="twitter:title" content={enhancedMeta.twitterTitle} />
            <meta name="twitter:description" content={enhancedMeta.twitterDescription} />
          </>
        )}
        
        {/* Fallback meta tags for loading states */}
        {!enhancedMeta && (
          <>
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta name="keywords" content={`${icon?.name}, ${libraryMetadata?.name}, icon, svg, ${icon?.tags?.join(', ') || ''}, free icons, web development`} />
          </>
        )}
        
        {/* Standard meta tags */}
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`https://iconstack.io/icon/${parsedLibraryId}/${iconNameParam}`} />
        
        {/* Open Graph images */}
        <meta property="og:image" content="https://iconstack.io/lovable-uploads/98f14649-ca6b-4fda-8694-18be1925419a.png" />
        <meta property="og:url" content={`https://iconstack.io/icon/${parsedLibraryId}/${iconNameParam}`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://iconstack.io/lovable-uploads/98f14649-ca6b-4fda-8694-18be1925419a.png" />
        
        {/* Additional SEO enhancements */}
        <meta name="author" content="IconStack" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:site_name" content="IconStack" />
        <meta property="og:locale" content="en_US" />
      </Helmet>

      <SchemaMarkup schema={schemaMarkup} />

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
              <div className="w-96 flex-shrink-0 border-r border-border/30 relative">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className="flex items-center justify-center w-80 h-80"
                      style={{ color: customization.color }}
                    >
                      {typeof icon.svg === 'string' ? (
                        <div 
                          className="icon-svg [&>svg]:!w-80 [&>svg]:!h-80"
                          dangerouslySetInnerHTML={{ 
                            __html: icon.svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`)
                          }} 
                        />
                      ) : (
                        React.createElement(icon.svg as React.ComponentType<any>, {
                          size: 320,
                          color: customization.color,
                          strokeWidth: customization.strokeWidth
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* Edge-to-edge separator */}
                  <div className="absolute left-0 right-0 border-b border-border"></div>
                  
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
                  <div className="flex-1 flex flex-col">
                    <div className="p-6 pb-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">SIMILAR ICONS</h3>
                    </div>
                    <div className="border-b border-border/30"></div>
                    <div className="flex-1 p-6 pt-4 overflow-hidden">
                      {similarIconsLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Finding similar icons across libraries...</span>
                          </div>
                        </div>
                      ) : similarIcons.length > 0 ? (
                        <IconGrid
                          items={similarIcons}
                          selectedId={null}
                          onCopy={handleIconCopy}
                          color={customization.color}
                          strokeWidth={customization.strokeWidth}
                          ariaLabel="Similar icons grid from multiple libraries"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <span className="text-sm text-muted-foreground">No similar icons found</span>
                        </div>
                      )}
                    </div>
                  </div>
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