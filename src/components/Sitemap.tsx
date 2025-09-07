const Sitemap = () => {

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://iconstack.io/</loc>
    <lastmod>2025-09-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://iconstack.io/demo/icons</loc>
    <lastmod>2025-09-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return (
    <pre
      style={{
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        margin: 0,
        padding: 0,
      }}
      dangerouslySetInnerHTML={{ __html: sitemapXml }}
    />
  );
};

export default Sitemap;