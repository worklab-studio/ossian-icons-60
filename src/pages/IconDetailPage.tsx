import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconItem } from '@/types/icon';
import { IconDetailHeader } from '@/components/IconDetailHeader';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Copy, Download, ExternalLink } from 'lucide-react';
import { ColorPicker } from '@/components/color-picker';
import { StrokeSlider } from '@/components/stroke-slider';
import { useIconCustomization } from '@/contexts/IconCustomizationContext';
import { copyIcon } from '@/lib/copy';
import { findSimilarIcons } from '@/utils/similarIcons';
import { supportsStrokeWidth } from '@/lib/icon-utils';
import { toast } from 'sonner';

const IconDetailPage = () => {
  const { libraryId, iconName } = useParams<{ libraryId: string; iconName: string }>();
  const navigate = useNavigate();
  const [icon, setIcon] = useState<IconItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarIcons, setSimilarIcons] = useState<IconItem[]>([]);
  const [allLibraryIcons, setAllLibraryIcons] = useState<IconItem[]>([]);
  const { customization } = useIconCustomization();

  useEffect(() => {
    const loadIcon = async () => {
      if (!libraryId || !iconName) {
        setError('Invalid icon parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const icons = await iconLibraryManager.loadLibrary(libraryId);
        setAllLibraryIcons(icons);
        
        // Find icon by name (handle URL-safe names)
        const normalizedIconName = iconName.replace(/-/g, ' ').toLowerCase();
        const foundIcon = icons.find(
          (icon) => 
            icon.name.toLowerCase() === normalizedIconName ||
            icon.name.toLowerCase().replace(/\s+/g, '-') === iconName.toLowerCase()
        );

        if (!foundIcon) {
          setError('Icon not found');
        } else {
          setIcon(foundIcon);
          // Find similar icons
          const similar = findSimilarIcons(foundIcon, icons, libraryId, 12);
          setSimilarIcons(similar);
        }
      } catch (err) {
        setError('Failed to load icon');
      } finally {
        setLoading(false);
      }
    };

    loadIcon();
  }, [libraryId, iconName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !icon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Icon Not Found</h1>
          <p className="text-muted-foreground">The requested icon could not be found.</p>
          <Button onClick={() => navigate('/')} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore All Icons
          </Button>
        </div>
      </div>
    );
  }

  const libraryName = iconLibraryManager.libraries.find(lib => lib.id === libraryId)?.name || libraryId;
  const pageTitle = `Download ${icon.name} SVG Icon - ${libraryName} | Iconstack`;
  const pageDescription = `Free ${icon.name} SVG icon from ${libraryName}. Download, copy, or customize this ${icon.style || 'icon'} for your project.`;

  const handleCopyIcon = async () => {
    if (!icon) return;
    try {
      await copyIcon(icon, customization.color, customization.strokeWidth);
      toast.success('Icon copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy icon:', err);
      toast.error('Failed to copy icon');
    }
  };

  const handleDownloadIcon = async () => {
    if (!icon) return;
    try {
      // Get SVG with customizations applied
      let svgString = typeof icon.svg === 'string' ? icon.svg : '<svg><!-- No SVG data --></svg>';
      
      // Apply customizations
      if (customization.strokeWidth !== 2) {
        svgString = svgString.replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`);
      }
      if (customization.color !== 'currentColor') {
        svgString = svgString.replace(/stroke="currentColor"/g, `stroke="${customization.color}"`);
        svgString = svgString.replace(/fill="currentColor"/g, `fill="${customization.color}"`);
        svgString = svgString.replace(/currentColor/g, customization.color);
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${icon.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Icon downloaded!');
    } catch (err) {
      console.error('Failed to download icon:', err);
      toast.error('Failed to download icon');
    }
  };

  const handleSimilarIconClick = (clickedIcon: IconItem) => {
    const iconNameSlug = clickedIcon.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/icon/${libraryId}/${iconNameSlug}`);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": icon.name,
    "description": `${icon.name} icon from ${libraryName} library`,
    "creator": {
      "@type": "Organization",
      "name": libraryName
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "downloadUrl": window.location.href,
    "keywords": [icon.name, libraryName, "SVG", "icon", "free", "download"],
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": libraryName,
          "item": `${window.location.origin}/library/${libraryId}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": icon.name
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header without search - matching homepage structure exactly */}
        <IconDetailHeader />

        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Main Content - Icon Display and Details (65% width) */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="gap-2 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <span>/</span>
                <span 
                  className="hover:text-foreground cursor-pointer"
                  onClick={() => navigate(`/library/${libraryId}`)}
                >
                  {libraryName}
                </span>
                <span>/</span>
                <span className="text-foreground font-medium">{icon?.name}</span>
              </div>

              {/* Large Icon Display */}
              <div className="flex items-center justify-center py-12">
                <div 
                  className="flex items-center justify-center"
                  style={{
                    color: customization.color,
                    strokeWidth: customization.strokeWidth
                  }}
                >
                  {typeof icon.svg === 'string' ? (
                    <div 
                      className="w-64 h-64"
                      style={{ 
                        color: customization.color,
                        strokeWidth: customization.strokeWidth 
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: icon.svg
                          .replace(/stroke-width="[^"]*"/g, `stroke-width="${customization.strokeWidth}"`)
                          .replace(/stroke="currentColor"/g, `stroke="${customization.color}"`)
                          .replace(/fill="currentColor"/g, `fill="${customization.color}"`)
                          .replace(/currentColor/g, customization.color)
                      }}
                    />
                  ) : (
                    <icon.svg 
                      className="w-64 h-64" 
                      style={{ 
                        color: customization.color,
                        strokeWidth: customization.strokeWidth 
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Icon Information Card */}
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">{icon.name}</h1>
                    <p className="text-muted-foreground">
                      From {libraryName} • {icon.style ? `${icon.style} style` : 'Vector icon'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyIcon}
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy SVG
                    </Button>
                    <Button
                      onClick={handleDownloadIcon}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download SVG
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{libraryName}</Badge>
                  {icon.style && <Badge variant="outline">{icon.style}</Badge>}
                  {icon.category && <Badge variant="outline">{icon.category}</Badge>}
                  {icon.tags?.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2 font-medium">SVG</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-2 font-mono text-xs">{icon.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Library:</span>
                    <span className="ml-2 font-medium">{libraryName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License:</span>
                    <span className="ml-2 font-medium">Free to use</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Sidebar (35% width) - Matching ControlPanel exactly */}
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
                  
                  {supportsStrokeWidth(icon) && (
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
                <div className="space-y-2">
                  <Button
                    onClick={handleCopyIcon}
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy SVG
                  </Button>
                  <Button
                    onClick={handleDownloadIcon}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download SVG
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Explore All Icons
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Icons Section - Full width with border separator following homepage grid structure */}
        {similarIcons.length > 0 && (
          <div className="border-t bg-background">
            <div className="container mx-auto px-6 py-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Similar Icons</h3>
                <p className="text-muted-foreground text-sm">
                  Other icons from {libraryName} that might interest you
                </p>
              </div>
              <IconGrid 
                items={similarIcons}
                onIconClick={handleSimilarIconClick}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                ariaLabel={`Similar icons to ${icon.name}`}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IconDetailPage;