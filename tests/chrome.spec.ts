import { expect, test } from '@playwright/test';
import { CONTACT_SEALED, NAV } from '../src/config/site';
import { unseal } from '../src/lib/contact-seal';

const EMAIL = unseal(CONTACT_SEALED.email);
const PHONE = unseal(CONTACT_SEALED.phone);

test.describe('navigation', () => {
  test('desktop nav reaches every page and marks the current one', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation only');
    await page.goto('/');
    for (const item of NAV.filter((n) => n.href !== '/')) {
      await page.locator('.nav-links').getByRole('link', { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(item.href);
      await expect(page.locator('.nav-links [aria-current="page"]')).toHaveText(item.label);
    }
  });

  test('mobile menu opens, locks page scroll, and closes with Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile menu only');
    await page.goto('/about.html');
    const menu = page.locator('#mobileMenu');
    const toggle = page.locator('#mobileMenuBtn');

    await expect(menu).toHaveAttribute('inert', '');
    await toggle.click();
    await expect(menu).toHaveClass(/active/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobileMenuClose')).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveClass(/active/);
    await expect(menu).toHaveAttribute('inert', '');
    await expect(toggle).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

    await toggle.click();
    await menu.getByRole('link', { name: 'Sermons' }).click();
    await expect(page).toHaveURL('/sermons.html');
  });

  test('focus cannot leave the open mobile menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile menu only');
    await page.goto('/books.html');
    await page.locator('#mobileMenuBtn').click();
    await expect(page.locator('main')).toHaveAttribute('inert', '');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(i % 2 ? 'Tab' : 'Shift+Tab');
      const insideMenu = await page.evaluate(() => {
        const active = document.activeElement;
        return active === document.body || Boolean(active?.closest('#mobileMenu'));
      });
      expect(insideMenu).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('navigation stays on one line at every width between phone and desktop', async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(browserName !== 'chromium' || isMobile, 'layout sweep runs once');
    for (const path of ['/', '/about.html', '/articles.html']) {
      for (let width = 768; width <= 1440; width += 32) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const nav = await page.locator('#navbar').boundingBox();
        expect.soft(nav?.height, `${path} at ${width}px`).toBeLessThan(90);
        const links = page.locator('.nav-links a');
        if (await links.first().isVisible()) {
          for (const box of await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))) {
            expect.soft(box.height, `${path} at ${width}px: link wraps`).toBeLessThan(30);
            expect.soft(box.right, `${path} at ${width}px: link overflows`).toBeLessThanOrEqual(width);
          }
        } else {
          await expect.soft(page.locator('#mobileMenuBtn'), `${path} at ${width}px`).toBeVisible();
        }
      }
    }
  });

  test('navigation bar gains its shadow once the page scrolls', async ({ page }) => {
    await page.goto('/books.html');
    const nav = page.locator('#navbar');
    await expect(nav).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(nav).toHaveClass(/scrolled/);
  });
});

test.describe('contact links', () => {
  test('email and phone stay sealed until a person interacts, then become working links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const email = footer.locator('a[data-contact="email"]');
    const phone = footer.locator('a[data-contact="phone"]');
    await expect(email).toHaveText('Show email address');
    await expect(email).toHaveAttribute('href', '#contact');
    await expect(phone).toHaveText('Show phone number');

    // What a crawler renders: the page after its scripts ran, with no user input.
    const rendered = await page.content();
    expect(rendered).not.toContain(EMAIL);
    expect(rendered).not.toContain(PHONE);

    // Script-dispatched events (what a bot can send) are untrusted and ignored.
    await email.dispatchEvent('click');
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })));
    await expect(email).toHaveAttribute('href', /#contact$/);

    // Real keyboard input reveals every contact link.
    await page.keyboard.press('Shift');
    await expect(email).toHaveText(EMAIL);
    await expect(email).toHaveAttribute('href', `mailto:${EMAIL}`);
    await expect(phone).toHaveText(PHONE);
    await expect(phone).toHaveAttribute('href', `tel:${PHONE.replace(/[^\d+]/g, '')}`);
  });

  test('call-to-action keeps its label and links to email once revealed', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.cta-section a[data-contact="email"]');
    await expect(cta).toHaveText('Connect With Us');
    await expect(cta).toHaveAttribute('href', '#contact');
    await page.keyboard.press('Shift');
    await expect(cta).toHaveText('Connect With Us');
    await expect(cta).toHaveAttribute('href', `mailto:${EMAIL}`);
  });
});

test.describe('Ask Dr. Sunny chatbot', () => {
  test('appears, opens its popup on first tap, and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const float = page.locator('.dr-sunny-chat-float');
    const trigger = float.locator('.dr-sunny-chat-trigger');
    await expect(float).toHaveClass(/dr-sunny-chat-float-visible/);

    await trigger.click();
    await expect(float).toHaveClass(/is-open/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page).toHaveURL('/');
    await expect(float.locator('.dr-sunny-popup-cta')).toHaveAttribute('target', '_blank');

    await page.keyboard.press('Escape');
    await expect(float).not.toHaveClass(/is-open/);
  });
});

test.describe('layout regressions', () => {
  test('the 404 page title sits below the navigation bar, not behind it', async ({ page }) => {
    await page.goto('/404.html');
    const nav = await page.locator('#navbar').boundingBox();
    const title = await page.locator('h1').boundingBox();
    expect(title?.y ?? 0).toBeGreaterThanOrEqual((nav?.y ?? 0) + (nav?.height ?? 0));
  });

  test('cards lift on hover even after their scroll-in animation', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover needs a pointer');
    for (const [path, selector] of [
      ['/', '.feature-card'],
      ['/books.html', '#articlesGrid .article-card'],
      ['/sermons.html', '.sermon-card'],
    ] as const) {
      await page.goto(path);
      // Instant scrolling, so the card cannot drift out from under the pointer while a smooth scroll finishes.
      await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
      const card = page.locator(selector).first();
      // Centre the card in the window so the pointer is never over the fixed navigation bar.
      await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await expect(card).toHaveClass(/visible/);
      // Park the pointer outside the card first: Firefox re-applies :hover when a page scrolls under a resting
      // pointer, which would otherwise lift the card before its resting position is measured.
      await page.mouse.move(1, 1);
      await page.waitForTimeout(700); // reveal and un-hover transitions
      // Offset from the card's container, so scrolling (or Firefox's scroll anchoring) cannot mask the lift.
      const top = () =>
        card.evaluate((el) => el.getBoundingClientRect().top - (el.parentElement?.getBoundingClientRect().top ?? 0));
      const resting = await top();
      const box = await card.boundingBox();
      await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2, {
        steps: 5,
      });
      await expect.poll(async () => resting - (await top()), { message: path }).toBeGreaterThan(2);
    }
  });
});
