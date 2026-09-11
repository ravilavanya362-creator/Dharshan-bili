import { getAllPosts } from '../lib/posts';

const baseUrl = 'https://bilisave.com';

export default function sitemap(req, res) {
  const posts = getAllPosts();

  const staticPages = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/copyright',
    '/disclaimer',
  ];

  const urls = staticPages.map((path) => ({
    loc: `${BASE_URL}${path}`,
  }));

  const blogUrls = posts.map((post) => ({
    loc: `${BASE_URL}/blog/${post.slug}`,
    lastmod: new Date(post.date).toISOString(),
  }));

  const allUrls = [...urls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>${item.lastmod ? `
    <lastmod>${item.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(xml);
  res.end();
}
