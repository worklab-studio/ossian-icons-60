import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { type IconItem } from '@/types/icon';
import { copyIcon } from '@/lib/copy';
import { toast } from 'sonner';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { useSchemaMarkup } from '@/hooks/useSchemaMarkup';
import { RotatingFooter } from '@/components/RotatingFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateIconUrl } from '@/lib/url-helpers';
import { Home, ArrowLeft } from 'lucide-react';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

const LibraryPageContent = () => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customization } = useIconCustomization();

  const libraryMetadata = iconLibraryManager.libraries.find(lib => lib.id === libraryId);

  const { schemaMarkup } = useSchemaMarkup({
    icons,
    libraryId: libraryId || '',
    includeFAQ: false
  });

  useEffect(() => {
    if (!libraryId || !libraryMetadata) {
      setError(libraryId ? `Library "${libraryId}" not found` : 'No library ID provided');
      setLoading(false);
      return;
    }

    const loadLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const libraryIcons = await iconLibraryManager.loadLibrary(libraryId);
        setIcons(libraryIcons);
      } catch (err) {
        setError(`Failed to load library: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    } catch {
      toast.error('Failed to copy icon');
    }
  };

  const handleIconClick = (icon: IconItem) => {
    if (libraryId) {
      navigate(generateIconUrl(libraryId, icon.name));
    }
  };

  // Other libraries to explore
  const otherLibraries = iconLibraryManager.libraries
    .filter(lib => lib.id !== libraryId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  if (error || !libraryMetadata) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Iconstack</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Library Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || `Library "${libraryId}" not found`}</p>
            <Link to="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {libraryMetadata && (
        <>
          <SchemaMarkup schema={schemaMarkup} />
          <Helmet>
            <title>{`${libraryMetadata.name} Icons - ${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} icons | Iconstack`}</title>
            <meta name="description" content={`Browse and copy ${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} icons from ${libraryMetadata.name}. ${libraryMetadata.description || ''} Free SVG icons.`} />
            <meta property="og:title" content={`${libraryMetadata.name} Icons | Iconstack`} />
            <meta property="og:description" content={`${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} icons from ${libraryMetadata.name}`} />
            <meta property="og:url" content={`https://iconstack.io/library/${libraryId}`} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="canonical" href={`https://iconstack.io/library/${encodeURIComponent(libraryId || '')}`} />
            <meta name="robots" content="index, follow" />
          </Helmet>
        </>
      )}

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <span className="text-xl font-bold">Iconstack</span>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-3 border-b border-border/30">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/"><Home className="h-4 w-4" /></Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{libraryMetadata?.name || libraryId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Library Header */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <header className="text-center animate-fade-in">
            <h1 className={`font-bold text-foreground mb-2 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              {libraryMetadata?.name} Icons
            </h1>
            {libraryMetadata?.description && (
              <p className={`text-muted-foreground mb-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                {libraryMetadata.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {libraryMetadata?.count?.toLocaleString()} {libraryMetadata?.style} icons
            </p>
          </header>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4">
          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {!loading && icons.length > 0 && (
            <section aria-label={`${libraryMetadata?.name} icons grid`} className="h-[calc(100vh-280px)]">
              <IconGrid
                items={icons}
                onCopy={handleCopy}
                onIconClick={handleIconClick}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                libraryName={libraryMetadata?.name}
                ariaLabel={`${libraryMetadata?.name} icons collection`}
              />
            </section>
          )}

          {!loading && icons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No icons found in this library.</p>
            </div>
          )}
        </div>

        {/* Explore Other Libraries */}
        {!loading && otherLibraries.length > 0 && (
          <div className="container mx-auto px-4 py-8 border-t border-border/30">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">EXPLORE OTHER LIBRARIES</h2>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {otherLibraries.map(lib => (
                <Link
                  key={lib.id}
                  to={`/library/${lib.id}`}
                  className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="text-sm font-medium">{lib.name}</div>
                  <div className="text-xs text-muted-foreground">{lib.count.toLocaleString()} {lib.style} icons</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <RotatingFooter />
      </div>
    </>
  );
};

const LibraryPage = () => (
  <IconCustomizationProvider>
    <LibraryPageContent />
  </IconCustomizationProvider>
);

export default LibraryPage;
