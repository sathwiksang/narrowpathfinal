import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/resources.html');
});

const groups = '.resource-category';

test('category counts match the resources listed', async ({ page }) => {
  for (const group of await page.locator(groups).all()) {
    const n = await group.locator('.resource-card').count();
    await expect(group.locator('.category-count')).toHaveText(`${n} ${n === 1 ? 'Resource' : 'Resources'}`);
  }
});

test('tabs show only the chosen category', async ({ page }) => {
  await page.getByRole('button', { name: 'Bible Study', exact: true }).click();
  const visible = page.locator(`${groups}:visible`);
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute('data-filter-key', 'bible');
});

test('search hides categories without matches and respects the active tab', async ({ page }) => {
  const search = page.getByRole('textbox', { name: /search resources/i });
  await search.fill('darby');
  await expect(page.locator(`${groups}:visible`)).toHaveCount(1);
  await expect(page.locator('.resource-card:visible')).toHaveText(/John Nelson Darby Archives/);

  await page.getByRole('button', { name: 'Educational', exact: true }).click();
  await expect(page.locator(`${groups}:visible`)).toHaveCount(0);
  await expect(page.locator('[data-filter-empty]')).toBeVisible();
});

test('only resources with a real address are links', async ({ page }) => {
  await expect(page.locator('a.resource-link[href="#"]')).toHaveCount(0);
  await expect(page.locator('a.resource-link', { hasText: 'Visit BibleGateway.com' })).toHaveAttribute(
    'href',
    'https://www.biblegateway.com',
  );
});
