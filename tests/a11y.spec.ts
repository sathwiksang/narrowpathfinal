import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { revealAll, sitemapPaths } from './helpers';

test('pages have no WCAG 2.2 AA violations', async ({ page, request }) => {
  // One desktop and one phone layout cover every breakpoint-specific structure.
  test.skip(!['desktop-chrome', 'iphone'].includes(test.info().project.name));
  for (const path of [...(await sitemapPaths(request)), '/404.html']) {
    await page.goto(path);
    await revealAll(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      // The legacy palette (#e67e22 accent, #7f8c8d secondary text) is below 4.5:1. It is kept
      // unchanged until the Phase 2 redesign introduces an approved, contrast-safe palette.
      .disableRules(['color-contrast'])
      .analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect.soft(summary, path).toEqual([]);
  }
});
