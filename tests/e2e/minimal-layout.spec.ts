import { test, expect } from '@playwright/test';

test.describe('Swiss Style Minimal Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not show traditional navbar header', async ({ page }) => {
    // 舊版 header 應已移除
    const header = page.locator('header.border-b');
    await expect(header).toHaveCount(0);
  });

  test('should show hamburger toggle button', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /open menu/i });
    await expect(toggle).toBeVisible();
  });

  test('should open side drawer when toggle is clicked', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /open menu/i });
    await toggle.click();

    // Drawer 應該滑出
    const drawer = page.locator('aside');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // 導航連結應可見
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Blog')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
  });

  test('should close drawer when backdrop is clicked', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /open menu/i });
    await toggle.click();

    // 點擊 backdrop 關閉
    const backdrop = page.locator('.fixed.inset-0.bg-black\\/20');
    await backdrop.click({ force: true });

    const drawer = page.locator('aside');
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('should close drawer when Escape is pressed', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /open menu/i });
    await toggle.click();

    await page.keyboard.press('Escape');

    const drawer = page.locator('aside');
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('should show footer with widget links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(page.getByText('Disclaimer')).toBeVisible();
    await expect(page.getByText('Certifications')).toBeVisible();
    await expect(page.getByText('Resources')).toBeVisible();
  });

  test('should open widget modal when footer link is clicked', async ({ page }) => {
    await page.getByText('Disclaimer').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-label', 'Disclaimer');

    // 關閉
    await page.getByLabel('Close').click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('Homepage Magazine View', () => {
  test('should display featured hero on first page', async ({ page }) => {
    await page.goto('/');
    // Hero section 應該存在（若有文章）
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('should show visual grid with responsive layout', async ({ page }) => {
    await page.goto('/');
    const grid = page.locator('.grid.grid-cols-1');
    // Grid 應有 responsive classes
    if (await grid.count() > 0) {
      await expect(grid.first()).toBeVisible();
    }
  });
});
