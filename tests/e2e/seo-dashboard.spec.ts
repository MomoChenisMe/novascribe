/**
 * @file SEO 儀表板 E2E 測試
 * @description 測試 SEO 儀表板完整功能：
 *   - 存取 /admin/seo 儀表板
 *   - 查看概覽統計（平均評分、完整 SEO 文章數、缺少 meta 文章數）
 *   - 檢視缺少 SEO 清單
 *   - 點擊快速編輯連結
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號與範例資料
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 *
 * 注意：測試假設使用者已通過 auth.setup.ts 登入。
 */

import { test, expect, type Page } from '@playwright/test';

/** 導航到 SEO 儀表板 */
async function navigateToSeoDashboard(page: Page) {
  await page.goto('/admin/seo');
  await expect(page.locator('h1')).toContainText('SEO 儀表板');
}

test.describe.skip('SEO 儀表板 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSeoDashboard(page);
  });

  test('儀表板頁面應正常載入', async ({ page }) => {
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('SEO 儀表板');

    // 驗證全站 SEO 設定連結
    const settingsLink = page.getByRole('link', { name: '全站 SEO 設定' });
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toHaveAttribute('href', '/admin/seo/settings');
  });

  test('概覽卡片應顯示統計數據', async ({ page }) => {
    // 等待 API 回應
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/dashboard') && res.status() === 200,
      { timeout: 10000 }
    );

    // 驗證概覽卡片區域
    const cards = page.locator('[data-testid="seo-overview-card"]');
    await expect(cards).toHaveCount(4);

    // 驗證「平均 SEO 評分」卡片
    const scoreCard = cards.filter({ hasText: '平均 SEO 評分' });
    await expect(scoreCard).toBeVisible();

    const scoreValue = scoreCard.locator('[data-testid="card-value"]');
    await expect(scoreValue).toBeVisible();
    // 評分值應包含 /100 格式
    const scoreText = await scoreValue.innerText();
    expect(scoreText).toMatch(/\d+\/100/);

    // 驗證「文章總數」卡片
    const totalPostsCard = cards.filter({ hasText: '文章總數' });
    await expect(totalPostsCard).toBeVisible();

    const totalValue = totalPostsCard.locator('[data-testid="card-value"]');
    const totalText = await totalValue.innerText();
    expect(Number(totalText)).toBeGreaterThanOrEqual(0);

    // 驗證「SEO 完善」卡片
    const completeCard = cards.filter({ hasText: 'SEO 完善' });
    await expect(completeCard).toBeVisible();

    // 應有描述文字
    const completeDesc = completeCard.locator(
      '[data-testid="card-description"]'
    );
    await expect(completeDesc).toContainText('評分 ≥ 80 分');

    // 驗證「缺少 Meta」卡片
    const missingCard = cards.filter({ hasText: '缺少 Meta' });
    await expect(missingCard).toBeVisible();

    const missingDesc = missingCard.locator(
      '[data-testid="card-description"]'
    );
    await expect(missingDesc).toContainText('缺少 title 或 description');
  });

  test('缺少 SEO 清單應正常顯示', async ({ page }) => {
    // 等待資料載入
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/dashboard') && res.status() === 200,
      { timeout: 10000 }
    );

    // 檢查缺少 SEO 清單或全部完善訊息
    const missingList = page.locator('[data-testid="missing-seo-list"]');
    const allComplete = page.locator('[data-testid="all-complete"]');

    // 兩者應有一個可見
    const hasMissing = await missingList.isVisible();
    const isAllComplete = await allComplete.isVisible();
    expect(hasMissing || isAllComplete).toBe(true);

    if (hasMissing) {
      // 驗證清單標題
      await expect(missingList.locator('h3')).toContainText(
        '缺少 SEO 資料的文章'
      );

      // 驗證清單項目
      const items = missingList.locator('[data-testid="missing-seo-item"]');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);

      // 每個項目應有文章標題
      const firstItem = items.first();
      await expect(firstItem.locator('p.font-medium')).toBeVisible();

      // 應有缺少欄位標記
      const hasMissingTitle = await firstItem
        .locator('[data-testid="missing-title"]')
        .isVisible();
      const hasMissingDescription = await firstItem
        .locator('[data-testid="missing-description"]')
        .isVisible();
      expect(hasMissingTitle || hasMissingDescription).toBe(true);
    }

    if (isAllComplete) {
      await expect(allComplete).toContainText('所有文章的 SEO 設定已完善');
    }
  });

  test('快速編輯連結應導航到文章編輯頁面', async ({ page }) => {
    // 等待資料載入
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/dashboard') && res.status() === 200,
      { timeout: 10000 }
    );

    const missingList = page.locator('[data-testid="missing-seo-list"]');

    if (await missingList.isVisible()) {
      // 取得第一個編輯連結
      const editLink = missingList
        .locator('[data-testid="edit-link"]')
        .first();
      await expect(editLink).toBeVisible();
      await expect(editLink).toHaveText('編輯 SEO');

      // 驗證連結指向正確路徑
      const href = await editLink.getAttribute('href');
      expect(href).toMatch(/\/admin\/posts\/[^/]+\/edit/);

      // 點擊連結
      await editLink.click();

      // 驗證導航到文章編輯頁面
      await expect(page).toHaveURL(/\/admin\/posts\/[^/]+\/edit/);
      await expect(page.locator('h1')).toContainText('編輯文章');
    }
  });

  test('改善建議應正常顯示（如有）', async ({ page }) => {
    // 等待資料載入
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/dashboard') && res.status() === 200,
      { timeout: 10000 }
    );

    // 改善建議區域（可能有也可能沒有）
    const suggestionItems = page.locator('[data-testid="suggestion-item"]');
    const count = await suggestionItems.count();

    if (count > 0) {
      // 應有改善建議標題
      await expect(page.getByText('改善建議')).toBeVisible();

      // 每個建議項目應有文字內容
      const firstSuggestion = suggestionItems.first();
      await expect(firstSuggestion).toBeVisible();

      // 建議應有不同類型的顏色（紅/黃/藍）
      const classes = await firstSuggestion.getAttribute('class');
      expect(classes).toBeTruthy();
    }
  });

  test('全站 SEO 設定連結應正確導航', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: '全站 SEO 設定' });
    await expect(settingsLink).toBeVisible();

    await settingsLink.click();

    await expect(page).toHaveURL(/\/admin\/seo\/settings/);
    await expect(page.locator('h1')).toContainText('全站 SEO 設定');
  });

  test('儀表板 API 應返回正確資料結構', async ({ page }) => {
    const response = await page.request.get('/api/admin/seo/dashboard');

    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();

    // 驗證 overview 結構
    const { overview } = json.data;
    expect(overview).toBeDefined();
    expect(typeof overview.totalPosts).toBe('number');
    expect(typeof overview.averageScore).toBe('number');
    expect(typeof overview.completeSeoCount).toBe('number');
    expect(typeof overview.missingMetaCount).toBe('number');

    // 驗證數值範圍
    expect(overview.totalPosts).toBeGreaterThanOrEqual(0);
    expect(overview.averageScore).toBeGreaterThanOrEqual(0);
    expect(overview.averageScore).toBeLessThanOrEqual(100);
    expect(overview.completeSeoCount).toBeGreaterThanOrEqual(0);
    expect(overview.missingMetaCount).toBeGreaterThanOrEqual(0);

    // 驗證 missingMetaPosts 結構
    expect(Array.isArray(json.data.missingMetaPosts)).toBe(true);

    if (json.data.missingMetaPosts.length > 0) {
      const firstPost = json.data.missingMetaPosts[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('slug');
      expect(typeof firstPost.hasTitle).toBe('boolean');
      expect(typeof firstPost.hasDescription).toBe('boolean');
    }

    // 驗證 suggestions 結構
    expect(Array.isArray(json.data.suggestions)).toBe(true);
  });

  test('儀表板載入效能', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/admin/seo');
    await expect(page.locator('h1')).toContainText('SEO 儀表板');

    // 等待資料載入完成
    await page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/dashboard') && res.status() === 200,
      { timeout: 10000 }
    );

    const loadTime = Date.now() - startTime;

    // 儀表板應在 10 秒內載入完成
    expect(loadTime).toBeLessThan(10000);
  });
});
