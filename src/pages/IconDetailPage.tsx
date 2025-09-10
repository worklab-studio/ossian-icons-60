import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconItem } from '@/types/icon';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { ColorPicker } from '@/components/color-picker';
import { StrokeSlider } from '@/components/stroke-slider';
import { useIconCustomization } from '@/contexts/IconCustomizationContext';
import { copyIcon } from '@/lib/copy';
import { findSimilarIcons } from '@/utils/similarIcons';
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <button 
              onClick={() => navigate(`/library/${libraryId}`)}
              className="hover:text-foreground transition-colors"
            >
              {libraryName}
            </button>
            <span className="mx-2">/</span>
            <span className="text-foreground">{icon.name}</span>
          </nav>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Icon Display & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Large Icon Display */}
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative p-12 bg-muted/30 rounded-2xl border border-border">
                    {typeof icon.svg === 'string' ? (
                      <div 
                        className="w-32 h-32 md:w-40 md:h-40"
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
                        className="w-32 h-32 md:w-40 md:h-40" 
                        style={{ 
                          color: customization.color,
                          strokeWidth: customization.strokeWidth 
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">{icon.name}</h1>
                  <p className="text-xl text-muted-foreground">
                    Free SVG icon from {libraryName} library
                  </p>
                  {icon.style && (
                    <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                      {icon.style}
                    </div>
                  )}
                </div>
              </div>

              {/* Geometric Divider */}
              <div className="border-t border-border"></div>

              {/* Icon Details */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Icon Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium text-muted-foreground">Name</span>
                      <span className="text-foreground">{icon.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium text-muted-foreground">Library</span>
                      <span className="text-foreground">{libraryName}</span>
                    </div>
                    {icon.style && (
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Style</span>
                        <span className="text-foreground">{icon.style}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium text-muted-foreground">Format</span>
                      <span className="text-foreground">SVG</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium text-muted-foreground">License</span>
                      <span className="text-foreground">Free to use</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium text-muted-foreground">File Size</span>
                      <span className="text-foreground">Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customization Panel */}
            <div className="space-y-8">
              <div className="sticky top-8">
                <div className="bg-muted/30 rounded-2xl border border-border p-6 space-y-8">
                  <h3 className="text-xl font-semibold text-foreground">Customize Icon</h3>
                  
                  {/* Geometric Divider */}
                  <div className="border-t border-border"></div>
                  
                  {/* Color Picker */}
                  <div>
                    <ColorPicker />
                  </div>

                  {/* Geometric Divider */}
                  <div className="border-t border-border"></div>

                  {/* Stroke Slider */}
                  <div>
                    <StrokeSlider />
                  </div>

                  {/* Geometric Divider */}
                  <div className="border-t border-border"></div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button 
                      onClick={handleCopyIcon} 
                      className="w-full" 
                      size="lg"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SVG Code
                    </Button>
                    <Button 
                      onClick={handleDownloadIcon} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download SVG
                    </Button>
                    <Button 
                      onClick={() => navigate('/')} 
                      variant="ghost" 
                      className="w-full" 
                      size="lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Explore All Icons
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Icons Section */}
          {similarIcons.length > 0 && (
            <>
              {/* Geometric Divider */}
              <div className="border-t border-border mb-12"></div>
              
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">Similar Icons</h2>
                  <p className="text-lg text-muted-foreground">
                    More icons from {libraryName} that might interest you
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {similarIcons.map((similarIcon) => (
                    <button
                      key={similarIcon.id}
                      onClick={() => handleSimilarIconClick(similarIcon)}
                      className="group p-6 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        {typeof similarIcon.svg === 'string' ? (
                          <div 
                            className="w-8 h-8 text-foreground group-hover:text-primary transition-colors"
                            dangerouslySetInnerHTML={{ __html: similarIcon.svg }}
                          />
                        ) : (
                          <similarIcon.svg className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center line-clamp-2">
                          {similarIcon.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default IconDetailPage;