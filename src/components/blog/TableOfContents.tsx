import React from "react";

interface TocItem {
  text: string;
  id: string;
  level: number;
}

interface TableOfContentsProps {
  body: any[];
}

function extractHeadings(blocks: any[]): TocItem[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === "block" && /^h[2-3]$/.test(b.style))
    .map((b) => {
      const text = b.children?.map((c: any) => c.text).join("") || "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const level = parseInt(b.style.replace("h", ""), 10);
      return { text, id, level };
    });
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ body }) => {
  const headings = extractHeadings(body);

  if (headings.length < 2) return null;

  return (
    <nav className="rounded-lg border border-border/50 bg-muted/30 p-5" aria-label="Table of contents">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Contents
      </h2>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
