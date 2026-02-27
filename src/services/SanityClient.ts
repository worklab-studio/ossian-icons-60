import { createClient } from "@sanity/client";
import type { BlogPost, BlogPostSummary } from "@/types/blog";

// These are public/publishable values — safe to store in code
const SANITY_PROJECT_ID = "YOUR_PROJECT_ID"; // Replace after creating your Sanity project
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
});

// Helper to build image URLs from Sanity image refs
export function sanityImageUrl(ref: string, width = 800): string {
  // ref format: image-<id>-<dimensions>-<format>
  const [, id, dimensions, format] = ref.split("-");
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}?w=${width}&auto=format`;
}

const POST_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  coverImage,
  author,
  categories
`;

const POST_FULL_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  body,
  publishedAt,
  coverImage,
  author,
  categories,
  seoTitle,
  seoDescription
`;

export async function getPosts(): Promise<BlogPostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`
  );
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const results = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${POST_FULL_FIELDS} }`,
    { slug }
  );
  return results || null;
}

export async function getPostsByCategory(category: string): Promise<BlogPostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post" && $category in categories] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`,
    { category }
  );
}

export async function getPostSlugs(): Promise<string[]> {
  const results = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "post"] { slug }`
  );
  return results.map((r) => r.slug.current);
}

export function isSanityConfigured(): boolean {
  return SANITY_PROJECT_ID !== "YOUR_PROJECT_ID";
}
