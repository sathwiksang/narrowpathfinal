import { expect, test } from '@playwright/test';
import { CONTACT, NAV, SITE } from '../src/config/site';
import { sitemapPaths } from './helpers';

// Markup checks are browser-independent; run them once.
test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile);

test('sitemap lists every navigation page and is referenced by robots.txt', async ({ request }) => {
  const paths = await sitemapPaths(request);
  for (const item of NAV) expect(paths).toContain(item.href);
  expect(paths.filter((p) => p.startsWith('/articles/')).length).toBeGreaterThan(0);
  expect(new Set(paths).size).toBe(paths.length);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE.url}/sitemap.xml`);
});

test('every indexable page has complete, unique metadata', async ({ page, request }) => {
  const paths = await sitemapPaths(request);
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const path of paths) {
    const response = await page.goto(path);
    expect.soft(response?.status(), path).toBe(200);

    const title = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect.soft(title.length, `${path} title length`).toBeGreaterThanOrEqual(20);
    expect.soft(title.length, `${path} title length`).toBeLessThanOrEqual(90);
    expect.soft(description.length, `${path} description length`).toBeGreaterThanOrEqual(70);
    expect.soft(description.length, `${path} description length`).toBeLessThanOrEqual(160);
    expect.soft(titles.has(title), `${path} duplicate title`).toBe(false);
    expect.soft(descriptions.has(description), `${path} duplicate description`).toBe(false);
    titles.add(title);
    descriptions.add(description);

    const canonical = new URL(path, SITE.url).href;
    await expect.soft(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', canonical);
    await expect.soft(page.locator('meta[property="og:url"]'), path).toHaveAttribute('content', canonical);
    await expect.soft(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', /^index, follow/);
    await expect.soft(page.locator('html'), path).toHaveAttribute('lang', 'en');
    await expect.soft(page.locator('h1'), `${path} single h1`).toHaveCount(1);
    for (const prop of ['og:title', 'og:description', 'og:image', 'og:type']) {
      await expect.soft(page.locator(`meta[property="${prop}"]`), `${path} ${prop}`).toHaveCount(1);
    }
    await expect
      .soft(page.locator('meta[name="twitter:card"]'), path)
      .toHaveAttribute('content', 'summary_large_image');
    await expect.soft(page.locator('img:not([alt])'), `${path} images without alt`).toHaveCount(0);

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    const webPage = jsonLd['@graph']?.find((n: { '@id'?: string }) => n['@id'] === `${canonical}#webpage`);
    expect.soft(webPage?.url, `${path} JSON-LD WebPage`).toBe(canonical);
  }
});

test('every internal link and asset resolves', async ({ page, request }) => {
  const targets = new Set<string>();
  for (const path of [...(await sitemapPaths(request)), '/404.html']) {
    await page.goto(path);
    const urls = await page.evaluate(() =>
      [
        ...[...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
        ...[...document.querySelectorAll('img[src], script[src]')].map((e) => e.getAttribute('src') ?? ''),
        ...[...document.querySelectorAll('link[href]')].map((l) => l.getAttribute('href') ?? ''),
      ].filter((u) => u.startsWith('/')),
    );
    for (const u of urls) targets.add(u.split('#')[0] ?? u);
  }
  expect(targets.size).toBeGreaterThan(20);
  for (const target of targets) {
    expect.soft((await request.get(target)).status(), target).toBe(200);
  }
});

test('legacy URLs keep working', async ({ request }) => {
  for (const path of ['/about', '/books', '/sermons.html', '/integrity-values.html']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const portrait = await request.get('/Images/about/johnmathew.jpg');
  expect(portrait.status()).toBe(200);
  expect(portrait.headers()['content-type']).toBe('image/jpeg');
});

test('unknown pages return a noindex 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('contact details never appear in plain text in the HTML', async ({ request }) => {
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toContain(CONTACT.email);
    expect(html, path).not.toContain(CONTACT.phone);
  }
});
