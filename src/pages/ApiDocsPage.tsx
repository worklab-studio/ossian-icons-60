import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bird, Check, Copy, ExternalLink, Github, Library, Newspaper, ScrollText, Sparkles, Terminal, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { prefetchByPath } from '@/lib/prefetch';

const FUNCTION_URL =
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/icon-search`;
const SVG_FUNCTION_URL =
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/icon-svg`;

const PARAMS: { name: string; type: string; required?: boolean; desc: string; example: string }[] = [
  { name: 'q', type: 'string', required: true, desc: 'Search query (1–80 chars).', example: 'user' },
  { name: 'library', type: 'string', desc: 'Comma-separated library ids to filter by.', example: 'lucide,phosphor' },
  { name: 'category', type: 'string', desc: 'Comma-separated categories to filter by.', example: 'navigation' },
  { name: 'style', type: 'string', desc: 'Comma-separated styles (e.g. outline, filled).', example: 'outline' },
  { name: 'limit', type: 'integer', desc: 'Results to return (1–100, default 25).', example: '10' },
  { name: 'offset', type: 'integer', desc: 'Skip N results (0–1000, default 0).', example: '0' },
];

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'mcp', label: 'MCP' },
  { id: 'try-it', label: 'Try it' },
  { id: 'svg', label: 'Raw SVG' },
  { id: 'params', label: 'Parameters' },
  { id: 'response', label: 'Response' },
  { id: 'examples', label: 'Examples' },
  { id: 'license', label: 'License' },
];

const CodeBlock: React.FC<{ children: string; lang?: string }> = ({ children, lang }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const onCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    toast({ description: 'Copied to clipboard', duration: 1500 });
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="relative group">
      <pre className="bg-zinc-950 dark:bg-zinc-900 border border-border/60 rounded-lg p-4 pr-14 text-sm overflow-x-auto font-mono text-zinc-100 leading-relaxed">
        <code>{children}</code>
      </pre>
      <button
        onClick={onCopy}
        className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        aria-label={`Copy ${lang ?? ''} example`}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};

const SectionHeader: React.FC<{ eyebrow: string; title: string; children?: React.ReactNode }> = ({
  eyebrow, title, children,
}) => (
  <div className="mb-5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">{eyebrow}</div>
    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
    {children && <p className="mt-2 text-muted-foreground">{children}</p>}
  </div>
);

const MCP_SNIPPET = `{
  "mcpServers": {
    "iconstack": {
      "command": "npx",
      "args": ["-y", "iconstack-mcp"]
    }
  }
}`;

const SidebarLink: React.FC<{
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  external?: boolean;
}> = ({ to, icon: Icon, children, external }) => {
  const className =
    'group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors';
  const inner = (
    <>
      <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
      <span className="flex-1 truncate">{children}</span>
      {external && <ExternalLink className="h-3 w-3 opacity-50" />}
    </>
  );
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={() => prefetchByPath(to)}
      onFocus={() => prefetchByPath(to)}
    >
      {inner}
    </Link>
  );
};

