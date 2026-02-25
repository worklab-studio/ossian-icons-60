import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { CollectionService, type CategoryMatchResult } from '@/services/CollectionService';
import { SectionedIconGrid } from '@/components/icon-grid/SectionedIconGrid';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { ControlPanel } from '@/components/control-panel';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { type IconItem } from '@/types/icon';
import { getCategoryBySlug, SEO_CATEGORIES } from '@/data/seo-categories';
import { generateIconUrl } from '@/lib/url-helpers';

function CollectionPageContent() {
  const { category } = useParams<{ category: string }>();
  const [result, setResult] = useState<CategoryMatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const { customization } = useIconCustomization();

  const categoryData = useMemo(() => getCategoryBySlug(category || ''), [category]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    CollectionService.getIconsForCategory(category).then(data => {
      setResult(data);
      setLoading(false);
    });
  }, [category]);

  if (!categoryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  const seoTitle = `${categoryData.seoTitle} - Free SVG Download | Iconstack`;
  const seoDescription = result
    ? CollectionService.formatSeoDescription(categoryData.seoDescription, result.totalCount, result.libraryCount)
    : categoryData.seoDescription;

  const relatedCategories = categoryData.relatedCategories
    .map(slug => getCategoryBySlug(slug))
    .filter(Boolean);

  // Schema markup
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle,
    description: seoDescription,
    url: `https://iconstack.io/icons/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: result?.totalCount ?? 0,
    },
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={`https://iconstack.io/icons/${category}`} />
        <link rel="canonical" href={`https://iconstack.io/icons/${category}`} />
      </Helmet>
      <SchemaMarkup schema={schema} />

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Left info panel */}
        <aside className="w-64 border-r border-border flex-shrink-0 overflow-y-auto p-6 hidden lg:block">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
            ← Back to all icons
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {categoryData.title} Icons
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {seoDescription}
          </p>
          {result && (
            <div className="space-y-2 mb-6">
              <p className="text-sm"><span className="font-semibold text-foreground">{result.totalCount.toLocaleString()}</span> icons</p>
              <p className="text-sm"><span className="font-semibold text-foreground">{result.libraryCount}</span> libraries</p>
            </div>
          )}

          {/* Library links */}
          {result && result.sections.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Browse by Library</h2>
              <div className="space-y-1">
                {result.sections.map(s => (
                  <Link
                    key={s.libraryId}
                    to={`/icons/${category}/${s.libraryId}`}
                    className="flex justify-between text-sm text-foreground hover:text-primary py-1"
                  >
                    <span>{s.libraryName}</span>
                    <span className="text-muted-foreground">{s.icons.length}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related categories */}
          {relatedCategories.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Categories</h2>
              <div className="flex flex-wrap gap-2">
                {relatedCategories.map(rc => rc && (
                  <Link key={rc.slug} to={`/icons/${rc.slug}`}>
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
          {/* Mobile header */}
          <div className="lg:hidden p-4 border-b border-border">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 block">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-foreground">{categoryData.title} Icons</h1>
            {result && (
              <p className="text-sm text-muted-foreground">{result.totalCount.toLocaleString()} icons across {result.libraryCount} libraries</p>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : result && result.sections.length > 0 ? (
              <SectionedIconGrid
                sections={result.sections}
                selectedId={selectedIcon?.id}
                onIconClick={setSelectedIcon}
                color={customization.color}
                strokeWidth={customization.strokeWidth}
                ariaLabel={`${categoryData.title} icons grid`}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No icons found for this category.</p>
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

export default function CollectionPage() {
  return (
    <IconCustomizationProvider>
      <CollectionPageContent />
    </IconCustomizationProvider>
  );
}
