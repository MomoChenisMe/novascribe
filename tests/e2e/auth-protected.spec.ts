/**
 * @file 未認證存取 E2E 測試
 * @description 測試路由保護：未認證使用者存取 /admin 相關頁面時應被重新導向至登入頁。
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   3. 應用程式可透過 `npm run dev` 正常啟動
 *
 * 注意：這些測試使用未認證狀態（無 storageState），
 *       驗證 middleware 的路由保護是否正確運作。
 */

import { test, expect } from '@playwright/test';

test.describe('未認證存取保護', () => {
  test('直接存取 /admin 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin');

    // 應被 middleware 攔截並重新導向至 /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/posts 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/posts');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/categories 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/categories');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/settings 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/settings');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/tags 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/tags');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/media 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/media');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('直接存取 /admin/seo 應重新導向至登入頁', async ({ page }) => {
    await page.goto('/admin/seo');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('登入頁本身不需認證即可存取', async ({ page }) => {
    await page.goto('/login');

    // 登入頁不應被重新導向
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('首頁不需認證即可存取', async ({ page }) => {
    await page.goto('/');

    // 首頁不受 middleware 保護
    await expect(page).not.toHaveURL(/\/login/);
  });
});
