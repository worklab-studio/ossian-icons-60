import React from "react";
import { Link } from "react-router-dom";
import { sanityImageUrl } from "@/services/SanityClient";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPostSummary } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostSummary;
  featured?: boolean;
}

function estimateReadTime(excerpt: string): string {
  const words = excerpt?.split(/\s+/).length || 0;
  const mins = Math.max(1, Math.ceil(words / 40)); // rough estimate from excerpt
  return `${mins} min read`;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const imageUrl = post.coverImage?.asset?._ref
    ? sanityImageUrl(post.coverImage.asset._ref, featured ? 800 : 600)
    : null;

  const readTime = estimateReadTime(post.excerpt);

  if (featured) {
    return (
      <Link to={`/blog/${post.slug.current}`} className="group block">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 md:grid md:grid-cols-2">
          <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[320px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={post.coverImage?.alt || post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-4xl text-muted-foreground/30">✦</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {post.categories?.slice(0, 2).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
            <h2 className="mb-3 text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-2xl">
              {post.title}
            </h2>
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{dateStr}</span>
                <span>·</span>
                <span>{readTime}</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                Read
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug.current}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="aspect-[16/9] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-3xl text-muted-foreground/30">✦</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {post.categories?.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
          <h2 className="mb-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h2>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{dateStr}</span>
              <span>·</span>
              <span>{readTime}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 transition-all group-hover:text-muted-foreground group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
