import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sanityImageUrl } from "@/services/SanityClient";
import type { BlogPostSummary } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostSummary;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const imageUrl = post.coverImage?.asset?._ref
    ? sanityImageUrl(post.coverImage.asset._ref, 600)
    : null;

  return (
    <Link to={`/blog/${post.slug.current}`} className="group block">
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={imageUrl}
              alt={post.coverImage?.alt || post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.categories?.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
