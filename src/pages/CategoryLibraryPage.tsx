import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { CollectionService } from '@/services/CollectionService';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { ControlPanel } from '@/components/control-panel';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { type IconItem } from '@/types/icon';
import { getCategoryBySlug } from '@/data/seo-categories';
import { iconLibraryManager } from '@/services/IconLibraryManager';

function CategoryLibraryPageContent() {
  const { category, libraryId } = useParams<{ category: string; libraryId: string }>();
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryName, setLibraryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const { customization } = useIconCustomization();

  const categoryData = useMemo(() => getCategoryBySlug(category || ''), [category]);

  useEffect(() => {
    if (!category || !libraryId) return;
    setLoading(true);
    CollectionService.getIconsForCategoryAndLibrary(category, libraryId).then(result => {
      if (result) {
        setIcons(result.icons);
        setLibraryName(result.libraryName);
      }
      setLoading(false);
    });
  }, [category, libraryId]);

  if (!categoryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  const libMeta = iconLibraryManager.libraries.find(l => l.id === libraryId);
  const displayName = libraryName || libMeta?.name || libraryId;
  const seoTitle = `Best ${categoryData.title} Icons in ${displayName} - Free SVG Download | Iconstack`;
  const seoDescription = `Browse ${icons.length} free ${categoryData.title.toLowerCase()} SVG icons from ${displayName}. Download in SVG, PNG, or copy as code.`;

  const relatedCategories = categoryData.relatedCategories
    .map(slug => getCategoryBySlug(slug))
    .filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle,
    description: seoDescription,
    url: `https://iconstack.io/icons/${category}/${libraryId}`,
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={`https://iconstack.io/icons/${category}/${libraryId}`} />
        <link rel="canonical" href={`https://iconstack.io/icons/${category}/${libraryId}`} />
      </Helmet>
      <SchemaMarkup schema={schema} />

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Left info panel */}
        <aside className="w-64 border-r border-border flex-shrink-0 overflow-y-auto p-6 hidden lg:block">
          <Link to={`/icons/${category}`} className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
            ← All {categoryData.title} icons
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {categoryData.title} Icons
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            in <Link to={`/library/${libraryId}`} className="text-foreground hover:text-primary font-medium">{displayName}</Link>
          </p>
          
          {!loading && (
            <p className="text-sm mb-6">
              <span className="font-semibold text-foreground">{icons.length}</span> icons found
            </p>
          )}

          {/* Related categories in this library */}
          {relatedCategories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related in {displayName}</h2>
              <div className="flex flex-wrap gap-2">
                {relatedCategories.map(rc => rc && (
                  <Link key={rc.slug} to={`/icons/${rc.slug}/${libraryId}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                      {rc.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Center grid */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="lg:hidden p-4 border-b border-border">
            <Link to={`/icons/${category}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 block">
              ← All {categoryData.title} icons
            </Link>
            <h1 className="text-xl font-bold text-foreground">{categoryData.title} Icons in {displayName}</h1>
            {!loading && <p className="text-sm text-muted-foreground">{icons.length} icons</p>}
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : icons.length > 0 ? (
              <IconGrid
                items={icons}
                selectedId={selectedIcon?.id}
                onIconClick={setSelectedIcon}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                libraryName={displayName}
                ariaLabel={`${categoryData.title} icons in ${displayName}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No {categoryData.title.toLowerCase()} icons found in {displayName}.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right control panel */}
        <div className="w-72 border-l border-border flex-shrink-0 hidden lg:block">
          <ControlPanel selectedIcon={selectedIcon} />
        </div>
      </div>
    </>
  );
}

export default function CategoryLibraryPage() {
  return (
    <IconCustomizationProvider>
      <CategoryLibraryPageContent />
    </IconCustomizationProvider>
  );
}
