/**
 * @file 分類管理 E2E 測試
 * @description 測試分類完整流程：建立 → 編輯 → 刪除
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';

/** 測試用分類資料 */
const TEST_CATEGORY = {
  name: 'E2E 測試分類',
  slug: 'e2e-test-category',
  description: '用於 E2E 測試的分類',
};

const UPDATED_CATEGORY = {
  name: 'E2E 測試分類（已更新）',
  description: '更新後的分類描述',
};

const CHILD_CATEGORY = {
  name: 'E2E 子分類',
  slug: 'e2e-child-category',
  description: '用於測試父子關係的子分類',
};

/** 導航到分類管理頁面 */
async function navigateToCategoriesPage(page: Page) {
  await page.goto('/admin/categories');
  await expect(page.locator('h1')).toContainText('分類');
}

test.describe.skip('分類管理 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategoriesPage(page);
  });

  test('建立新分類', async ({ page }) => {
    // 點擊新增分類按鈕
    await page.getByRole('button', { name: '新增分類' }).click();

    // 填寫分類表單
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('名稱').fill(TEST_CATEGORY.name);
    await dialog.getByLabel('Slug').fill(TEST_CATEGORY.slug);
    await dialog.getByLabel('描述').fill(TEST_CATEGORY.description);

    // 提交表單
    await dialog.getByRole('button', { name: '建立' }).click();

    // 驗證成功
    await expect(page.getByText('分類已建立')).toBeVisible();
    await expect(page.getByText(TEST_CATEGORY.name)).toBeVisible();
  });

  test('建立子分類', async ({ page }) => {
    // 點擊新增分類按鈕
    await page.getByRole('button', { name: '新增分類' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 填寫子分類表單
    await dialog.getByLabel('名稱').fill(CHILD_CATEGORY.name);
    await dialog.getByLabel('Slug').fill(CHILD_CATEGORY.slug);
    await dialog.getByLabel('描述').fill(CHILD_CATEGORY.description);

    // 選擇父分類
    await dialog.getByLabel('父分類').selectOption({ label: TEST_CATEGORY.name });

    // 提交
    await dialog.getByRole('button', { name: '建立' }).click();

    // 驗證成功
    await expect(page.getByText('分類已建立')).toBeVisible();
    await expect(page.getByText(CHILD_CATEGORY.name)).toBeVisible();
  });

  test('編輯分類', async ({ page }) => {
    // 找到測試分類並點擊編輯
    const row = page.locator('tr, [data-testid="category-item"]', {
      hasText: TEST_CATEGORY.name,
    });
    await row.getByRole('button', { name: '編輯' }).click();

    // 修改分類資料
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByLabel('名稱');
    await nameInput.clear();
    await nameInput.fill(UPDATED_CATEGORY.name);

    const descInput = dialog.getByLabel('描述');
    await descInput.clear();
    await descInput.fill(UPDATED_CATEGORY.description);

    // 提交更新
    await dialog.getByRole('button', { name: '更新' }).click();

    // 驗證成功
    await expect(page.getByText('分類已更新')).toBeVisible();
    await expect(page.getByText(UPDATED_CATEGORY.name)).toBeVisible();
  });

  test('刪除子分類', async ({ page }) => {
    // 先刪除子分類
    const childRow = page.locator('tr, [data-testid="category-item"]', {
      hasText: CHILD_CATEGORY.name,
    });
    await childRow.getByRole('button', { name: '刪除' }).click();

    // 確認刪除對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('確定要刪除此分類？')).toBeVisible();
    await dialog.getByRole('button', { name: '確認刪除' }).click();

    // 驗證子分類已移除
    await expect(page.getByText(CHILD_CATEGORY.name)).not.toBeVisible();
  });

  test('刪除父分類', async ({ page }) => {
    // 刪除父分類
    const row = page.locator('tr, [data-testid="category-item"]', {
      hasText: UPDATED_CATEGORY.name,
    });
    await row.getByRole('button', { name: '刪除' }).click();

    // 確認刪除
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '確認刪除' }).click();

    // 驗證分類已移除
    await expect(page.getByText(UPDATED_CATEGORY.name)).not.toBeVisible();
  });

  test('分類列表顯示文章數量', async ({ page }) => {
    // 驗證每個分類都顯示了關聯的文章數量
    const categoryItems = page.locator('tr, [data-testid="category-item"]');
    const count = await categoryItems.count();

    for (let i = 0; i < count; i++) {
      const item = categoryItems.nth(i);
      // 應該有數字顯示文章數
      await expect(item.locator('[data-testid="post-count"], .post-count')).toBeVisible();
    }
  });
});
