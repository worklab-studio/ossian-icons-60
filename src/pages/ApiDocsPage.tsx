import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { IconstackLogo } from '@/components/iconstack-logo';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const FUNCTION_URL =
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/icon-search`;

const PARAMS: { name: string; type: string; required?: boolean; desc: string; example: string }[] = [
  { name: 'q', type: 'string', required: true, desc: 'Search query (1–80 chars).', example: 'user' },
  { name: 'library', type: 'string', desc: 'Comma-separated library ids to filter by.', example: 'lucide,phosphor' },
  { name: 'category', type: 'string', desc: 'Comma-separated categories to filter by.', example: 'navigation' },
  { name: 'style', type: 'string', desc: 'Comma-separated styles (e.g. outline, filled).', example: 'outline' },
  { name: 'limit', type: 'integer', desc: 'Results to return (1–100, default 25).', example: '10' },
  { name: 'offset', type: 'integer', desc: 'Skip N results (0–1000, default 0).', example: '0' },
];

const CodeBlock: React.FC<{ children: string; lang?: string }> = ({ children, lang }) => {
  const { toast } = useToast();
  return (
    <div className="relative group">
      <pre className="bg-muted/50 border rounded-lg p-4 text-sm overflow-x-auto font-mono">
        <code>{children}</code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(children);
          toast({ description: 'Copied to clipboard', duration: 1500 });
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded bg-background border"
        aria-label={`Copy ${lang ?? ''} example`}
      >
        Copy
      </button>
    </div>
  );
};

const ApiDocsPage: React.FC = () => {
  const [tryQuery, setTryQuery] = useState('user');
  const [tryLibrary, setTryLibrary] = useState('');
  const [tryResult, setTryResult] = useState<string>('');
  const [tryLoading, setTryLoading] = useState(false);

  const runTryIt = async () => {
    setTryLoading(true);
    setTryResult('');
    try {
      const params = new URLSearchParams({ q: tryQuery, limit: '5' });
      if (tryLibrary.trim()) params.set('library', tryLibrary.trim());
      const res = await fetch(`${FUNCTION_URL}?${params.toString()}`);
      const json = await res.json();
      setTryResult(JSON.stringify(json, null, 2));
    } catch (err) {
      setTryResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTryLoading(false);
    }
  };

  const apiSchema = {
    '@context': 'https://schema.org',
    '@type': 'APIReference',
    name: 'Iconstack Icon Search API',
    description:
      'Free public JSON API to search 51,000+ MIT-licensed icons from 21 curated icon libraries by keyword, library, category, and style.',
    url: 'https://iconstack.io/api',
    documentation: 'https://iconstack.io/api',
    targetPlatform: 'Web',
    programmingModel: 'REST',
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    provider: { '@type': 'Organization', name: 'Ossian Design Lab' },
  };

  const curlExample = `curl "${FUNCTION_URL}?q=user&limit=5"`;

  const fetchExample = `const res = await fetch(
  "${FUNCTION_URL}?" +
    new URLSearchParams({ q: "user", library: "lucide", limit: "10" })
);
const data = await res.json();
console.log(data.results);`;

  const pythonExample = `import requests

