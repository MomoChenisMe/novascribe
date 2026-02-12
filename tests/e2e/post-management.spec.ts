/**
 * @file 文章管理 E2E 測試
 * @description 測試文章完整生命週期：建立 → 編輯 → 發佈 → 下架
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

/** 測試用文章資料 */
const TEST_POST = {
  title: 'E2E 測試文章',
  slug: 'e2e-test-post',
  content: '這是 E2E 測試的文章內容，用於驗證完整的文章管理流程。',
  excerpt: 'E2E 測試摘要',
};

const UPDATED_POST = {
  title: 'E2E 測試文章（已更新）',
  content: '這是更新後的文章內容。',
};

/** 導航到文章管理頁面 */
async function navigateToPostsPage(page: Page) {
  await page.goto('/admin/posts');
  await expect(page.locator('h1')).toContainText('文章');
}

test.describe.skip('文章管理 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostsPage(page);
  });

  test('建立新文章', async ({ page }) => {
    // 點擊新增文章按鈕
    await page.getByRole('link', { name: '新增文章' }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/new/);

    // 填寫文章表單
    await page.getByLabel('標題').fill(TEST_POST.title);
    await page.getByLabel('Slug').fill(TEST_POST.slug);
    await page.getByLabel('摘要').fill(TEST_POST.excerpt);

    // 填寫 Markdown 內容
    const editor = page.locator('.bytemd-editor textarea, [role="textbox"]');
    await editor.fill(TEST_POST.content);

    // 提交表單
    await page.getByRole('button', { name: '儲存' }).click();

    // 驗證成功訊息
    await expect(page.getByText('文章已建立')).toBeVisible();

    // 驗證導回文章列表
    await expect(page).toHaveURL(/\/admin\/posts/);

    // 驗證文章出現在列表中
    await expect(page.getByText(TEST_POST.title)).toBeVisible();
  });

  test('編輯文章', async ({ page }) => {
    // 找到測試文章並點擊編輯
    const row = page.locator('tr', { hasText: TEST_POST.title });
    await row.getByRole('link', { name: '編輯' }).click();

    await expect(page).toHaveURL(/\/admin\/posts\/.*\/edit/);

    // 修改標題
    const titleInput = page.getByLabel('標題');
    await titleInput.clear();
    await titleInput.fill(UPDATED_POST.title);

    // 修改內容
    const editor = page.locator('.bytemd-editor textarea, [role="textbox"]');
    await editor.clear();
    await editor.fill(UPDATED_POST.content);

    // 提交更新
    await page.getByRole('button', { name: '更新' }).click();

    // 驗證成功訊息
    await expect(page.getByText('文章已更新')).toBeVisible();

    // 驗證列表中顯示更新後的標題
    await navigateToPostsPage(page);
    await expect(page.getByText(UPDATED_POST.title)).toBeVisible();
  });

  test('發佈文章', async ({ page }) => {
    // 找到測試文章
    const row = page.locator('tr', { hasText: UPDATED_POST.title });

    // 點擊狀態切換或發佈按鈕
    await row.getByRole('button', { name: '發佈' }).click();

    // 確認發佈對話框
    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: '確認' }).click();
    }

    // 驗證狀態變為「已發佈」
    await expect(row.getByText('已發佈')).toBeVisible();
  });

  test('下架文章', async ({ page }) => {
    // 找到已發佈的測試文章
    const row = page.locator('tr', { hasText: UPDATED_POST.title });

    // 點擊下架按鈕
    await row.getByRole('button', { name: '下架' }).click();

    // 確認下架對話框
    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: '確認' }).click();
    }

    // 驗證狀態變為「已封存」
    await expect(row.getByText('已封存')).toBeVisible();
  });

  test('刪除文章', async ({ page }) => {
    // 找到測試文章
    const row = page.locator('tr', { hasText: UPDATED_POST.title });

    // 點擊刪除按鈕
    await row.getByRole('button', { name: '刪除' }).click();

    // 確認刪除對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '確認刪除' }).click();

    // 驗證文章從列表中移除
    await expect(page.getByText(UPDATED_POST.title)).not.toBeVisible();
  });

  test('文章列表篩選與搜尋', async ({ page }) => {
    // 搜尋功能
    const searchInput = page.getByPlaceholder('搜尋文章');
    await searchInput.fill('E2E');
    await page.keyboard.press('Enter');

    // 等待結果載入
    await page.waitForResponse((res) =>
      res.url().includes('/api/admin/posts') && res.status() === 200
    );

    // 狀態篩選
    const statusFilter = page.getByLabel('狀態');
    await statusFilter.selectOption('DRAFT');

    // 等待篩選結果
    await page.waitForResponse((res) =>
      res.url().includes('/api/admin/posts') && res.status() === 200
    );
  });

  test('批次操作', async ({ page }) => {
    // 勾選多篇文章
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count >= 3) {
      await checkboxes.nth(1).check(); // 第一篇（跳過全選）
      await checkboxes.nth(2).check(); // 第二篇

      // 批次發佈
      await page.getByRole('button', { name: '批次操作' }).click();
      await page.getByRole('menuitem', { name: '批次發佈' }).click();

      // 確認對話框
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: '確認' }).click();

      // 驗證操作成功
      await expect(page.getByText('批次操作完成')).toBeVisible();
    }
  });
});
