// Public icon-svg API. Returns the raw SVG markup for a given library + icon id.
//
//   GET /functions/v1/icon-svg?library=lucide&id=user
//   GET /functions/v1/icon-svg?library=lucide&id=user&format=svg     -> image/svg+xml
//   GET /functions/v1/icon-svg?library=lucide&id=user&format=json    -> { svg, ... }  (default)
//
// Lazy-loads per-library JSON maps (one file per library, ~0.1-6.5 MB) from the
// public site and caches them in module memory. Cold-start cost is bounded by
// the size of the *first* library queried, not the whole 45 MB corpus.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const PUBLIC_BASES = [
  "https://iconstack.io",
  "https://iconstack.lovable.app",
];

const KNOWN_LIBRARIES = new Set([
  "tabler", "feather", "solar", "phosphor", "bootstrap", "iconsax",
  "radix", "line", "pixelart", "hugeicon", "mingcute", "heroicons",
  "material", "fluent-ui", "lucide", "carbon", "iconamoon", "iconoir",
  "majesticon", "simple", "octicons",
]);

const cache = new Map<string, Promise<Record<string, string>>>();

function loadLibrary(lib: string): Promise<Record<string, string>> {
  let p = cache.get(lib);
  if (p) return p;
  p = (async () => {
    let lastErr: unknown = null;
    for (const base of PUBLIC_BASES) {
      try {
        const res = await fetch(`${base}/api/svg/${lib}.json`, {
          headers: { "Accept-Encoding": "gzip" },
        });
        if (res.ok) return await res.json() as Record<string, string>;
        lastErr = new Error(`${base}/api/svg/${lib}.json -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    cache.delete(lib);
    throw lastErr ?? new Error(`Failed to load library ${lib}`);
  })();
  cache.set(lib, p);
  return p;
}

function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      ...extra,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed", code: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const library = (url.searchParams.get("library") || "").trim().toLowerCase();
  let id = (url.searchParams.get("id") || "").trim();
  const format = (url.searchParams.get("format") || "json").trim().toLowerCase();

  if (!library) return jsonResponse({ error: "Missing required `library`", code: "missing_library" }, 400);
  if (!id) return jsonResponse({ error: "Missing required `id`", code: "missing_id" }, 400);
  if (!KNOWN_LIBRARIES.has(library)) {
    return jsonResponse({ error: `Unknown library "${library}"`, code: "unknown_library" }, 404);
  }

  // Accept both raw ids ("user") and prefixed ids ("lucide-user", "lucide:user")
  if (id.startsWith(`${library}-`)) id = id.slice(library.length + 1);
  else if (id.startsWith(`${library}:`)) id = id.slice(library.length + 1);

  let map: Record<string, string>;
  try {
    map = await loadLibrary(library);
  } catch (err) {
    console.error(`Failed to load ${library}:`, err);
    return jsonResponse({ error: "Library temporarily unavailable", code: "library_unavailable" }, 503);
  }

  const svg = map[id];
  if (!svg) {
    return jsonResponse({
      error: `Icon "${id}" not found in library "${library}"`,
      code: "not_found",
      hint: "Use the icon-search endpoint to discover valid ids.",
    }, 404);
  }

  if (format === "svg") {
    return new Response(svg, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return jsonResponse({
    library,
    id,
    fullId: `${library}-${id}`,
    svg,
    url: `https://iconstack.io/icon/${library}/${id}`,
  });
});
