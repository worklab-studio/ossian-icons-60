import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPosts, isSanityConfigured } from "@/services/SanityClient";
import { BlogCard } from "@/components/blog/BlogCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
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
        {/* Top nav */}
        <nav className="border-b border-border/40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Iconstack
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="pb-12 pt-16 text-center">
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Blog
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Guides, tips & resources for using icons in web development and design.
          </p>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-20">
          {/* Not configured */}
          {!configured && (
            <div className="flex flex-col items-center py-20 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/30" />
              <h2 className="mb-2 text-lg font-semibold text-foreground">Blog Coming Soon</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                We're working on helpful guides about icons, SVGs, and UI design. Check back soon!
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {configured && isLoading && (
            <div className="space-y-12">
              <Skeleton className="h-[360px] w-full rounded-xl" />
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[380px] rounded-xl" />
                <Skeleton className="h-[380px] rounded-xl" />
                <Skeleton className="h-[380px] rounded-xl" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {configured && !isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          )}

          {/* Posts */}
          {featuredPost && (
            <div className="space-y-12">
              {/* Featured post */}
              <BlogCard post={featuredPost} featured />

              {/* Post grid */}
              {restPosts.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
