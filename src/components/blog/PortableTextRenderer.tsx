import React from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { sanityImageUrl } from "@/services/SanityClient";

function headingId(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("");
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 id={headingId(children)} className="mb-4 mt-12 text-2xl font-bold text-foreground scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={headingId(children)} className="mb-3 mt-10 text-xl font-semibold text-foreground scroll-mt-20">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-lg leading-[1.8] text-foreground/80">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-[3px] border-primary/50 pl-5 text-lg italic text-foreground/70">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 ml-6 list-disc space-y-2 text-lg leading-[1.8] text-foreground/80">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-5 ml-6 list-decimal space-y-2 text-lg leading-[1.8] text-foreground/80">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      const url = sanityImageUrl(value.asset._ref, 1200);
      return (
        <figure className="my-10">
          <img
            src={url}
            alt={value.alt || ""}
            className="w-full rounded-xl"
            loading="lazy"
          />
          {value.alt && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

interface PortableTextRendererProps {
  body: any[];
}

export const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({ body }) => {
  if (!body) return null;
  return (
    <div className="prose-custom">
      <PortableText value={body} components={components} />
    </div>
  );
};
