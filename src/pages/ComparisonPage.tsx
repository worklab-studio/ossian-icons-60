import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { CollectionService, type ComparisonData } from '@/services/CollectionService';
import { IconGrid } from '@/components/icon-grid/IconGrid';
import { IconCustomizationProvider, useIconCustomization } from '@/contexts/IconCustomizationContext';
import { ControlPanel } from '@/components/control-panel';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type IconItem } from '@/types/icon';

function ComparisonPageContent() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const { customization } = useIconCustomization();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const parsed = CollectionService.parseComparisonSlug(slug);
    if (!parsed) {
      setError('Invalid comparison URL.');
      setLoading(false);
      return;
    }
    CollectionService.getComparisonData(parsed.libraryIdA, parsed.libraryIdB).then(result => {
      if (!result) {
        setError('Libraries not found.');
      }
      setData(result);
      setLoading(false);
    });
  }, [slug]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const nameA = data.libraryA.name;
  const nameB = data.libraryB.name;
  const seoTitle = `${nameA} vs ${nameB} Icons - Which SVG Icon Library is Better? | Iconstack`;
  const seoDescription = `Compare ${nameA} (${data.totalA.toLocaleString()} icons) vs ${nameB} (${data.totalB.toLocaleString()} icons). See shared icons, unique strengths, and style differences side by side.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seoTitle,
    description: seoDescription,
    url: `https://iconstack.io/compare/${slug}`,
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={`https://iconstack.io/compare/${slug}`} />
        <link rel="canonical" href={`https://iconstack.io/compare/${slug}`} />
      </Helmet>
      <SchemaMarkup schema={schema} />

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Left summary panel */}
        <aside className="w-72 border-r border-border flex-shrink-0 overflow-y-auto p-6 hidden lg:block">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
            ← Back to all icons
          </Link>
          <h1 className="text-xl font-bold text-foreground mb-4">
            {nameA} vs {nameB}
          </h1>

          {/* Stats cards */}
          <div className="space-y-3 mb-6">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  <Link to={`/library/${data.libraryA.id}`} className="hover:text-primary">{nameA}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-2xl font-bold text-foreground">{data.totalA.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">icons · {data.libraryA.style}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  <Link to={`/library/${data.libraryB.id}`} className="hover:text-primary">{nameB}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-2xl font-bold text-foreground">{data.totalB.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">icons · {data.libraryB.style}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Overlap</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-2xl font-bold text-foreground">{data.overlapPercentage}%</p>
                <p className="text-xs text-muted-foreground">{data.sharedIconNames.length} shared icon names</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-foreground">{data.uniqueToA.toLocaleString()}</span> <span className="text-muted-foreground">unique to {nameA}</span></p>
            <p><span className="font-medium text-foreground">{data.uniqueToB.toLocaleString()}</span> <span className="text-muted-foreground">unique to {nameB}</span></p>
          </div>
        </aside>

        {/* Center content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile header */}
          <div className="lg:hidden p-4 border-b border-border">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 block">← Back</Link>
            <h1 className="text-xl font-bold text-foreground">{nameA} vs {nameB}</h1>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{data.totalA.toLocaleString()} vs {data.totalB.toLocaleString()} icons</span>
              <span>{data.overlapPercentage}% overlap</span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Shared icons */}
            {data.sampleShared.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Shared Icons
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {data.sharedIconNames.length} icons appear in both libraries
                </p>
                <IconGrid
                  items={data.sampleShared}
                  selectedId={selectedIcon?.id}
                  onIconClick={setSelectedIcon}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName={nameA}
                  ariaLabel="Shared icons"
                />
              </section>
            )}

            {/* Unique to A */}
            {data.sampleUniqueA.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Unique to {nameA}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {data.uniqueToA.toLocaleString()} icons only in {nameA}
                </p>
                <IconGrid
                  items={data.sampleUniqueA}
                  selectedId={selectedIcon?.id}
                  onIconClick={setSelectedIcon}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName={nameA}
                  ariaLabel={`Icons unique to ${nameA}`}
                />
              </section>
            )}

            {/* Unique to B */}
            {data.sampleUniqueB.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Unique to {nameB}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {data.uniqueToB.toLocaleString()} icons only in {nameB}
                </p>
                <IconGrid
                  items={data.sampleUniqueB}
                  selectedId={selectedIcon?.id}
                  onIconClick={setSelectedIcon}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName={nameB}
                  ariaLabel={`Icons unique to ${nameB}`}
                />
              </section>
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

export default function ComparisonPage() {
  return (
    <IconCustomizationProvider>
      <ComparisonPageContent />
    </IconCustomizationProvider>
  );
}
