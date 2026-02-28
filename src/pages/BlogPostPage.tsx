import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPost, sanityImageUrl, isSanityConfigured } from "@/services/SanityClient";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import { ArrowLeft, Clock, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
        {/* Header with breadcrumbs */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            <Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/blog">Blog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 max-w-[250px]">
                    {post.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Hero */}
        <div className="mx-auto max-w-4xl px-6 pt-10">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.author || "Iconstack"}
            </span>
            <span>·</span>
            <span>{dateStr}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Cover image */}
        {imageUrl && (
          <div className="mx-auto max-w-4xl px-6">
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="mb-10 w-full rounded-xl border border-border/30"
            />
          </div>
        )}

        {/* Content with sticky sidebar TOC */}
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-10">
            <article className="max-w-none leading-relaxed">
              {/* Inline TOC for mobile */}
              <div className="mb-8 lg:hidden">
                <TableOfContents body={post.body} />
              </div>
              <PortableTextRenderer body={post.body} />
            </article>

            {/* Sticky sidebar TOC for desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <TableOfContents body={post.body} sidebar />
              </div>
            </aside>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 border-t border-border/50 pt-8 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;
