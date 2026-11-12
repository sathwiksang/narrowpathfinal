import { expect, test } from '@playwright/test';
import sermonData from '../src/data/sermons.json' with { type: 'json' };
import { formatDuration } from '../src/lib/format';
import { revealAll } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/sermons.html');
  await revealAll(page);
});

const cards = '#sermonsGrid .sermon-card';

test('episode statistic matches the videos listed', async ({ page }) => {
  await expect(page.locator('.stats-grid .stat-number').first()).toHaveText(String(await page.locator(cards).count()));
});

test('durations and teaching hours come from the real video lengths', async ({ page }) => {
  for (const sermon of sermonData) {
    await expect(page.locator(`${cards}[data-video-id="${sermon.id}"] .sermon-duration`)).toHaveText(
      formatDuration(sermon.seconds),
    );
  }
  const hours = Math.floor(sermonData.reduce((sum, s) => sum + s.seconds, 0) / 3600);
  await expect(page.locator('.stats-grid .stat-card').nth(1).locator('.stat-number')).toHaveText(`${hours}+`);
});

test('a modified click on Watch Now opens YouTube instead of the in-page player', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(isMobile, 'modifier clicks are a desktop interaction');
  const card = page.locator(cards).first();
  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    card.locator('.watch-now').click({ modifiers: ['ControlOrMeta'] }),
  ]);
  await expect(tab).toHaveURL(/youtube\.com\/watch\?v=/);
  await expect(page.locator('#videoModal')).toBeHidden();
});

test('category filter and search work together', async ({ page }) => {
  await page.getByRole('button', { name: 'Prophecy', exact: true }).click();
  const visible = page.locator(`${cards}:visible`);
  for (const card of await visible.all()) await expect(card).toHaveAttribute('data-filter-key', 'prophecy');

  await page.getByRole('textbox', { name: /search sermons/i }).fill('millennium');
  expect(await visible.count()).toBeGreaterThan(0);
  for (const card of await visible.all()) {
    await expect(card).toHaveAttribute('data-filter-key', 'prophecy');
    await expect(card).toContainText(/millennium/i);
  }

  await page.getByRole('textbox', { name: /search sermons/i }).fill('zzzz-nothing');
  await expect(visible).toHaveCount(0);
  await expect(page.locator('[data-filter-empty]')).toBeVisible();
});

test('a sermon plays in the modal and stops when closed', async ({ page }) => {
  const card = page.locator(cards).first();
  const id = await card.getAttribute('data-video-id');
  await expect(card.locator('.watch-now')).toHaveAttribute('href', `https://www.youtube.com/watch?v=${id}`);

  await card.locator('.watch-now').click();
  const dialog = page.locator('#videoModal');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL('/sermons.html');
  await expect(dialog.locator('iframe')).toHaveAttribute(
    'src',
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
  );
  await expect(dialog.locator('h3')).toHaveText((await card.locator('.sermon-title').textContent())?.trim() ?? '');

  await dialog.getByRole('button', { name: 'Close video' }).click();
  await expect(dialog).toBeHidden();
  await expect(dialog.locator('iframe')).not.toHaveAttribute('src', /.+/);
});
