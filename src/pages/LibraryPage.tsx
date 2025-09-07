import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import { ThemeToggle } from '@/components/theme-toggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { type IconItem } from '@/types/icon';
import { copyIcon } from '@/lib/copy';
import { toast } from 'sonner';

const LibraryPageContent = () => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customization } = useIconCustomization();

  // Get library metadata
  const libraryMetadata = iconLibraryManager.libraries.find(lib => lib.id === libraryId);

  useEffect(() => {
    if (!libraryId || !libraryMetadata) {
      setError('Library not found');
      setLoading(false);
      return;
    }

    const loadLibrary = async () => {
      try {
        setLoading(true);
        const libraryIcons = await iconLibraryManager.loadLibrary(libraryId);
        setIcons(libraryIcons);
      } catch (err) {
        console.error('Failed to load library:', err);
        setError('Failed to load library icons');
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [libraryId, libraryMetadata]);

  const handleCopy = async (icon: IconItem) => {
    try {
      await copyIcon(icon, customization.color, customization.strokeWidth);
      toast.success(`${icon.name} copied to clipboard!`);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy icon');
    }
  };

  // Redirect to 404 if library doesn't exist
  if (!libraryMetadata) {
    return <Navigate to="/404" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Iconstack</h1>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `${libraryMetadata.name} Icons - Iconstack`,
      "description": `Browse and copy ${libraryMetadata.count} ${libraryMetadata.style} icons from ${libraryMetadata.name}. ${libraryMetadata.description}`,
      "url": `https://iconstack.io/library/${libraryId}`,
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": libraryMetadata.name,
        "description": libraryMetadata.description,
        "applicationCategory": "Icon Library",
        "operatingSystem": "Web Browser"
      }
    };
  };

  return (
    <>
      <Helmet>
        <title>{libraryMetadata.name} Icons - {libraryMetadata.count} {libraryMetadata.style} icons | Iconstack</title>
        <meta 
          name="description" 
          content={`Browse and copy ${libraryMetadata.count} ${libraryMetadata.style} icons from ${libraryMetadata.name}. ${libraryMetadata.description} Free SVG icons for web development.`}
        />
        <meta name="keywords" content={`${libraryMetadata.name.toLowerCase()}, icons, svg, ${libraryMetadata.style}, web development, ui design, iconstack`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${libraryMetadata.name} Icons - ${libraryMetadata.count} ${libraryMetadata.style} icons | Iconstack`} />
        <meta property="og:description" content={`Browse and copy ${libraryMetadata.count} ${libraryMetadata.style} icons from ${libraryMetadata.name}. ${libraryMetadata.description}`} />
        <meta property="og:url" content={`https://iconstack.io/library/${libraryId}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${libraryMetadata.name} Icons - Iconstack`} />
        <meta name="twitter:description" content={`${libraryMetadata.count} ${libraryMetadata.style} icons from ${libraryMetadata.name}`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://iconstack.io/library/${libraryId}`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Iconstack</h1>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {/* Library Header */}
          <header className="mb-8 text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {libraryMetadata.name} Icons
            </h1>
            <p className="text-lg text-muted-foreground mb-1">
              {libraryMetadata.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {libraryMetadata.count.toLocaleString()} {libraryMetadata.style} icons
            </p>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {/* Icons Grid */}
          {!loading && icons.length > 0 && (
            <section aria-label={`${libraryMetadata.name} icons grid`}>
              <IconGrid
                items={icons}
                onCopy={handleCopy}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                libraryName={libraryMetadata.name}
                ariaLabel={`${libraryMetadata.name} icons collection`}
              />
            </section>
          )}

          {/* Empty State */}
          {!loading && icons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No icons found in this library.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const LibraryPage = () => {
  return (
    <IconCustomizationProvider>
      <LibraryPageContent />
    </IconCustomizationProvider>
  );
};

export default LibraryPage;