r = requests.get(
    "${FUNCTION_URL}",
    params={"q": "user", "library": "lucide", "limit": 10},
)
data = r.json()
for icon in data["results"]:
    print(icon["library"], icon["name"], icon["url"])`;

  return (
    <>
      <Helmet>
        <title>Free Icon Search API — 51,000+ MIT Icons | Iconstack</title>
        <meta
          name="description"
          content="Free public JSON API to search 51,000+ MIT-licensed icons across 21 libraries. No auth, CORS-enabled, ready for Figma plugins, AI agents, and design tools."
        />
        <meta
          name="keywords"
          content="icon search API, icon JSON API, free SVG API, icon REST API, icons API, search icons programmatically"
        />
        <link rel="canonical" href="https://iconstack.io/api" />
        <meta property="og:title" content="Free Icon Search API — 51,000+ MIT Icons" />
        <meta
          property="og:description"
          content="Search 51,000+ free SVG icons via a public JSON API. No auth required."
        />
        <meta property="og:url" content="https://iconstack.io/api" />
        <script type="application/ld+json">{JSON.stringify(apiSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center justify-center mb-8">
              <Link
                to="/"
                className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition"
                aria-label="Back to Iconstack home"
              >
                <IconstackLogo className="text-primary w-8 h-8" />
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground">
              Icon Search API
            </h1>
            <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
              A free, public JSON API for searching 51,000+ MIT-licensed icons across 21 curated
              libraries. No auth, CORS-enabled, ready for Figma plugins, VS Code extensions, AI
              agents, and design systems.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">MIT licensed</Badge>
              <Badge variant="secondary">No API key</Badge>
              <Badge variant="secondary">CORS enabled</Badge>
              <Badge variant="secondary">v1</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Endpoint */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Endpoint</h2>
            <CodeBlock>{`GET ${FUNCTION_URL}`}</CodeBlock>
          </section>

          {/* Try it */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Try it</h2>
            <div className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Query (q)</label>
                  <Input value={tryQuery} onChange={e => setTryQuery(e.target.value)} placeholder="user" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">library (optional)</label>
                  <Input value={tryLibrary} onChange={e => setTryLibrary(e.target.value)} placeholder="lucide" />
                </div>
              </div>
              <Button onClick={runTryIt} disabled={tryLoading || !tryQuery.trim()}>
                {tryLoading ? 'Searching…' : 'Run query'}
              </Button>
              {tryResult && (
                <pre className="bg-muted/50 border rounded-lg p-4 text-xs overflow-x-auto max-h-96 font-mono whitespace-pre-wrap break-words">
                  <code>{tryResult}</code>
                </pre>
              )}
            </div>
          </section>

          {/* Parameters */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Query parameters</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {PARAMS.map(p => (
                    <tr key={p.name} className="border-t">
                      <td className="px-4 py-3 font-mono">
                        {p.name}
                        {p.required && <span className="text-primary ml-1">*</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                      <td className="px-4 py-3">{p.desc}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Required.</p>
          </section>

          {/* Response */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Response shape</h2>
            <CodeBlock>{`{
  "query": "user",
  "total": 412,
  "limit": 25,
  "offset": 0,
  "indexGeneratedAt": "2026-04-30T10:00:00.000Z",
  "results": [
    {
      "id": "lucide-user",
      "name": "User",
      "library": "lucide",
      "libraryName": "Lucide",
      "category": "people",
      "tags": ["person", "profile", "account"],
      "style": "outline",
      "url": "https://iconstack.io/icon/lucide/user"
    }
  ]
}`}</CodeBlock>
          </section>

          {/* Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Examples</h2>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">cURL</h3>
            <CodeBlock>{curlExample}</CodeBlock>
            <h3 className="text-sm font-medium mb-2 mt-4 text-muted-foreground">JavaScript / fetch</h3>
            <CodeBlock>{fetchExample}</CodeBlock>
            <h3 className="text-sm font-medium mb-2 mt-4 text-muted-foreground">Python</h3>
            <CodeBlock>{pythonExample}</CodeBlock>
          </section>

          {/* License */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">License & attribution</h2>
            <p className="text-muted-foreground">
              All icons returned by this API are MIT-licensed and free for personal and commercial
              use. Attribution is not required, but a backlink to{' '}
              <a href="https://iconstack.io" className="text-primary hover:underline">
                iconstack.io
              </a>{' '}
              is appreciated. See the full{' '}
              <Link to="/license" className="text-primary hover:underline">
                license details
              </Link>
              .
            </p>
          </section>

          <Separator />
          <p className="text-xs text-muted-foreground text-center">
            Built by{' '}
            <a href="https://iconstack.io" className="hover:underline">
              Iconstack
            </a>{' '}
            · Powered by Ossian Design Lab
          </p>
        </div>
      </div>
    </>
  );
};

export default ApiDocsPage;
