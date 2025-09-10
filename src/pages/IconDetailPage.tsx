import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconDetailHeader } from "@/components/IconDetailHeader";
import { ControlPanel } from "@/components/control-panel";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { type IconItem } from "@/types/icon";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchemaMarkup } from "@/hooks/useSchemaMarkup";
import { SchemaMarkup } from "@/components/SchemaMarkup";

// URL-safe name conversion utilities
const toUrlSafeName = (name: string) => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const fromUrlSafeName = (urlName: string) => {
  return urlName.replace(/-/g, ' ');
};

export default function IconDetailPage() {
  const { libraryId, iconName } = useParams<{ libraryId: string; iconName: string }>();
  const navigate = useNavigate();
  const { customization } = useIconCustomization();
  
  const [currentIcon, setCurrentIcon] = useState<IconItem | null>(null);
  const [similarIcons, setSimilarIcons] = useState<IconItem[]>([]);
  const [allLibraryIcons, setAllLibraryIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load icon and similar icons
  useEffect(() => {
    const loadIconData = async () => {
      if (!libraryId || !iconName) return;
      
      setLoading(true);
      try {
        // Load all icons from the library
        const libraryIcons = await iconLibraryManager.loadLibrary(libraryId);
        setAllLibraryIcons(libraryIcons);
        
        // Find the specific icon by converting URL name back to display name
        const searchName = fromUrlSafeName(iconName);
        const foundIcon = libraryIcons.find(icon => 
          toUrlSafeName(icon.name) === iconName ||
          icon.name.toLowerCase() === searchName.toLowerCase() ||
          icon.id.toLowerCase().includes(searchName.toLowerCase())
        );
        
        if (!foundIcon) {
          navigate('/404');
          return;
        }
        
        setCurrentIcon(foundIcon);
        setSelectedId(foundIcon.id);
        
        // Find similar icons (same tags, similar names, or from same category)
        const similar = libraryIcons
          .filter(icon => icon.id !== foundIcon.id)
          .filter(icon => {
            // Check for similar tags
            const hasCommonTags = foundIcon.tags?.some(tag => 
              icon.tags?.includes(tag)
            );
            
            // Check for similar names
            const hasSimilarName = icon.name.toLowerCase().includes(
              foundIcon.name.toLowerCase().split(' ')[0]
            ) || foundIcon.name.toLowerCase().includes(
              icon.name.toLowerCase().split(' ')[0]
            );
            
            // Check for same category
            const hasSameCategory = foundIcon.category && icon.category === foundIcon.category;
            
            return hasCommonTags || hasSimilarName || hasSameCategory;
          })
          .slice(0, 24); // Limit to 24 similar icons
          
        setSimilarIcons(similar);
        
      } catch (error) {
        console.error('Error loading icon:', error);
        toast({
          title: "Error loading icon",
          description: "Failed to load icon details. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadIconData();
  }, [libraryId, iconName, navigate]);

  // Get library metadata
  const libraryMetadata = useMemo(() => {
    return iconLibraryManager.libraries.find(lib => lib.id === libraryId);
  }, [libraryId]);

  // Handle icon copy
  const handleIconCopy = (icon: IconItem) => {
    toast({
      description: `${icon.name} copied to clipboard`,
      duration: 2000,
    });
  };

  // Handle icon click
  const handleIconClick = (icon: IconItem) => {
    setSelectedId(icon.id);
    const urlSafeName = toUrlSafeName(icon.name);
    navigate(`/icon/${libraryId}/${urlSafeName}`, { replace: true });
  };

  // Generate schema markup for SEO
  const { schemaMarkup } = useSchemaMarkup({
    icons: currentIcon ? [currentIcon] : undefined,
    libraryId: libraryId,
  });

  // Generate SEO metadata
  const seoTitle = currentIcon 
    ? `${currentIcon.name} Icon - ${libraryMetadata?.name} | IconStack`
    : 'Loading Icon...';
    
  const seoDescription = currentIcon
    ? `Download free ${currentIcon.name} icon from ${libraryMetadata?.name} icon library. Available in SVG and PNG formats with customization options.`
    : 'Loading icon details...';

  const canonicalUrl = `https://iconstack.co/icon/${libraryId}/${iconName}`;

  // Render icon with customizations
  const renderIconWithCustomization = (icon: IconItem, size: number = 256) => {
    if (typeof icon.svg === 'string') {
      const svgContent = icon.svg
        .replace(/stroke="[^"]*"/g, `stroke="${customization.color}"`)
        .replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`)
        .replace(/fill="currentColor"/g, `fill="${customization.color}"`)
        .replace(/width="[^"]*"/g, `width="${size}"`)
        .replace(/height="[^"]*"/g, `height="${size}"`);
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{ color: customization.color }}
        />
      );
    }
    
    if (typeof icon.svg === 'function') {
      const IconComponent = icon.svg;
      return (
        <IconComponent 
          size={size}
          strokeWidth={customization.strokeWidth}
          style={{ color: customization.color }}
        />
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <IconDetailHeader />
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
              <Skeleton className="h-48" />
            </div>
          </div>
          
          {/* Control Panel Skeleton */}
          <div className="w-80 border-l">
            <Skeleton className="h-screen" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentIcon || !libraryMetadata) {
    return (
      <div className="min-h-screen bg-background">
        <IconDetailHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Icon not found</h1>
            <p className="text-muted-foreground mb-4">
              The requested icon could not be found.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${currentIcon.name}, ${libraryMetadata.name}, icon, svg, png, download, free`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>

      <SchemaMarkup schema={schemaMarkup} />
      <IconDetailHeader />
      
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Icons
            </Button>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Large Icon Display */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center h-80">
                    <div className="p-8 rounded-lg border-2 border-dashed border-muted-foreground/30">
                      {renderIconWithCustomization(currentIcon, 256)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Icon Details */}
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{currentIcon.name}</h1>
                    <p className="text-muted-foreground">
                      From {libraryMetadata.name} icon library
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Library</h3>
                      <Badge variant="secondary" className="gap-2">
                        {libraryMetadata.name}
                        <ExternalLink className="h-3 w-3" />
                      </Badge>
                    </div>

                    {currentIcon.style && (
                      <div>
                        <h3 className="font-medium mb-2">Style</h3>
                        <Badge variant="outline">{currentIcon.style}</Badge>
                      </div>
                    )}

                    {currentIcon.category && (
                      <div>
                        <h3 className="font-medium mb-2">Category</h3>
                        <Badge variant="outline">{currentIcon.category}</Badge>
                      </div>
                    )}

                    {currentIcon.tags && currentIcon.tags.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentIcon.tags.slice(0, 8).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Format</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">SVG</Badge>
                        <Badge variant="outline">PNG</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">License</h3>
                      <Badge variant="outline">Free</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Similar Icons Section */}
            {similarIcons.length > 0 && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-6 text-muted-foreground">
                      Similar Icons from {libraryMetadata.name}
                    </span>
                  </div>
                </div>

                <IconGrid
                  items={similarIcons}
                  selectedId={selectedId}
                  onCopy={handleIconCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  ariaLabel={`Similar icons to ${currentIcon.name}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel 
          selectedIcon={currentIcon}
          selectedSet={libraryMetadata.style === 'animated' ? 'animated' : 'regular'}
        />
      </div>
    </div>
  );
}