import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPosts, isSanityConfigured } from "@/services/SanityClient";
import { BlogCard } from "@/components/blog/BlogCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BlogIndexPage: React.FC = () => {
  const configured = isSanityConfigured();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getPosts,
    enabled: configured,
    staleTime: 5 * 60 * 1000,
  });

  const schema = SchemaService.generateBlogListSchema(posts);
  const [featuredPost, ...restPosts] = posts;

  return (
    <>
      <Helmet>
        <title>Blog - Icon Design Tips & Resources | Iconstack</title>
        <meta
          name="description"
          content="Tips, tutorials, and guides on using icons in web development and design. Learn about icon libraries, SVG best practices, and UI design."
        />
        <link rel="canonical" href="https://iconstack.io/blog" />
      </Helmet>
      <SchemaMarkup schema={schema} />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <header className="border-b border-border/50 bg-background">
          <div className="mx-auto max-w-5xl px-6 pb-10 pt-8">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Iconstack
            </Link>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Blog
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Guides, tips & resources for using icons in web development and design.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          {/* Not configured */}
          {!configured && (
            <div className="flex flex-col items-center rounded-xl border border-border/50 bg-muted/20 px-8 py-16 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/40" />
              <h2 className="mb-2 text-lg font-semibold text-foreground">Blog Coming Soon</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                We're working on helpful guides about icons, SVGs, and UI design. Check back soon!
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {configured && isLoading && (
            <div className="space-y-8">
              <Skeleton className="h-[320px] w-full rounded-xl" />
              <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-[340px] rounded-xl" />
                <Skeleton className="h-[340px] rounded-xl" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {configured && !isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-border/50 bg-muted/20 px-8 py-16 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          )}

          {/* Posts */}
          {featuredPost && (
            <div className="space-y-8">
              <BlogCard post={featuredPost} featured />
              {restPosts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {restPosts.map((post) => (
                    <BlogCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default BlogIndexPage;
