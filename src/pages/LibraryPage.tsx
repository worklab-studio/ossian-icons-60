import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { iconLibraryManager } from '@/services/IconLibraryManager';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import { type IconItem } from '@/types/icon';
import { copyIcon } from '@/lib/copy';
import { toast } from 'sonner';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { useSchemaMarkup } from '@/hooks/useSchemaMarkup';
import { RotatingFooter } from '@/components/RotatingFooter';
import { LibraryFAQ } from '@/components/LibraryFAQ';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateIconUrl } from '@/lib/url-helpers';
import { ArrowLeft } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { ControlPanel } from '@/components/control-panel';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileCustomizeSheet } from '@/components/mobile/MobileCustomizeSheet';
import { MobileIconActions } from '@/components/mobile/MobileIconActions';
import { sortIconsByStyleThenName } from '@/lib/icon-utils';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { showFirstCopyNudge } from '@/components/ui/first-copy-nudge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconstackLogo } from '@/components/iconstack-logo';
import LoadingSpinner from '@/components/LoadingSpinner';

const LibraryPageContent = () => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customization } = useIconCustomization();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mobile state
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);
  const [showIconActions, setShowIconActions] = useState(false);

  const libraryMetadata = iconLibraryManager.libraries.find(lib => lib.id === libraryId);

  const { schemaMarkup } = useSchemaMarkup({
    icons,
    libraryId: libraryId || '',
    includeFAQ: false,
    libraryName: libraryMetadata?.name,
    libraryCount: libraryMetadata?.count,
    libraryStyle: libraryMetadata?.style,
  });

  const { isFirstCopy, markFirstCopyComplete, getKeyboardShortcut } = useFirstTimeUser();

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

  // Filter & sort icons
  const currentIcons = useMemo(() => {
    if (!searchQuery.trim()) return icons;
    const q = searchQuery.toLowerCase();
    return icons.filter(icon =>
      icon.name.toLowerCase().includes(q) ||
      icon.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [icons, searchQuery]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    currentIcons.forEach(icon => {
      if (icon.category) categories.add(icon.category);
    });
    return Array.from(categories).sort();
  }, [currentIcons]);

  const displayedIcons = useMemo(() => {
    let filtered = currentIcons;
    if (selectedCategory) {
      filtered = filtered.filter(icon => icon.category === selectedCategory);
    }
    return sortIconsByStyleThenName(filtered);
  }, [currentIcons, selectedCategory]);

  const selectedIcon = useMemo(() => {
    if (!selectedId) return null;
    return icons.find(icon => icon.id === selectedId) || null;
  }, [selectedId, icons]);

  const handleCopy = async (icon: IconItem) => {
    try {
      await copyIcon(icon, customization.color, customization.strokeWidth);
      setSelectedId(icon.id);
      if (isFirstCopy) {
        showFirstCopyNudge({ keyboardShortcut: getKeyboardShortcut() });
        markFirstCopyComplete();
      } else {
        toast.success(`${icon.name} copied to clipboard!`);
      }
    } catch {
      toast.error('Failed to copy icon');
    }
  };

  const handleIconClick = (icon: IconItem) => {
    if (isMobile) {
      setSelectedId(icon.id);
      setShowIconActions(true);
    } else {
      setSelectedId(prevId => prevId === icon.id ? null : icon.id);
    }
  };

  // Error / not found state
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

  // SEO head
  const seoHead = (
    <>
      <SchemaMarkup schema={schemaMarkup} />
      <Helmet>
        <title>{`${libraryMetadata.name} Icons - ${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} icons | Iconstack`}</title>
        <meta name="description" content={`Browse the complete list of ${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} ${libraryMetadata.name} icons. ${libraryMetadata.description || ''} Free, MIT-licensed SVG icons — search, customize, and copy.`} />
        <meta property="og:title" content={`${libraryMetadata.name} Icons | Iconstack`} />
        <meta property="og:description" content={`${libraryMetadata.count ?? ''} ${libraryMetadata.style ?? ''} icons from ${libraryMetadata.name}`} />
        <meta property="og:url" content={`https://iconstack.io/library/${libraryId}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`https://iconstack.io/og/${libraryId}.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://iconstack.io/og/${libraryId}.png`} />
        <link rel="canonical" href={`https://iconstack.io/library/${encodeURIComponent(libraryId || '')}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
    </>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <>
        {seoHead}
        <div className="flex flex-col h-screen w-full">
          <div className="fixed top-0 left-0 right-0 z-50 bg-background">
            <MobileHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery('')}
              onCustomizeClick={() => setShowCustomizeSheet(true)}
              onLibraryClick={() => navigate('/')}
            />
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg font-semibold">{libraryMetadata.name} Icons</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? `${displayedIcons.length.toLocaleString()} results`
                  : `${displayedIcons.length.toLocaleString()} icons`}
              </p>
            </div>
          </div>

          <main className="flex-1 overflow-auto pt-32">
            {loading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading icons...</p>
                </div>
              </div>
            ) : displayedIcons.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-center px-6">
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    {searchQuery ? 'No icons found' : 'No icons available'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try a different search term' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <IconGrid
                items={displayedIcons}
                selectedId={selectedId}
                onCopy={handleCopy}
                onIconClick={handleIconClick}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                libraryName={libraryMetadata.name}
              />
            )}
            <div className="px-4 pb-4">
              <LibraryFAQ
                libraryName={libraryMetadata.name}
                iconCount={libraryMetadata.count ?? 0}
                style={libraryMetadata.style}
              />
            </div>
          </main>
        </div>

        <MobileCustomizeSheet
          isOpen={showCustomizeSheet}
          onClose={() => setShowCustomizeSheet(false)}
        />
        <MobileIconActions
          isOpen={showIconActions}
          onClose={() => setShowIconActions(false)}
          selectedIcon={selectedIcon}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      {seoHead}
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          {/* Left panel - Library Info (replaces AppSidebar) */}
          <div className="w-60 border-r bg-background flex flex-col shrink-0">
            <div className="h-16 flex items-center gap-2 px-4 border-b">
              <Link to="/" className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors">
                <IconstackLogo className="h-5 w-5 text-primary" />
                <span className="font-bold text-base">Iconstack</span>
              </Link>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to all icons
                </Link>

                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-foreground">{libraryMetadata.name}</h1>
                  {libraryMetadata.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {libraryMetadata.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{libraryMetadata.count?.toLocaleString()} icons</span>
                    {libraryMetadata.style && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{libraryMetadata.style}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    Browse the complete list of {libraryMetadata.count?.toLocaleString()} {libraryMetadata.name} icons below. Search to find specific icons or filter by category.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Center - Header + Sub-header + Grid */}
          <div className="flex-1 flex flex-col h-screen">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery('')}
            />

            {/* Sub-header */}
            <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-background">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{libraryMetadata.name} Icons</h2>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `${displayedIcons.length.toLocaleString()} icons matching "${searchQuery}"${selectedCategory ? ` in ${selectedCategory}` : ''}`
                      : `${displayedIcons.length.toLocaleString()} icons${selectedCategory ? ` in ${selectedCategory}` : ''}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <CategoryFilter
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
              </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading icons...</p>
                  </div>
                </div>
              ) : displayedIcons.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-center px-6">
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">
                      {searchQuery ? 'No icons found' : 'No icons available'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <IconGrid
                  items={displayedIcons}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName={libraryMetadata.name}
                />
              )}
            </main>

            <LibraryFAQ
              libraryName={libraryMetadata.name}
              iconCount={libraryMetadata.count ?? 0}
              style={libraryMetadata.style}
            />
            <RotatingFooter />
          </div>

          {/* Right - Control Panel */}
          <ControlPanel selectedIcon={selectedIcon} selectedSet={libraryId || ''} />
        </div>
      </SidebarProvider>
    </>
  );
};

const LibraryPage = () => (
  <IconCustomizationProvider>
    <LibraryPageContent />
  </IconCustomizationProvider>
);

export default LibraryPage;
