import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPost, sanityImageUrl, isSanityConfigured } from "@/services/SanityClient";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import NotFound from "./NotFound";

function estimateReadTime(body: any[]): string {
  if (!body) return "1 min read";
  const text = body
    .filter((b) => b._type === "block")
    .map((b) => b.children?.map((c: any) => c.text).join("") || "")
    .join(" ");
  const mins = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  return `${mins} min read`;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug && isSanityConfigured(),
    staleTime: 5 * 60 * 1000,
  });

  if (!isSanityConfigured()) return <NotFound />;
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!post) return <NotFound />;

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const imageUrl = post.coverImage?.asset?._ref
    ? sanityImageUrl(post.coverImage.asset._ref, 1200)
    : undefined;
  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const readTime = estimateReadTime(post.body);
  const category = post.categories?.[0];

  const articleSchema = SchemaService.generateArticleSchema(post);
  const breadcrumbSchema = SchemaService.generateBreadcrumbSchema(`/blog/${slug}`, post.title);
  const combinedSchema = SchemaService.combineSchemas(
    [articleSchema, breadcrumbSchema].filter(Boolean) as any[]
  );

  return (
    <>
      <Helmet>
        <title>{`${title} | Iconstack Blog`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://iconstack.io/blog/${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:url" content={`https://iconstack.io/blog/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author} />
      </Helmet>
      <SchemaMarkup schema={combinedSchema} />

      <div className="min-h-screen bg-background">
        {/* Top nav */}
        <nav className="border-b border-border/40">
          <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Iconstack Blog
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="mx-auto max-w-3xl px-6 pb-8 pt-14 text-center">
          {/* Category & read time */}
          <div className="mb-4 flex items-center justify-center gap-2 text-sm">
            {category && (
              <>
                <span className="font-semibold uppercase tracking-widest text-primary text-xs">
                  {category}
                </span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            <span className="text-muted-foreground">{readTime}</span>
          </div>

          <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Author byline */}
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {(post.author || "I")[0].toUpperCase()}
            </div>
            <span className="font-medium text-foreground">{post.author || "Iconstack"}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>
        </header>

        {/* Cover image */}
        {imageUrl && (
          <div className="mx-auto max-w-4xl px-6 pb-10">
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="w-full rounded-xl"
            />
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-4xl px-6 pb-20">
          <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
            <article className="mx-auto max-w-[680px]">
              {/* Inline TOC for mobile */}
              <div className="mb-10 lg:hidden">
                <TableOfContents body={post.body} />
              </div>
              <PortableTextRenderer body={post.body} />
            </article>

            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <TableOfContents body={post.body} sidebar />
              </div>
            </aside>
          </div>

          {/* Footer */}
          <div className="mt-20 border-t border-border/40 pt-8 text-center">
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;
