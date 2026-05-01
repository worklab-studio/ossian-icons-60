#!/usr/bin/env node
/**
 * iconstack-mcp — Model Context Protocol server for Iconstack.
 *
 * Exposes three tools:
 *   - search_icons(query, library?, style?, limit?)
 *   - get_icon_svg(library, id)
 *   - list_libraries()
 *
 * Backed by the public Iconstack API (no auth required).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE =
  process.env.ICONSTACK_API_BASE ??
  "https://sglpxftkuzsqdpdhftwv.supabase.co/functions/v1";

const ANON_KEY =
  process.env.ICONSTACK_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbHB4ZnRrdXpzcWRwZGhmdHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTgyMzQsImV4cCI6MjA5MjczNDIzNH0.qRKe4o2wFmD2yV8GLcsQhSwQkv2-UDWCoeoQEIT-N-M";

const KNOWN_LIBRARIES = [
  { id: "tabler", name: "Tabler", style: "outline" },
  { id: "feather", name: "Feather", style: "outline" },
  { id: "solar", name: "Solar", style: "outline" },
  { id: "phosphor", name: "Phosphor", style: "mixed" },
  { id: "bootstrap", name: "Bootstrap", style: "mixed" },
  { id: "iconsax", name: "Iconsax", style: "twotone" },
  { id: "radix", name: "Radix", style: "outline" },
  { id: "line", name: "Line", style: "outline" },
  { id: "pixelart", name: "Pixel Art", style: "pixel" },
  { id: "hugeicon", name: "Huge Icons", style: "outline" },
  { id: "mingcute", name: "Mingcute", style: "mixed" },
  { id: "heroicons", name: "Heroicons", style: "mixed" },
  { id: "material", name: "Material Design", style: "outline" },
  { id: "fluent-ui", name: "Fluent UI", style: "mixed" },
  { id: "lucide", name: "Lucide", style: "outline" },
  { id: "carbon", name: "Carbon", style: "mixed" },
  { id: "iconamoon", name: "Iconamoon", style: "outline" },
  { id: "iconoir", name: "Iconoir", style: "mixed" },
  { id: "majesticon", name: "Majesticon", style: "outline" },
  { id: "simple", name: "Simple Icons (Brands)", style: "brand" },
  { id: "octicons", name: "Octicons", style: "outline" },
];

async function callApi(path: string, params: Record<string, string | undefined>) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Iconstack API returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const err = json as { error?: string; code?: string };
    throw new Error(`Iconstack API ${res.status}: ${err.error ?? "unknown error"}`);
  }
  return json;
}

const server = new Server(
  { name: "iconstack-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_icons",
      description:
        "Search 51,000+ icons across 21 popular libraries (Lucide, Phosphor, Tabler, Material, Heroicons, Simple Icons, etc.). Returns ranked matches with name, library, tags, and a URL to the icon detail page. Use this BEFORE calling get_icon_svg so you know which exact `library` + `id` to fetch.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for. Plain words like 'user', 'shopping cart', 'arrow left', 'github logo'.",
          },
          library: {
            type: "string",
            description: "Optional comma-separated library ids to restrict to (e.g. 'lucide,phosphor'). See list_libraries.",
          },
          style: {
            type: "string",
            description: "Optional comma-separated styles to filter (e.g. 'outline', 'fill', 'twotone', 'brand').",
          },
          limit: {
            type: "number",
            description: "Max results to return. Default 10, max 100.",
            minimum: 1,
            maximum: 100,
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_icon_svg",
      description:
        "Fetch the raw SVG markup for a specific icon by library + id. Use search_icons first to discover the correct ids. Returns the SVG string ready to drop into JSX, HTML, or a file.",
      inputSchema: {
        type: "object",
        properties: {
          library: {
            type: "string",
            description: "Library id (e.g. 'lucide', 'phosphor', 'tabler'). See list_libraries.",
          },
          id: {
            type: "string",
            description: "Icon id within the library. Accepts either bare id ('user') or prefixed id ('lucide-user').",
          },
        },
        required: ["library", "id"],
      },
    },
    {
      name: "list_libraries",
      description:
        "List the 21 supported icon libraries with their ids and dominant style. Use this to pick a `library` filter for search_icons or to know valid library ids for get_icon_svg.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (name === "search_icons") {
      const a = args as {
        query: string;
        library?: string;
        style?: string;
        limit?: number;
      };
      if (!a.query || typeof a.query !== "string") {
        throw new Error("`query` is required and must be a string");
      }
      const data = (await callApi("/icon-search", {
        q: a.query,
        library: a.library,
        style: a.style,
        limit: String(a.limit ?? 10),
      })) as {
        total: number;
        results: Array<{
          id: string;
          name: string;
          library: string;
          libraryName: string;
          tags: string[];
          style: string | null;
          url: string;
        }>;
      };
      const lines = [
        `Found ${data.total} matches (showing ${data.results.length}):`,
        "",
        ...data.results.map(
          (r, i) =>
            `${i + 1}. ${r.name}  [library: ${r.library} | id: ${r.id.replace(`${r.library}-`, "")} | style: ${r.style ?? "?"}]\n   tags: ${(r.tags ?? []).slice(0, 8).join(", ")}\n   page: ${r.url}`
        ),
        "",
        "Next: call get_icon_svg with `library` + `id` from the line above.",
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    if (name === "get_icon_svg") {
      const a = args as { library: string; id: string };
      if (!a.library || !a.id) throw new Error("`library` and `id` are both required");
      const data = (await callApi("/icon-svg", {
        library: a.library,
        id: a.id,
      })) as { library: string; id: string; svg: string; url: string };
      return {
        content: [
          {
            type: "text",
            text: `Icon: ${data.library}/${data.id}\nDetail: ${data.url}\n\n\`\`\`svg\n${data.svg}\n\`\`\``,
          },
        ],
      };
    }

    if (name === "list_libraries") {
      const lines = [
        "Supported libraries:",
        "",
        ...KNOWN_LIBRARIES.map(
          (l) => `- ${l.id.padEnd(12)} ${l.name} (${l.style})`
        ),
        "",
        "Use any `id` value as the `library` parameter.",
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${message}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
// Tiny stderr ping so editors show "connected" cleanly.
process.stderr.write("[iconstack-mcp] ready\n");