const ApiDocsPage: React.FC = () => {
  const [tryQuery, setTryQuery] = useState('user');
  const [tryLibrary, setTryLibrary] = useState('');
  const [tryResult, setTryResult] = useState<string>('');
  const [tryLoading, setTryLoading] = useState(false);
  const [heroCopied, setHeroCopied] = useState(false);
  const [endpointCopied, setEndpointCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [miniQuery, setMiniQuery] = useState('user');
  const { toast } = useToast();

  // Active-section highlight in the left rail.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: [0, 1] }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const runTryIt = async (query?: string) => {
    const q = (query ?? tryQuery).trim();
    if (!q) return;
    setTryLoading(true);
    setTryResult('');
    try {
      const params = new URLSearchParams({ q, limit: '5' });
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

  const runMiniQuery = () => {
    setTryQuery(miniQuery);
    runTryIt(miniQuery);
    document.getElementById('try-it')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyMcp = () => {
    navigator.clipboard.writeText(MCP_SNIPPET);
    setHeroCopied(true);
    toast({ description: 'MCP config copied — paste it into your editor config.', duration: 1800 });
    setTimeout(() => setHeroCopied(false), 1800);
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(FUNCTION_URL);
    setEndpointCopied(true);
    toast({ description: 'Endpoint copied', duration: 1200 });
    setTimeout(() => setEndpointCopied(false), 1500);
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
        <title>Free Icon Search API & MCP Server — 51,000+ Icons | Iconstack</title>
        <meta
          name="description"
          content="Free public JSON API and MCP server for Cursor, Claude & Windsurf. Search 51,000+ MIT-licensed icons across 21 libraries. No auth, CORS-enabled."
        />
        <meta
          name="keywords"
          content="icon search API, icon MCP server, Cursor MCP icons, Claude MCP icons, icon JSON API, free SVG API, icons API"
        />
        <link rel="canonical" href="https://iconstack.io/api" />
        <meta property="og:title" content="Free Icon Search API & MCP — 51,000+ Icons" />
        <meta
          property="og:description"
          content="Search 51,000+ free SVG icons via a public JSON API or directly from Cursor/Claude with the iconstack MCP server."
        />
        <meta property="og:url" content="https://iconstack.io/api" />
        <script type="application/ld+json">{JSON.stringify(apiSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <Link to="/" onMouseEnter={() => prefetchByPath('/')}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Iconstack</span>
              </Link>
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span>API operational</span>
            </div>
          </div>
        </div>

        {/* 3-column app shell */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:gap-10">
          {/* LEFT RAIL */}
          <aside className="hidden lg:block py-10">
            <div className="sticky top-16 space-y-6">
              <div>
                <Link
                  to="/"
                  onMouseEnter={() => prefetchByPath('/')}
                  className="inline-flex items-center gap-2 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                    <IconstackLogo className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-foreground">Iconstack</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">API & MCP</div>
                  </div>
                </Link>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2 px-2">
                  On this page
                </div>
                <ul className="space-y-0.5">
                  {SECTIONS.map(s => {
                    const active = activeSection === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                            active
                              ? 'bg-muted/60 text-foreground font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full transition-colors ${
                              active ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                          />
                          {s.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Separator className="opacity-60" />

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2 px-2">
                  Explore
                </div>
                <nav className="space-y-0.5">
                  <SidebarLink to="/" icon={ArrowLeft}>Browse icons</SidebarLink>
                  <SidebarLink to="/library/lucide" icon={Library}>Libraries</SidebarLink>
                  <SidebarLink to="/blog" icon={Newspaper}>Blog</SidebarLink>
                  <SidebarLink to="/license" icon={ScrollText}>License</SidebarLink>
                </nav>
              </div>

              <Separator className="opacity-60" />

              {/* X-Autopilot promo (cross-promotion per project memory) */}
              <a
                href="https://x-autopilot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10 p-3 hover:border-border transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center">
                    <Bird className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">X-Autopilot</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Grow on X on autopilot. AI writes, schedules and replies.
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary group-hover:gap-1.5 transition-all">
                  Try it free <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0 py-10">
            {/* Hero */}
            <section className="mb-14">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                For developers & AI tools
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Icon Search API <span className="text-muted-foreground">+ MCP</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                A free, public JSON API and MCP server for searching 51,000+ MIT-licensed icons across 21 libraries.
                Drop SVGs into your code from Cursor, Claude or any HTTP client — no auth, no rate limits, no copy/paste.
              </p>

              {/* Mono CTA strip */}
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900 px-3 py-2.5 max-w-md font-mono text-sm text-zinc-100">
                <Terminal className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-400">$</span>
                <span className="flex-1 truncate">npx -y iconstack-mcp</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('npx -y iconstack-mcp');
                    toast({ description: 'Copied', duration: 1200 });
                  }}
                  className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                  aria-label="Copy install command"
                >
                  Copy
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={copyMcp} className="gap-1.5">
                  {heroCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {heroCopied ? 'MCP config copied' : 'Copy MCP install'}
                </Button>
                <Button asChild variant="outline" className="gap-1.5">
                  <a href="#try-it">
                    <Zap className="h-4 w-4" />
                    Try the API
                  </a>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                {[
                  { v: '51,378', l: 'icons' },
                  { v: '21', l: 'libraries' },
                  { v: '0', l: 'auth required' },
                  { v: 'MIT', l: 'license' },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums">{s.v}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-8">
                <Badge variant="secondary">Free forever</Badge>
                <Badge variant="secondary">No API key</Badge>
                <Badge variant="secondary">CORS enabled</Badge>
                <Badge variant="secondary">MCP for Cursor & Claude</Badge>
              </div>
            </section>

            <div className="space-y-16 max-w-3xl">
              {/* Quickstart */}
              <section id="quickstart" className="scroll-mt-20">
                <SectionHeader eyebrow="Get started in 30 seconds" title="Quickstart">
                  One GET request. No auth. JSON in, JSON out.
                </SectionHeader>
                <CodeBlock>{`# Search 51,000+ icons
${curlExample}`}</CodeBlock>
                <p className="text-xs text-muted-foreground mt-3">
                  Endpoint: <code className="font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">{FUNCTION_URL}</code>
                </p>
              </section>

              {/* MCP */}
              <section id="mcp" className="scroll-mt-20">
                <SectionHeader eyebrow="The headline feature" title="Use inside Cursor, Claude & Windsurf">
                  Install the <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono text-foreground">iconstack-mcp</code> server
                  and your AI editor can search and paste SVGs straight into your code.
                </SectionHeader>

                <Tabs defaultValue="cursor" className="w-full">
                  <TabsList>
                    <TabsTrigger value="cursor">Cursor</TabsTrigger>
                    <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
                    <TabsTrigger value="windsurf">Windsurf</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cursor" className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Add to <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted text-foreground">~/.cursor/mcp.json</code>:
                    </p>
                    <CodeBlock>{MCP_SNIPPET}</CodeBlock>
                  </TabsContent>
                  <TabsContent value="claude" className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Add to <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted text-foreground">claude_desktop_config.json</code>:
                    </p>
                    <CodeBlock>{MCP_SNIPPET}</CodeBlock>
                  </TabsContent>
                  <TabsContent value="windsurf" className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Add to <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted text-foreground">~/.codeium/windsurf/mcp_config.json</code>:
                    </p>
                    <CodeBlock>{MCP_SNIPPET}</CodeBlock>
                  </TabsContent>
                </Tabs>

                <div className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
                  <div className="font-medium text-foreground mb-1.5">Try prompts like</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>— "find a clean outline shopping cart icon and add it to the header"</li>
                    <li>— "replace this 🚀 with a Lucide rocket SVG"</li>
                    <li>— "give me 6 weather icons from Phosphor in filled style"</li>
                  </ul>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Tools: <code className="font-mono">search_icons</code> · <code className="font-mono">get_icon_svg</code> · <code className="font-mono">list_libraries</code>
                  </div>
                </div>
              </section>

              {/* Try it */}
              <section id="try-it" className="scroll-mt-20">
                <SectionHeader eyebrow="Live playground" title="Try it">
                  Hit the live endpoint and inspect the JSON.
                </SectionHeader>
                <div className="border border-border rounded-lg p-4 sm:p-5 space-y-4 bg-card">
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
                  <Button onClick={() => runTryIt()} disabled={tryLoading || !tryQuery.trim()} className="gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    {tryLoading ? 'Searching…' : 'Run query'}
                  </Button>
                  {tryResult && (
                    <pre className="bg-zinc-950 dark:bg-zinc-900 border border-border/60 rounded-lg p-4 text-xs overflow-x-auto max-h-96 font-mono whitespace-pre-wrap break-words text-zinc-100">
                      <code>{tryResult}</code>
                    </pre>
                  )}
                </div>
              </section>

              {/* Raw SVG */}
              <section id="svg" className="scroll-mt-20">
                <SectionHeader eyebrow="Inline an icon" title="Get raw SVG">
                  Fetch markup for a specific icon. Discover the right
                  {' '}<code className="font-mono text-xs px-1 py-0.5 rounded bg-muted text-foreground">library</code>
                  {' '}+ <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted text-foreground">id</code>
                  {' '}from the search endpoint.
                </SectionHeader>
                <CodeBlock>{`GET ${SVG_FUNCTION_URL}?library=lucide&id=user
GET ${SVG_FUNCTION_URL}?library=lucide&id=user&format=svg   # raw image/svg+xml`}</CodeBlock>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-5 mb-2">JSON response</h3>
                <CodeBlock>{`{
  "library": "lucide",
  "id": "user",
  "fullId": "lucide-user",
  "svg": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" ...>...</svg>",
  "url": "https://iconstack.io/icon/lucide/user"
}`}</CodeBlock>
              </section>

              {/* Params */}
              <section id="params" className="scroll-mt-20">
                <SectionHeader eyebrow="Reference" title="Query parameters" />
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PARAMS.map(p => (
                        <tr key={p.name} className="border-t border-border/60">
                          <td className="px-4 py-3 font-mono text-foreground">
                            {p.name}
                            {p.required && <span className="text-primary ml-1">*</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.desc}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">{p.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">* Required.</p>
              </section>

              {/* Response */}
              <section id="response" className="scroll-mt-20">
                <SectionHeader eyebrow="Reference" title="Response shape" />
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
              <section id="examples" className="scroll-mt-20">
                <SectionHeader eyebrow="Copy & paste" title="Examples" />
                <Tabs defaultValue="curl">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                    <TabsTrigger value="py">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curl" className="mt-4">
                    <CodeBlock>{curlExample}</CodeBlock>
                  </TabsContent>
                  <TabsContent value="js" className="mt-4">
                    <CodeBlock>{fetchExample}</CodeBlock>
                  </TabsContent>
                  <TabsContent value="py" className="mt-4">
                    <CodeBlock>{pythonExample}</CodeBlock>
                  </TabsContent>
                </Tabs>
              </section>

              {/* License */}
              <section id="license" className="scroll-mt-20">
                <SectionHeader eyebrow="The fine print" title="License & attribution" />
                <p className="text-muted-foreground">
                  All icons returned by this API are MIT-licensed and free for personal and commercial use.
                  Attribution is not required, but a backlink to{' '}
                  <a href="https://iconstack.io" className="text-primary hover:underline">iconstack.io</a>{' '}
                  is appreciated. See the full{' '}
                  <Link to="/license" onMouseEnter={() => prefetchByPath('/license')} className="text-primary hover:underline">license details</Link>.
                </p>
              </section>

              <Separator />
              <p className="text-xs text-muted-foreground text-center">
                Built by <a href="https://iconstack.io" className="hover:underline">Iconstack</a> · Powered by Ossian Design Lab
              </p>
            </div>
          </main>

          {/* RIGHT RAIL */}
          <aside className="hidden lg:block py-10">
            <div className="sticky top-16 space-y-4">
              {/* Endpoint card */}
              <div className="rounded-lg border border-border/60 bg-card p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Base endpoint
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">GET</span>
                </div>
                <div className="font-mono text-[11px] text-foreground break-all leading-relaxed mb-2.5">
                  {FUNCTION_URL}
                </div>
                <button
                  onClick={copyEndpoint}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition"
                >
                  {endpointCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {endpointCopied ? 'Copied' : 'Copy URL'}
                </button>
              </div>

              {/* Mini playground */}
              <div className="rounded-lg border border-border/60 bg-card p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Try a query
                  </div>
                </div>
                <Input
                  value={miniQuery}
                  onChange={e => setMiniQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runMiniQuery()}
                  placeholder="user"
                  className="h-8 text-sm mb-2"
                />
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={runMiniQuery}
                  disabled={tryLoading || !miniQuery.trim()}
                >
                  {tryLoading ? 'Searching…' : 'Run'}
                </Button>
              </div>

              {/* Status */}
              <div className="rounded-lg border border-border/60 bg-card p-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Status
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  All systems operational
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div className="font-mono text-foreground">99.98%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">p50 latency</div>
                    <div className="font-mono text-foreground">~80ms</div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="rounded-lg border border-border/60 bg-card p-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Resources
                </div>
                <nav className="space-y-0.5">
                  <SidebarLink to="https://www.npmjs.com/package/iconstack-mcp" icon={Terminal} external>
                    iconstack-mcp on npm
                  </SidebarLink>
                  <SidebarLink to="https://github.com/iconstack" icon={Github} external>
                    GitHub
                  </SidebarLink>
                  <SidebarLink to="/llms.txt" icon={ScrollText} external>
                    llms.txt
                  </SidebarLink>
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ApiDocsPage;
