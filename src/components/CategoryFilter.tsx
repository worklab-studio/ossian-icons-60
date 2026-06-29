import React from "react";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Tag className="h-4 w-4 text-muted-foreground hidden sm:block" />
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
            selectedCategory === null
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
          )}
        >
          All
        </button>
        {categories.slice(0, 8).map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category === selectedCategory ? null : category)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border capitalize whitespace-nowrap",
              selectedCategory === category
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {category.replace(/[-_]/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}