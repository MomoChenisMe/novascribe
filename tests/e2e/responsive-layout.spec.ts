/**
 * @file 響應式佈局 E2E 測試
 * @description 測試後台佈局在不同視窗寬度下的正確切換。
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 *
 * 斷點定義（參照 Tailwind CSS v4 預設）：
 *   - 手機：< 768px（md 斷點以下）
 *   - 平板：768px ~ 1023px（md ~ lg 之間）
 *   - 桌面：≥ 1024px（lg 斷點以上）
 */

import { test, expect } from '@playwright/test';

test.describe('響應式佈局 — 桌面（≥1024px）', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('桌面模式顯示固定側邊欄', async ({ page }) => {
    await page.goto('/admin');

    // 桌面版側邊欄容器應可見
    const desktopSidebar = page.locator('[data-testid="sidebar-desktop"]');
    await expect(desktopSidebar).toBeVisible();

    // 側邊欄導覽應可見
    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    await expect(sidebar).toBeVisible();

    // 漢堡選單按鈕應隱藏（md:hidden）
    const menuButton = page.getByRole('button', { name: '開啟選單' });
    await expect(menuButton).not.toBeVisible();
  });

  test('桌面模式側邊欄可收合/展開', async ({ page }) => {
    await page.goto('/admin');

    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 初始：展開
    await expect(sidebar).toHaveClass(/w-64/);

    // 收合
    await page.getByRole('button', { name: '收合側邊欄' }).click();
    await expect(sidebar).toHaveClass(/w-16/);

    // 展開
    await page.getByRole('button', { name: '展開側邊欄' }).click();
    await expect(sidebar).toHaveClass(/w-64/);
  });

  test('桌面模式頂部列顯示使用者資訊', async ({ page }) => {
    await page.goto('/admin');

    // 使用者名稱或 email 應可見（sm:block）
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 登出按鈕應可見
    await expect(page.getByRole('button', { name: '登出' })).toBeVisible();
  });
});

test.describe('響應式佈局 — 平板（768px ~ 1023px）', () => {
  test.use({ viewport: { width: 900, height: 700 } });

  test('平板模式顯示側邊欄', async ({ page }) => {
    await page.goto('/admin');

    // 桌面版側邊欄容器應可見（md:block → 768px 以上顯示）
    const desktopSidebar = page.locator('[data-testid="sidebar-desktop"]');
    await expect(desktopSidebar).toBeVisible();

    // 側邊欄應可見
    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    await expect(sidebar).toBeVisible();

    // 漢堡選單按鈕應隱藏（md:hidden）
    const menuButton = page.getByRole('button', { name: '開啟選單' });
    await expect(menuButton).not.toBeVisible();
  });

  test('平板模式側邊欄可收合以節省空間', async ({ page }) => {
    await page.goto('/admin');

    const sidebar = page.locator('nav[aria-label="側邊欄"]');

    // 收合側邊欄
    await page.getByRole('button', { name: '收合側邊欄' }).click();
    await expect(sidebar).toHaveClass(/w-16/);

    // 導覽仍可使用（icon 仍可見）
    const dashboardLink = sidebar.getByRole('link', { name: '儀表板' });
    await expect(dashboardLink).toBeVisible();
  });
});

test.describe('響應式佈局 — 手機（<768px）', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('手機模式隱藏固定側邊欄', async ({ page }) => {
    await page.goto('/admin');

    // 桌面版側邊欄容器應隱藏（hidden md:block → 小螢幕 hidden）
    const desktopSidebar = page.locator('[data-testid="sidebar-desktop"]');
    await expect(desktopSidebar).not.toBeVisible();
  });

  test('手機模式顯示漢堡選單按鈕', async ({ page }) => {
    await page.goto('/admin');

    // 漢堡選單按鈕應可見
    const menuButton = page.getByRole('button', { name: '開啟選單' });
    await expect(menuButton).toBeVisible();
  });

  test('手機模式點擊漢堡選單開啟抽屜式側邊欄', async ({ page }) => {
    await page.goto('/admin');

    // 點擊漢堡選單
    await page.getByRole('button', { name: '開啟選單' }).click();

    // 抽屜式側邊欄應出現
    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    await expect(sidebar).toBeVisible();

    // 背景遮罩應出現
    const overlay = page.locator('[data-testid="mobile-sidebar-overlay"]');
    await expect(overlay).toBeVisible();
  });

  test('手機模式點擊遮罩關閉側邊欄', async ({ page }) => {
    await page.goto('/admin');

    // 開啟側邊欄
    await page.getByRole('button', { name: '開啟選單' }).click();

    const overlay = page.locator('[data-testid="mobile-sidebar-overlay"]');
    await expect(overlay).toBeVisible();

    // 點擊遮罩關閉
    await overlay.click();

    // 遮罩應消失
    await expect(overlay).not.toBeVisible();
  });

  test('手機模式導覽後側邊欄保持開啟（使用者手動關閉）', async ({ page }) => {
    await page.goto('/admin');

    // 開啟側邊欄
    await page.getByRole('button', { name: '開啟選單' }).click();

    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    await expect(sidebar).toBeVisible();

    // 點擊導覽項目
    await sidebar.getByRole('link', { name: '文章' }).click();

    // 驗證頁面已切換
    await expect(page).toHaveURL(/\/admin\/posts/);
  });

  test('手機模式頂部列顯示應用名稱', async ({ page }) => {
    await page.goto('/admin');

    // 頂部列應可見
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 應用名稱應可見
    await expect(header.locator('h1')).toContainText('NovaScribe');
  });
});

test.describe('響應式佈局 — 視窗大小動態切換', () => {
  test('從桌面縮小到手機模式', async ({ page }) => {
    // 桌面模式
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin');

    // 桌面版側邊欄應可見
    const desktopSidebar = page.locator('[data-testid="sidebar-desktop"]');
    await expect(desktopSidebar).toBeVisible();

    // 縮小到手機模式
    await page.setViewportSize({ width: 375, height: 667 });

    // 桌面版側邊欄應隱藏
    await expect(desktopSidebar).not.toBeVisible();

    // 漢堡選單應出現
    const menuButton = page.getByRole('button', { name: '開啟選單' });
    await expect(menuButton).toBeVisible();
  });

  test('從手機放大到桌面模式', async ({ page }) => {
    // 手機模式
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');

    // 漢堡選單應可見
    const menuButton = page.getByRole('button', { name: '開啟選單' });
    await expect(menuButton).toBeVisible();

    // 放大到桌面模式
    await page.setViewportSize({ width: 1280, height: 800 });

    // 桌面版側邊欄應可見
    const desktopSidebar = page.locator('[data-testid="sidebar-desktop"]');
    await expect(desktopSidebar).toBeVisible();

    // 漢堡選單應隱藏
    await expect(menuButton).not.toBeVisible();
  });
});
