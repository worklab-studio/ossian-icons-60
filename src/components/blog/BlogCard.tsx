import React from "react";
import { Link } from "react-router-dom";
import { sanityImageUrl } from "@/services/SanityClient";
import type { BlogPostSummary } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostSummary;
  featured?: boolean;
}

function estimateReadTime(excerpt: string): string {
  const words = excerpt?.split(/\s+/).length || 0;
  const mins = Math.max(1, Math.ceil(words / 40));
  return `${mins} min read`;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const imageUrl = post.coverImage?.asset?._ref
    ? sanityImageUrl(post.coverImage.asset._ref, featured ? 900 : 600)
    : null;

  const readTime = estimateReadTime(post.excerpt);
  const category = post.categories?.[0];

  if (featured) {
    return (
      <Link to={`/blog/${post.slug.current}`} className="group block">
        <div className="overflow-hidden rounded-xl bg-card transition-all duration-300 hover:shadow-xl md:grid md:grid-cols-2 md:gap-0">
          {/* Image */}
          <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[380px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={post.coverImage?.alt || post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-5xl text-muted-foreground/20">✦</span>
              </div>
            )}
          </div>
          {/* Content */}
          <div className="flex flex-col justify-center p-8 md:p-10">
            {category && (
              <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                {category}
              </span>
            )}
            <h2 className="mb-3 text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
              {post.title}
            </h2>
            <p className="mb-6 line-clamp-3 text-base leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{dateStr}</span>
              <span className="text-border">·</span>
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug.current}`} className="group block">
      <article className="transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-3xl text-muted-foreground/20">✦</span>
            </div>
          )}
        </div>
        {/* Content */}
        {category && (
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
            {category}
          </span>
        )}
        <h2 className="mb-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{dateStr}</span>
          <span className="text-border">·</span>
          <span>{readTime}</span>
        </div>
      </article>
    </Link>
  );
};
