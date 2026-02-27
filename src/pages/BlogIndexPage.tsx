import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getPosts, isSanityConfigured } from "@/services/SanityClient";
import { BlogCard } from "@/components/blog/BlogCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SchemaService } from "@/services/SchemaService";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BlogIndexPage: React.FC = () => {
  const configured = isSanityConfigured();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getPosts,
    enabled: configured,
    staleTime: 5 * 60 * 1000,
  });

  const schema = SchemaService.generateBlogListSchema(posts);

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
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Iconstack Blog</h1>
              <p className="text-sm text-muted-foreground">
                Guides, tips & resources for icons in web development
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          {!configured && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Blog Coming Soon</h2>
              <p className="text-sm text-muted-foreground">
                We're working on helpful guides about icons, SVGs, and UI design. Check back soon!
              </p>
            </div>
          )}

          {configured && isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          )}

          {configured && !isLoading && posts.length === 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default BlogIndexPage;
