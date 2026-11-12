import { expect, test } from '@playwright/test';
import { CONTACT, NAV } from '../src/config/site';

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

  test('navigation bar gains its shadow once the page scrolls', async ({ page }) => {
    await page.goto('/books.html');
    const nav = page.locator('#navbar');
    await expect(nav).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(nav).toHaveClass(/scrolled/);
  });
});

test.describe('contact links', () => {
  test('footer email and phone decode into working links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const email = footer.locator('a[data-contact="email"]');
    const phone = footer.locator('a[data-contact="phone"]');
    await expect(email).toHaveText(CONTACT.email);
    await expect(email).toHaveAttribute('href', `mailto:${CONTACT.email}`);
    await expect(phone).toHaveText(CONTACT.phone);
    await expect(phone).toHaveAttribute('href', 'tel:+18326518048');
  });

  test('call-to-action keeps its label and links to email', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.cta-section a[data-contact="email"]');
    await expect(cta).toHaveText('Connect With Us');
    await expect(cta).toHaveAttribute('href', `mailto:${CONTACT.email}`);
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
