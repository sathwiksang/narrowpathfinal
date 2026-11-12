import { expect, test } from '@playwright/test';

const reader = '#articleReader';

test.describe('articles listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles.html');
  });

  test('opening an article shows its content and closing clears it', async ({ page }) => {
    const card = page.locator('#moses-law');
    await expect(card.locator('.read-article-btn')).toHaveAttribute('href', '/articles/moses-law.html');
    await card.locator('.article-title').click();

    const dialog = page.locator(reader);
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL('/articles.html');
    await expect(dialog.locator('.reader-title')).toHaveText('The Law of Moses and the Law of Christ');
    await expect(dialog.locator('.reader-body')).toContainText('Moses');

    await dialog.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await expect(dialog.locator('#readerProgress')).toHaveAttribute('style', /width: (9\d|100)(\.\d+)?%/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(dialog.locator('#readerContent')).toBeEmpty();
  });

  test('the READ ARTICLE button opens the reader, and a modified click opens the article page', async ({
    page,
    context,
    isMobile,
  }) => {
    await page.locator('#roman-catholicism .read-article-btn').click();
    await expect(page.locator(reader)).toBeVisible();
    await expect(page).toHaveURL('/articles.html');
    await page.keyboard.press('Escape');

    test.skip(isMobile, 'modifier clicks are a desktop interaction');
    const [tab] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#roman-catholicism .read-article-btn').click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await expect(tab).toHaveURL(/\/articles\/roman-catholicism\.html$/);
    await expect(page.locator(reader)).toBeHidden();
  });

  test('a playing card video stops when filtered out or when an article opens', async ({ page }) => {
    const card = page.locator('#ireland-outreach-hq');
    await card.getByRole('button', { name: /^Play video/ }).click();
    await expect(card.locator('iframe')).toHaveCount(1);

    await page.getByRole('button', { name: 'Prophecy', exact: true }).click();
    await expect(card).toBeHidden();
    await expect(card.locator('iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(card.getByRole('button', { name: /^Play video/ })).toBeVisible();

    await card.getByRole('button', { name: /^Play video/ }).click();
    await page.locator('#moses-law .article-title').click();
    await expect(page.locator(reader)).toBeVisible();
    await expect(card.locator('iframe')).toHaveCount(0);
  });

  test('an article without a call-to-action shows no leftover one', async ({ page }) => {
    await page.locator('#moses-law .article-title').click();
    await expect(page.locator(`${reader} .reader-cta`)).toBeVisible();
    await page.getByRole('button', { name: 'Close article' }).click();

    await page.locator('#jerusalem-temple .article-title').click();
    await expect(page.locator(`${reader} .reader-title`)).toContainText('Jerusalem Temple');
    await expect(page.locator(`${reader} .reader-cta`)).toHaveCount(0);
  });

  test('topic filters include the Biography article', async ({ page }) => {
    await page.getByRole('button', { name: 'Biography', exact: true }).click();
    await expect(page.locator('#articlesGrid .article-card:visible')).toHaveCount(1);
    await expect(page.locator('#darby-book')).toBeVisible();
  });

  test('the Ask Dr. Sunny card links out instead of opening the reader', async ({ page }) => {
    const link = page.locator('#ask-dr-sunny .read-article-btn');
    await expect(link).toHaveAttribute('href', /^https:\/\/chatgpt\.com\//);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('the inline video loads the player only when played', async ({ page }) => {
    const card = page.locator('#ireland-outreach-hq');
    await expect(card.locator('iframe')).toHaveCount(0);
    await card.getByRole('button', { name: /^Play video/ }).click();
    await expect(card.locator('iframe')).toHaveAttribute(
      'src',
      /youtube-nocookie\.com\/embed\/E56hMYQNMQ0\?autoplay=1/,
    );
    await expect(page.locator(reader)).toBeHidden();
  });
});

test('legacy deep links open the article directly', async ({ page }) => {
  await page.goto('/articles.html#darby-book');
  await expect(page.locator(reader)).toBeVisible();
  await expect(page.locator(`${reader} .reader-title`)).toContainText('Darby');
});

test('each article has its own crawlable page', async ({ page }) => {
  await page.goto('/articles/antichrist-world-government.html');
  await expect(page.locator('h1')).toHaveText('Anti-Christ and the World Government');
  await expect(page.locator('.reader-body')).toContainText('Antichrist');
  await page.getByRole('link', { name: '← All Articles' }).click();
  await expect(page).toHaveURL('/articles.html');
});
