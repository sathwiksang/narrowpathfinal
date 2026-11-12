import type { APIRoute } from 'astro';
import { NAV } from '../config/site';
import { articlePath, articles } from '../lib/data';
import { absoluteUrl } from '../lib/schema';

/** Every indexable page: the navigation pages plus one page per article. */
export const GET: APIRoute = () => {
  const entries = [
    ...NAV.map((item) => ({ loc: absoluteUrl(item.href), lastmod: undefined })),
    ...articles.map((a) => ({
      loc: absoluteUrl(articlePath(a)),
      lastmod: /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : undefined,
    })),
  ];
  const urls = entries
    .map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
