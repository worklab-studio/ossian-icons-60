export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body: any[]; // Portable Text blocks
  publishedAt: string;
  coverImage?: SanityImage;
  author: string;
  categories: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface SanityImage {
  asset: {
    _ref: string;
    url?: string;
  };
  alt?: string;
}

export interface BlogPostSummary {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  coverImage?: SanityImage;
  author: string;
  categories: string[];
}
