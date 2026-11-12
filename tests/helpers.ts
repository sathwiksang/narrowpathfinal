import type { APIRequestContext, Page } from '@playwright/test';

/** Every indexable path, read from the built sitemap so new pages are covered automatically. */
export const sitemapPaths = async (request: APIRequestContext): Promise<string[]> => {
  const xml = await (await request.get('/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '').pathname);
};

/** Makes scroll-reveal content visible immediately so assertions don't depend on scrolling. */
export const revealAll = async (page: Page): Promise<void> => {
  await page.addStyleTag({ content: '.fade-in { opacity: 1 !important; transform: none !important; }' });
};
