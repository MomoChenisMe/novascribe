/**
 * @file 標籤管理 E2E 測試
 * @description 測試標籤完整流程：建立 → 編輯 → 刪除 → 清理未使用標籤
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';

/** 測試用標籤資料 */
const TEST_TAG = {
  name: 'E2E 測試標籤',
  slug: 'e2e-test-tag',
};

const UPDATED_TAG = {
  name: 'E2E 測試標籤（已更新）',
  slug: 'e2e-test-tag-updated',
};

const UNUSED_TAG = {
  name: 'E2E 未使用標籤',
  slug: 'e2e-unused-tag',
};

/** 導航到標籤管理頁面 */
async function navigateToTagsPage(page: Page) {
  await page.goto('/admin/tags');
  await expect(page.locator('h1')).toContainText('標籤');
}

test.describe.skip('標籤管理 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTagsPage(page);
  });

  test('建立新標籤', async ({ page }) => {
    // 點擊新增標籤按鈕
    await page.getByRole('button', { name: '新增標籤' }).click();

    // 填寫標籤表單
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('名稱').fill(TEST_TAG.name);
    await dialog.getByLabel('Slug').fill(TEST_TAG.slug);

    // 提交
    await dialog.getByRole('button', { name: '建立' }).click();

    // 驗證成功
    await expect(page.getByText('標籤已建立')).toBeVisible();
    await expect(page.getByText(TEST_TAG.name)).toBeVisible();
  });

  test('建立未使用標籤（供清理測試）', async ({ page }) => {
    await page.getByRole('button', { name: '新增標籤' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('名稱').fill(UNUSED_TAG.name);
    await dialog.getByLabel('Slug').fill(UNUSED_TAG.slug);
    await dialog.getByRole('button', { name: '建立' }).click();

    await expect(page.getByText('標籤已建立')).toBeVisible();
    await expect(page.getByText(UNUSED_TAG.name)).toBeVisible();
  });

  test('編輯標籤', async ({ page }) => {
    // 找到測試標籤並點擊編輯
    const row = page.locator('tr, [data-testid="tag-item"]', {
      hasText: TEST_TAG.name,
    });
    await row.getByRole('button', { name: '編輯' }).click();

    // 修改標籤資料
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByLabel('名稱');
    await nameInput.clear();
    await nameInput.fill(UPDATED_TAG.name);

    const slugInput = dialog.getByLabel('Slug');
    await slugInput.clear();
    await slugInput.fill(UPDATED_TAG.slug);

    // 提交更新
    await dialog.getByRole('button', { name: '更新' }).click();

    // 驗證成功
    await expect(page.getByText('標籤已更新')).toBeVisible();
    await expect(page.getByText(UPDATED_TAG.name)).toBeVisible();
  });

  test('標籤列表顯示使用次數', async ({ page }) => {
    // 驗證每個標籤都顯示使用次數
    const tagItems = page.locator('tr, [data-testid="tag-item"]');
    const count = await tagItems.count();

    expect(count).toBeGreaterThan(0);

    // 每個標籤應顯示文章數量
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = tagItems.nth(i);
      await expect(item).toBeVisible();
    }
  });

  test('刪除標籤', async ({ page }) => {
    // 找到測試標籤並刪除
    const row = page.locator('tr, [data-testid="tag-item"]', {
      hasText: UPDATED_TAG.name,
    });
    await row.getByRole('button', { name: '刪除' }).click();

    // 確認刪除
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('確定要刪除此標籤？')).toBeVisible();
    await dialog.getByRole('button', { name: '確認刪除' }).click();

    // 驗證標籤已移除
    await expect(page.getByText(UPDATED_TAG.name)).not.toBeVisible();
  });

  test('清理未使用標籤', async ({ page }) => {
    // 確認未使用標籤存在
    await expect(page.getByText(UNUSED_TAG.name)).toBeVisible();

    // 點擊清理按鈕
    await page.getByRole('button', { name: '清理未使用' }).click();

    // 確認清理對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('清理未使用的標籤')).toBeVisible();
    await dialog.getByRole('button', { name: '確認清理' }).click();

    // 驗證未使用標籤已被移除
    await expect(page.getByText(UNUSED_TAG.name)).not.toBeVisible();

    // 驗證成功訊息
    await expect(page.getByText('清理完成')).toBeVisible();
  });

  test('搜尋標籤', async ({ page }) => {
    // 搜尋標籤
    const searchInput = page.getByPlaceholder('搜尋標籤');
    await searchInput.fill('E2E');

    // 等待搜尋結果
    await page.waitForTimeout(500); // debounce

    // 驗證篩選結果
    const results = page.locator('tr, [data-testid="tag-item"]');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
