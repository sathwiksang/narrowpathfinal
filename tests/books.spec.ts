import { expect, test } from '@playwright/test';
import { revealAll } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/books.html');
  await revealAll(page);
});

const cards = '#articlesGrid .article-card';

test('statistics and tab counts match the books actually listed', async ({ page }) => {
  const total = await page.locator(cards).count();
  await expect(page.locator('.stats-section .stat-number').first()).toHaveText(String(total));
  for (const tab of await page.locator('.tab-btn').all()) {
    const value = await tab.getAttribute('data-filter-value');
    const expected = value === 'all' ? total : await page.locator(`${cards}[data-filter-key="${value}"]`).count();
    await expect(tab.locator('.tab-count')).toHaveText(String(expected));
  }
});

test('language tab and search combine instead of overriding each other', async ({ page }) => {
  await page.getByRole('button', { name: /^Malayalam/ }).click();
  await expect(page.getByRole('button', { name: /^Malayalam/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('textbox', { name: /search books/i }).fill('darby');
  const visible = page.locator(`${cards}:visible`);
  await expect(visible).toHaveCount(1);
  await expect(visible.locator('.article-title')).toHaveText('John Nelson Darby (Malayalam Book)');

  // Switching tabs keeps the search: every visible book still matches "darby".
  await page.getByRole('button', { name: /^All Languages/ }).click();
  expect(await visible.count()).toBeGreaterThan(1);
  for (const card of await visible.all()) await expect(card).toContainText(/darby/i);
  // Filtered cards keep their flex layout (the legacy script forced display:block).
  expect(await visible.first().evaluate((el) => getComputedStyle(el).display)).toBe('flex');
});

test('shows the empty state when nothing matches', async ({ page }) => {
  await page.getByRole('textbox', { name: /search books/i }).fill('zzzz-no-such-book');
  await expect(page.locator(`${cards}:visible`)).toHaveCount(0);
  await expect(page.locator('[data-filter-empty]')).toBeVisible();
});

test('PDF viewer opens the selected book and fully closes', async ({ page, isMobile }) => {
  const card = page.locator('#history-india');
  await card.getByRole('button', { name: 'View PDF' }).click();
  const dialog = page.locator('#pdfModal');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.modal-title')).toHaveText('History of India: A Christian Perspective');
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /drive\.google\.com\/file\/d\/.+\/preview$/);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(dialog.locator('iframe')).not.toHaveAttribute('src', /.+/);

  await card.getByRole('button', { name: 'View PDF' }).click();
  await dialog.getByRole('button', { name: 'Close PDF viewer' }).click();
  await expect(dialog).toBeHidden();

  if (!isMobile) {
    await card.getByRole('button', { name: 'View PDF' }).click();
    await page.mouse.click(5, 5); // dimmed area outside the viewer
    await expect(dialog).toBeHidden();
  }
});

test('books without a published file offer no dead buttons', async ({ page }) => {
  const card = page.locator(cards, { hasText: 'Christians and Tattoos' });
  await expect(card.getByRole('button', { name: 'View PDF' })).toHaveCount(0);
  await expect(card.getByRole('link', { name: 'Open in Drive' })).toHaveCount(0);
});
