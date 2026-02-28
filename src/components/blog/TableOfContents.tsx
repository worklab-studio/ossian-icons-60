import React from "react";

interface TocItem {
  text: string;
  id: string;
  level: number;
}

interface TableOfContentsProps {
  body: any[];
  sidebar?: boolean;
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

export const TableOfContents: React.FC<TableOfContentsProps> = ({ body, sidebar = false }) => {
  const headings = extractHeadings(body);

  if (headings.length < 2) return null;

  return (
    <nav
      className={
        sidebar
          ? "border-l border-border/50 pl-4"
          : "rounded-xl border border-border/50 bg-muted/20 p-5"
      }
      aria-label="Table of contents"
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Contents
      </h2>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
            <a
              href={`#${h.id}`}
              className={`block text-muted-foreground transition-colors hover:text-foreground ${
                sidebar ? "text-xs leading-relaxed" : "text-sm"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
