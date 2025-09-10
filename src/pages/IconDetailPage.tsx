import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconItem } from '@/types/icon';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const IconDetailPage = () => {
  const { libraryId, iconName } = useParams<{ libraryId: string; iconName: string }>();
  const navigate = useNavigate();
  const [icon, setIcon] = useState<IconItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      if (typeof icon.svg === 'string') {
        await navigator.clipboard.writeText(icon.svg);
      } else {
        // Handle React component SVGs if needed
        console.warn('React component SVG copying not implemented');
      }
    } catch (err) {
      console.error('Failed to copy icon:', err);
    }
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
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
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

          {/* Main Content */}
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Icon Display */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-8 bg-muted rounded-lg">
                  {typeof icon.svg === 'string' ? (
                    <div 
                      className="w-24 h-24 text-foreground"
                      dangerouslySetInnerHTML={{ __html: icon.svg }}
                    />
                  ) : (
                    <icon.svg className="w-24 h-24 text-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{icon.name}</h1>
                <p className="text-lg text-muted-foreground">
                  Free SVG icon from {libraryName} library
                </p>
                {icon.style && (
                  <p className="text-sm text-muted-foreground">
                    Style: {icon.style}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleCopyIcon} variant="default" size="lg">
                Copy SVG Code
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore All Icons
              </Button>
            </div>

            {/* Icon Info */}
            <div className="bg-muted/50 rounded-lg p-6 text-left">
              <h2 className="text-lg font-semibold mb-4">Icon Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Name:</span>
                  <span className="ml-2">{icon.name}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Library:</span>
                  <span className="ml-2">{libraryName}</span>
                </div>
                {icon.style && (
                  <div>
                    <span className="font-medium text-muted-foreground">Style:</span>
                    <span className="ml-2">{icon.style}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-muted-foreground">Format:</span>
                  <span className="ml-2">SVG</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">License:</span>
                  <span className="ml-2">Free to use</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">File Size:</span>
                  <span className="ml-2">Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IconDetailPage;