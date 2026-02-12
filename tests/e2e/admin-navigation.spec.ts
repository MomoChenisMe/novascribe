/**
 * @file 後台導覽 E2E 測試
 * @description 測試後台側邊欄導覽：點擊導覽項目→頁面切換→高亮更新。
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 *
 * 注意：這些測試假設使用者已通過 auth.setup.ts 登入，
 *       並透過 storageState 共享認證狀態。
 *       如需獨立執行，請先手動登入或設定 storageState。
 */

import { test, expect } from '@playwright/test';

/** 導覽項目與對應路徑 */
const NAV_ITEMS = [
  { label: '儀表板', href: '/admin' },
  { label: '文章', href: '/admin/posts' },
  { label: '分類', href: '/admin/categories' },
  { label: '標籤', href: '/admin/tags' },
  { label: '媒體', href: '/admin/media' },
  { label: 'SEO', href: '/admin/seo' },
  { label: '設定', href: '/admin/settings' },
];

test.describe('後台導覽', () => {
  test.beforeEach(async ({ page }) => {
    // 前往後台首頁（假設已透過 storageState 認證）
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('NovaScribe');
  });

  test('側邊欄顯示所有導覽項目', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    await expect(sidebar).toBeVisible();

    for (const item of NAV_ITEMS) {
      await expect(sidebar.getByRole('link', { name: item.label })).toBeVisible();
    }
  });

  test('點擊導覽項目切換頁面', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 點擊「文章」
    await sidebar.getByRole('link', { name: '文章' }).click();
    await expect(page).toHaveURL(/\/admin\/posts/);

    // 點擊「分類」
    await sidebar.getByRole('link', { name: '分類' }).click();
    await expect(page).toHaveURL(/\/admin\/categories/);

    // 點擊「儀表板」回到首頁
    await sidebar.getByRole('link', { name: '儀表板' }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('當前頁面導覽項目應有 aria-current="page"', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 首頁：儀表板應為 active
    const dashboardLink = sidebar.getByRole('link', { name: '儀表板' });
    await expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    // 其他項目不應有 aria-current
    const postsLink = sidebar.getByRole('link', { name: '文章' });
    await expect(postsLink).not.toHaveAttribute('aria-current', 'page');

    // 切換到文章頁
    await postsLink.click();
    await expect(page).toHaveURL(/\/admin\/posts/);

    // 文章應為 active
    await expect(postsLink).toHaveAttribute('aria-current', 'page');

    // 儀表板不再 active
    await expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('當前頁面導覽項目有高亮樣式', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 儀表板連結應有 active 樣式（bg-gray-800）
    const dashboardLink = sidebar.getByRole('link', { name: '儀表板' });
    await expect(dashboardLink).toHaveClass(/bg-gray-800/);

    // 文章連結不應有 active 樣式
    const postsLink = sidebar.getByRole('link', { name: '文章' });
    await expect(postsLink).not.toHaveClass(/bg-gray-800/);
  });

  test('收合/展開側邊欄', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 初始狀態：展開（寬度 w-64）
    await expect(sidebar).toHaveClass(/w-64/);

    // 點擊收合按鈕
    await page.getByRole('button', { name: '收合側邊欄' }).click();

    // 側邊欄應收合（寬度 w-16）
    await expect(sidebar).toHaveClass(/w-16/);

    // 導覽項目文字應隱藏（sr-only）
    const postsLabel = sidebar.locator('a[href="/admin/posts"] span.sr-only');
    await expect(postsLabel).toHaveText('文章');

    // 點擊展開按鈕
    await page.getByRole('button', { name: '展開側邊欄' }).click();

    // 側邊欄應展開
    await expect(sidebar).toHaveClass(/w-64/);
  });

  test('遍歷所有導覽項目確認路由正確', async ({ page }) => {
    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    for (const item of NAV_ITEMS) {
      await sidebar.getByRole('link', { name: item.label }).click();

      // 驗證 URL 包含正確路徑
      if (item.href === '/admin') {
        await expect(page).toHaveURL(/\/admin$/);
      } else {
        await expect(page).toHaveURL(new RegExp(item.href));
      }

      // 驗證該項目為 active
      const link = sidebar.getByRole('link', { name: item.label });
      await expect(link).toHaveAttribute('aria-current', 'page');
    }
  });
});
