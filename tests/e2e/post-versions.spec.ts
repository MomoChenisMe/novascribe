/**
 * @file 版本歷史 E2E 測試
 * @description 測試版本歷史完整流程：建立文章 → 多次編輯 → 查看版本 → 回溯
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';

/** 測試用文章版本資料 */
const VERSIONS = {
  v1: {
    title: 'E2E 版本測試文章 v1',
    content: '這是版本 1 的內容。',
  },
  v2: {
    title: 'E2E 版本測試文章 v2',
    content: '這是版本 2 的內容，已更新。',
  },
  v3: {
    title: 'E2E 版本測試文章 v3',
    content: '這是版本 3 的內容，再次更新。',
  },
};

/** 導航到文章列表 */
async function navigateToPostsPage(page: Page) {
  await page.goto('/admin/posts');
  await expect(page.locator('h1')).toContainText('文章');
}

/** 建立文章 */
async function createPost(page: Page, title: string, content: string) {
  await page.goto('/admin/posts/new');
  await page.getByLabel('標題').fill(title);
  await page.getByLabel('Slug').fill('e2e-version-test');

  const editor = page.locator('.bytemd-editor textarea, [role="textbox"]');
  await editor.fill(content);

  await page.getByRole('button', { name: '儲存' }).click();
  await expect(page.getByText('文章已建立')).toBeVisible();
}

/** 編輯文章 */
async function editPost(page: Page, currentTitle: string, newTitle: string, newContent: string) {
  await navigateToPostsPage(page);

  const row = page.locator('tr', { hasText: currentTitle });
  await row.getByRole('link', { name: '編輯' }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/.*\/edit/);

  const titleInput = page.getByLabel('標題');
  await titleInput.clear();
  await titleInput.fill(newTitle);

  const editor = page.locator('.bytemd-editor textarea, [role="textbox"]');
  await editor.clear();
  await editor.fill(newContent);

  await page.getByRole('button', { name: '更新' }).click();
  await expect(page.getByText('文章已更新')).toBeVisible();
}

test.describe.skip('版本歷史 E2E @skip-no-db', () => {
  let postId: string;

  test('建立文章（版本 1）', async ({ page }) => {
    await createPost(page, VERSIONS.v1.title, VERSIONS.v1.content);

    // 記錄文章 ID（從 URL 取得）
    await navigateToPostsPage(page);
    const row = page.locator('tr', { hasText: VERSIONS.v1.title });
    const editLink = row.getByRole('link', { name: '編輯' });
    const href = await editLink.getAttribute('href');
    postId = href?.match(/\/admin\/posts\/(.+)\/edit/)?.[1] ?? '';
    expect(postId).toBeTruthy();
  });

  test('編輯文章產生版本 2', async ({ page }) => {
    await editPost(page, VERSIONS.v1.title, VERSIONS.v2.title, VERSIONS.v2.content);
  });

  test('編輯文章產生版本 3', async ({ page }) => {
    await editPost(page, VERSIONS.v2.title, VERSIONS.v3.title, VERSIONS.v3.content);
  });

  test('查看版本列表', async ({ page }) => {
    await navigateToPostsPage(page);

    // 找到文章並進入版本歷史頁面
    const row = page.locator('tr', { hasText: VERSIONS.v3.title });
    await row.getByRole('link', { name: '版本歷史' }).click();

    await expect(page).toHaveURL(/\/admin\/posts\/.*\/versions/);

    // 驗證版本列表
    const versionItems = page.locator(
      '[data-testid="version-item"], .version-item, tr'
    );
    // 至少應有 3 個版本
    expect(await versionItems.count()).toBeGreaterThanOrEqual(3);

    // 驗證版本號顯示
    await expect(page.getByText('版本 1')).toBeVisible();
    await expect(page.getByText('版本 2')).toBeVisible();
    await expect(page.getByText('版本 3')).toBeVisible();
  });

  test('查看版本內容', async ({ page }) => {
    // 導航到版本歷史頁面
    await page.goto(`/admin/posts/${postId}/versions`);

    // 點擊版本 1 查看內容
    await page.getByText('版本 1').click();

    // 驗證版本 1 的內容
    await expect(page.getByText(VERSIONS.v1.content)).toBeVisible();
    await expect(page.getByText(VERSIONS.v1.title)).toBeVisible();
  });

  test('版本差異比對', async ({ page }) => {
    await page.goto(`/admin/posts/${postId}/versions`);

    // 選擇兩個版本進行比對（如有差異比對 UI）
    const diffButton = page.getByRole('button', { name: '比對' });
    if (await diffButton.isVisible()) {
      await diffButton.click();

      // 驗證差異顯示
      const diffView = page.locator('[data-testid="diff-view"], .diff-view');
      await expect(diffView).toBeVisible();

      // 應顯示新增和刪除的內容
      await expect(diffView.locator('.diff-added, .addition')).toBeVisible();
      await expect(diffView.locator('.diff-removed, .deletion')).toBeVisible();
    }
  });

  test('回溯到版本 1', async ({ page }) => {
    await page.goto(`/admin/posts/${postId}/versions`);

    // 找到版本 1 並點擊回溯
    const version1Item = page.locator(
      '[data-testid="version-item"], .version-item, tr',
      { hasText: '版本 1' }
    );
    await version1Item.getByRole('button', { name: '回溯' }).click();

    // 確認回溯對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('確定要回溯到此版本？')).toBeVisible();
    await dialog.getByRole('button', { name: '確認回溯' }).click();

    // 驗證回溯成功
    await expect(page.getByText('已回溯到版本 1')).toBeVisible();

    // 驗證文章內容恢復為版本 1
    await page.goto(`/admin/posts/${postId}/edit`);
    await expect(page.getByLabel('標題')).toHaveValue(VERSIONS.v1.title);
  });

  test('回溯後版本數應增加', async ({ page }) => {
    await page.goto(`/admin/posts/${postId}/versions`);

    // 回溯會建立一個新版本（版本 4），內容與版本 1 相同
    const versionItems = page.locator(
      '[data-testid="version-item"], .version-item, tr'
    );
    expect(await versionItems.count()).toBeGreaterThanOrEqual(4);
  });

  // 清理：刪除測試文章
  test('清理測試文章', async ({ page }) => {
    await navigateToPostsPage(page);

    const row = page.locator('tr', { hasText: VERSIONS.v1.title });
    if (await row.isVisible()) {
      await row.getByRole('button', { name: '刪除' }).click();

      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: '確認刪除' }).click();

      await expect(page.getByText(VERSIONS.v1.title)).not.toBeVisible();
    }
  });
});
