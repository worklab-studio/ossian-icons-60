import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPost, sanityImageUrl, isSanityConfigured } from "@/services/SanityClient";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import { ArrowLeft } from "lucide-react";
import NotFound from "./NotFound";

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
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
            <Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-sm text-muted-foreground">Back to Blog</span>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-6 py-10">
          {/* Hero */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{dateStr}</span>
              {post.author && (
                <>
                  <span>·</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            )}
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="mb-10 w-full rounded-lg"
            />
          )}

          {/* TOC + Body */}
          <div className="mb-8">
            <TableOfContents body={post.body} />
          </div>

          <div className="max-w-none">
            <PortableTextRenderer body={post.body} />
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;
