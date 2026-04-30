// Public icon-search API. Loads a compact index of ~51k icons from the
// published site once per cold-start, then scores/filters in memory.
//
// GET /functions/v1/icon-search?q=user&library=lucide,phosphor&limit=10
//
// CORS: open (Access-Control-Allow-Origin: *). No auth required.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface IndexedIcon {
  id: string;
  n: string;          // name
  l: string;          // libraryId
  s: string;          // style
  c: string;          // category
  t: string[];        // tags
}

interface IconIndex {
  generatedAt: string;
  libraries: Record<string, { name: string; style: string }>;
  icons: IndexedIcon[];
}

const INDEX_URL = "https://iconstack.io/api/icons-index.json";
const PUBLIC_BASE = "https://iconstack.io";

let indexPromise: Promise<IconIndex> | null = null;

function loadIndex(): Promise<IconIndex> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const res = await fetch(INDEX_URL, {
        headers: { "Accept-Encoding": "gzip" },
      });
      if (!res.ok) {
        indexPromise = null;
        throw new Error(`Failed to load index (${res.status})`);
      }
      return await res.json() as IconIndex;
    })();
  }
  return indexPromise;
}

// Lightweight scoring — fast and good enough for ~50k items per query.
function score(icon: IndexedIcon, qLower: string, qWords: string[]): number {
  const name = icon.n.toLowerCase();
  if (name === qLower) return 1000;
  if (name.startsWith(qLower)) return 500;
  if (name.includes(qLower)) return 250;

  let s = 0;
  for (const w of qWords) {
    if (!w) continue;
    if (name.includes(w)) s += 50;
    for (const tag of icon.t) {
      if (tag.toLowerCase() === w) { s += 30; break; }
      if (tag.toLowerCase().includes(w)) { s += 10; break; }
    }
    if (icon.c && icon.c.toLowerCase().includes(w)) s += 5;
  }
  return s;
}

function parseList(v: string | null): string[] | null {
  if (!v) return null;
  const items = v.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return items.length ? items : null;
}

function clampInt(v: string | null, min: number, max: number, def: number): number {
  if (!v) return def;
  const n = parseInt(v, 10);
  if (isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed", code: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();

  if (!q) {
    return jsonResponse({ error: "Missing required query parameter `q`", code: "missing_q" }, 400);
  }
  if (q.length > 80) {
    return jsonResponse({ error: "`q` must be 80 characters or fewer", code: "q_too_long" }, 400);
  }

  const libraryFilter = parseList(url.searchParams.get("library"));
  const categoryFilter = parseList(url.searchParams.get("category"));
  const styleFilter = parseList(url.searchParams.get("style"));
  const limit = clampInt(url.searchParams.get("limit"), 1, 100, 25);
  const offset = clampInt(url.searchParams.get("offset"), 0, 1000, 0);

  let index: IconIndex;
  try {
    index = await loadIndex();
  } catch (err) {
    console.error("Index load failed:", err);
    return jsonResponse({ error: "Index temporarily unavailable", code: "index_unavailable" }, 503);
  }

  const qLower = q.toLowerCase();
  const qWords = qLower.split(/[\s\-_]+/).filter(Boolean);

  const scored: Array<{ icon: IndexedIcon; score: number }> = [];
  for (const icon of index.icons) {
    if (libraryFilter && !libraryFilter.includes(icon.l)) continue;
    if (categoryFilter && !categoryFilter.includes(icon.c.toLowerCase())) continue;
    if (styleFilter && !styleFilter.includes(icon.s.toLowerCase())) continue;
    const s = score(icon, qLower, qWords);
    if (s > 0) scored.push({ icon, score: s });
  }

  scored.sort((a, b) => b.score - a.score || a.icon.n.length - b.icon.n.length);

  const total = scored.length;
  const slice = scored.slice(offset, offset + limit);

  const results = slice.map(({ icon }) => {
    const libMeta = index.libraries[icon.l];
    const slug = icon.id.includes(":") ? icon.id.split(":")[1] : icon.id.replace(`${icon.l}-`, "");
    return {
      id: icon.id,
      name: icon.n,
      library: icon.l,
      libraryName: libMeta?.name ?? icon.l,
      category: icon.c || null,
      tags: icon.t,
      style: icon.s || libMeta?.style || null,
      url: `${PUBLIC_BASE}/icon/${icon.l}/${slug}`,
    };
  });

  return jsonResponse({
    query: q,
    total,
    limit,
    offset,
    results,
    indexGeneratedAt: index.generatedAt,
  });
});
