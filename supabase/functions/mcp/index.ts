// Iconstack MCP server (Streamable HTTP transport).
//
// Lets MCP clients (Cursor, Claude Desktop, Windsurf, etc.) search the
// 51,000+ icon catalog and fetch raw SVGs without copy/paste.
//
// Endpoint: https://<project>.supabase.co/functions/v1/mcp
// No auth required (verify_jwt = false). CORS open.
//
// Clients consume this via the official `mcp-remote` proxy:
//   { "command": "npx", "args": ["-y", "mcp-remote", "<endpoint>"] }

import { Hono } from "npm:hono@4.6.14";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";

const PROJECT_ID = Deno.env.get("SUPABASE_PROJECT_ID")
  ?? Deno.env.get("VITE_SUPABASE_PROJECT_ID")
  ?? "sglpxftkuzsqdpdhftwv";

const FUNCTIONS_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1`;

const server = new McpServer({
  name: "iconstack",
  version: "1.0.0",
});

server.tool({
  name: "search_icons",
  description:
    "Search 51,000+ MIT-licensed icons across 21 libraries (Lucide, Phosphor, Tabler, Heroicons, Material, etc.). Returns icon ids, names, libraries, styles and tags. Use the returned id + library with get_icon_svg to fetch the actual SVG markup.",
  inputSchema: {
    type: "object",
    properties: {
      q: { type: "string", description: "Search query, 1–80 chars (e.g. 'user', 'arrow right', 'shopping bag')." },
      library: { type: "string", description: "Optional comma-separated library ids (e.g. 'lucide,phosphor')." },
      category: { type: "string", description: "Optional comma-separated categories (e.g. 'navigation')." },
      style: { type: "string", description: "Optional comma-separated styles (e.g. 'outline,filled')." },
      limit: { type: "integer", description: "Results to return (1–100, default 25).", minimum: 1, maximum: 100 },
      offset: { type: "integer", description: "Skip N results (0–1000, default 0).", minimum: 0, maximum: 1000 },
    },
    required: ["q"],
  },
  handler: async (input: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined || v === null || v === "") continue;
      params.set(k, String(v));
    }
    const res = await fetch(`${FUNCTIONS_BASE}/icon-search?${params.toString()}`);
    const text = await res.text();
    if (!res.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: `icon-search failed (${res.status}): ${text}` }],
      };
    }
    return { content: [{ type: "text", text }] };
  },
});

server.tool({
  name: "get_icon_svg",
  description:
    "Return the raw SVG markup for a specific icon. Use after search_icons to drop the SVG straight into code.",
  inputSchema: {
    type: "object",
    properties: {
      library: { type: "string", description: "Library id (e.g. 'lucide', 'phosphor', 'tabler')." },
      id: { type: "string", description: "Icon id from search_icons (e.g. 'lucide-user' or just 'user')." },
    },
    required: ["library", "id"],
  },
  handler: async (input: Record<string, unknown>) => {
    const library = String(input.library ?? "");
    const id = String(input.id ?? "");
    const params = new URLSearchParams({ library, id, format: "json" });
    const res = await fetch(`${FUNCTIONS_BASE}/icon-svg?${params.toString()}`);
    const text = await res.text();
    if (!res.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: `icon-svg failed (${res.status}): ${text}` }],
      };
    }
    return { content: [{ type: "text", text }] };
  },
});

const transport = new StreamableHttpTransport();
const httpHandler = transport.bind(server);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, mcp-session-id, mcp-protocol-version",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

const app = new Hono();

app.options("/*", (c) => new Response(null, { headers: corsHeaders }));

app.all("/*", async (c) => {
  const res = await httpHandler(c.req.raw);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
});

Deno.serve(app.fetch);
