/**
 * @file 儀表板 E2E 測試
 * @description 測試儀表板：統計數據顯示、快速操作導航
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號與範例資料
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';

/** 導航到儀表板 */
async function navigateToDashboard(page: Page) {
  await page.goto('/admin');
  await expect(page.locator('h1')).toContainText('儀表板');
}

test.describe.skip('儀表板 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page);
  });

  test('統計卡片顯示', async ({ page }) => {
    // 驗證統計卡片區域
    const statsSection = page.locator(
      '[data-testid="stats-section"], .stats-section, .dashboard-stats'
    );
    await expect(statsSection).toBeVisible();

    // 驗證文章總數卡片
    const postCountCard = page.locator(
      '[data-testid="stat-posts"], .stat-card'
    ).filter({ hasText: '文章' });
    await expect(postCountCard).toBeVisible();
    // 數字應為非負整數
    const postCount = await postCountCard.locator('.stat-value, [data-testid="stat-value"]').innerText();
    expect(Number(postCount)).toBeGreaterThanOrEqual(0);

    // 驗證分類數量卡片
    const categoryCard = page.locator(
      '[data-testid="stat-categories"], .stat-card'
    ).filter({ hasText: '分類' });
    await expect(categoryCard).toBeVisible();

    // 驗證標籤數量卡片
    const tagCard = page.locator(
      '[data-testid="stat-tags"], .stat-card'
    ).filter({ hasText: '標籤' });
    await expect(tagCard).toBeVisible();

    // 驗證媒體數量卡片
    const mediaCard = page.locator(
      '[data-testid="stat-media"], .stat-card'
    ).filter({ hasText: '媒體' });
    await expect(mediaCard).toBeVisible();
  });

  test('已發佈與草稿文章數量', async ({ page }) => {
    // 驗證已發佈文章統計
    const publishedStat = page.locator(
      '[data-testid="stat-published"], .stat-card'
    ).filter({ hasText: '已發佈' });
    await expect(publishedStat).toBeVisible();

    // 驗證草稿文章統計
    const draftStat = page.locator(
      '[data-testid="stat-drafts"], .stat-card'
    ).filter({ hasText: '草稿' });
    await expect(draftStat).toBeVisible();
  });

  test('近期活動時間線', async ({ page }) => {
    // 驗證近期活動區域
    const activitySection = page.locator(
      '[data-testid="activity-section"], .activity-section, .recent-activity'
    );
    await expect(activitySection).toBeVisible();

    // 驗證活動標題
    await expect(activitySection.getByText('近期活動')).toBeVisible();

    // 驗證活動列表有項目（如果有資料）
    const activityItems = activitySection.locator(
      '[data-testid="activity-item"], .activity-item'
    );
    const count = await activityItems.count();

    if (count > 0) {
      // 每個活動項目應顯示時間
      const firstItem = activityItems.first();
      await expect(firstItem).toBeVisible();

      // 應有時間資訊
      await expect(
        firstItem.locator('time, [data-testid="activity-time"]')
      ).toBeVisible();
    }
  });

  test('快速操作捷徑', async ({ page }) => {
    // 驗證快速操作區域
    const quickActions = page.locator(
      '[data-testid="quick-actions"], .quick-actions'
    );
    await expect(quickActions).toBeVisible();

    // 驗證「新增文章」快捷連結
    const newPostLink = quickActions.getByRole('link', { name: '新增文章' });
    await expect(newPostLink).toBeVisible();

    // 點擊新增文章
    await newPostLink.click();
    await expect(page).toHaveURL(/\/admin\/posts\/new/);

    // 返回儀表板
    await navigateToDashboard(page);

    // 驗證「管理分類」快捷連結
    const manageCategoriesLink = quickActions.getByRole('link', {
      name: '管理分類',
    });
    await expect(manageCategoriesLink).toBeVisible();

    // 點擊管理分類
    await manageCategoriesLink.click();
    await expect(page).toHaveURL(/\/admin\/categories/);

    // 返回儀表板
    await navigateToDashboard(page);

    // 驗證「管理標籤」快捷連結
    const manageTagsLink = quickActions.getByRole('link', {
      name: '管理標籤',
    });
    await expect(manageTagsLink).toBeVisible();

    // 點擊管理標籤
    await manageTagsLink.click();
    await expect(page).toHaveURL(/\/admin\/tags/);
  });

  test('快速操作導航到媒體管理', async ({ page }) => {
    const quickActions = page.locator(
      '[data-testid="quick-actions"], .quick-actions'
    );

    // 驗證「上傳媒體」快捷連結
    const uploadMediaLink = quickActions.getByRole('link', {
      name: '上傳媒體',
    });

    if (await uploadMediaLink.isVisible()) {
      await uploadMediaLink.click();
      await expect(page).toHaveURL(/\/admin\/media/);
    }
  });

  test('儀表板載入效能', async ({ page }) => {
    // 測量頁面載入時間
    const startTime = Date.now();

    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('儀表板');

    // 等待統計資料載入
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/dashboard') && res.status() === 200,
      { timeout: 5000 }
    );

    const loadTime = Date.now() - startTime;

    // 儀表板應在 5 秒內載入完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('儀表板響應式佈局', async ({ page }) => {
    // 桌面視窗
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateToDashboard(page);

    // 統計卡片應為網格佈局
    const statsSection = page.locator(
      '[data-testid="stats-section"], .stats-section, .dashboard-stats'
    );
    await expect(statsSection).toBeVisible();

    // 手機視窗
    await page.setViewportSize({ width: 375, height: 667 });

    // 統計卡片應堆疊顯示
    await expect(statsSection).toBeVisible();

    // 側邊欄可能隱藏
    const sidebar = page.locator('nav[aria-label="側邊欄"]');
    // 在手機視窗上側邊欄可能需要點擊漢堡選單才會顯示
    const isSidebarVisible = await sidebar.isVisible();
    if (!isSidebarVisible) {
      // 應有漢堡選單按鈕
      const menuButton = page.getByRole('button', { name: '選單' });
      await expect(menuButton).toBeVisible();
    }
  });
});
