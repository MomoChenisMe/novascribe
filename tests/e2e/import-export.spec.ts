/**
 * @file 匯入匯出 E2E 測試
 * @description 測試匯入匯出完整流程：匯出 → 下載驗證 → 匯入
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號與範例文章
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/** 導航到文章列表 */
async function navigateToPostsPage(page: Page) {
  await page.goto('/admin/posts');
  await expect(page.locator('h1')).toContainText('文章');
}

test.describe.skip('匯入匯出 E2E @skip-no-db', () => {
  /** 儲存匯出檔案路徑以供匯入測試使用 */
  let exportedFilePath: string;

  test('匯出單篇文章為 Markdown', async ({ page }) => {
    await navigateToPostsPage(page);

    // 選擇一篇文章
    const row = page.locator('tr').nth(1); // 第一篇文章
    const postTitle = await row.locator('td').first().innerText();

    // 點擊匯出按鈕（或透過更多選單）
    await row.getByRole('button', { name: '更多' }).click();
    await page.getByRole('menuitem', { name: '匯出' }).click();

    // 等待下載
    const download = await page.waitForEvent('download');

    // 驗證下載檔案名稱
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.md$/);

    // 儲存下載的檔案
    exportedFilePath = path.join(__dirname, '../../tmp', filename);
    await download.saveAs(exportedFilePath);

    // 驗證檔案存在且有內容
    expect(fs.existsSync(exportedFilePath)).toBe(true);
    const content = fs.readFileSync(exportedFilePath, 'utf-8');
    expect(content).toContain('---'); // front matter
    expect(content.length).toBeGreaterThan(0);
  });

  test('批次匯出文章為 ZIP', async ({ page }) => {
    await navigateToPostsPage(page);

    // 勾選多篇文章
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // 點擊批次匯出
    await page.getByRole('button', { name: '批次操作' }).click();
    await page.getByRole('menuitem', { name: '批次匯出' }).click();

    // 等待 ZIP 下載
    const download = await page.waitForEvent('download');

    // 驗證下載檔案
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.zip$/);

    // 儲存 ZIP 檔案
    const zipPath = path.join(__dirname, '../../tmp', filename);
    await download.saveAs(zipPath);

    // 驗證 ZIP 檔案存在
    expect(fs.existsSync(zipPath)).toBe(true);

    // 驗證 ZIP 檔案大小大於 0
    const stat = fs.statSync(zipPath);
    expect(stat.size).toBeGreaterThan(0);
  });

  test('驗證匯出的 Markdown 包含 front matter', async ({ page }) => {
    // 此測試依賴於上面的匯出測試
    if (!exportedFilePath || !fs.existsSync(exportedFilePath)) {
      test.skip();
      return;
    }

    const content = fs.readFileSync(exportedFilePath, 'utf-8');

    // 驗證 front matter 格式
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('title:');
    expect(content).toContain('slug:');
    expect(content).toContain('status:');
    expect(content).toContain('---');

    // 驗證文章內容在 front matter 之後
    const parts = content.split('---');
    expect(parts.length).toBeGreaterThanOrEqual(3);

    // front matter 後的內容不應為空
    const body = parts.slice(2).join('---').trim();
    expect(body.length).toBeGreaterThan(0);
  });

  test('匯入 Markdown 文章', async ({ page }) => {
    await navigateToPostsPage(page);

    // 點擊匯入按鈕
    await page.getByRole('button', { name: '匯入' }).click();

    // 匯入對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 上傳 Markdown 檔案
    const fileInput = dialog.locator('input[type="file"]');
    const testMdPath = path.join(__dirname, '../../fixtures/test-import.md');

    // 建立測試用 Markdown 檔案（含 front matter）
    const testContent = `---
title: E2E 匯入測試文章
slug: e2e-import-test
status: DRAFT
tags:
  - 測試
  - E2E
---

# E2E 匯入測試

這是透過匯入功能建立的文章。

## 特色

- 支援 front matter 解析
- 自動建立不存在的標籤
- 保留 Markdown 格式
`;

    // 使用 Playwright 的 setInputFiles
    await fileInput.setInputFiles({
      name: 'test-import.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(testContent),
    });

    // 點擊匯入
    await dialog.getByRole('button', { name: '開始匯入' }).click();

    // 驗證匯入成功
    await expect(page.getByText('匯入成功')).toBeVisible();

    // 驗證文章出現在列表中
    await navigateToPostsPage(page);
    await expect(page.getByText('E2E 匯入測試文章')).toBeVisible();
  });

  test('匯入後文章資料正確', async ({ page }) => {
    await navigateToPostsPage(page);

    // 找到匯入的文章
    const row = page.locator('tr', { hasText: 'E2E 匯入測試文章' });
    await expect(row).toBeVisible();

    // 進入編輯頁面驗證內容
    await row.getByRole('link', { name: '編輯' }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/.*\/edit/);

    // 驗證標題
    await expect(page.getByLabel('標題')).toHaveValue('E2E 匯入測試文章');

    // 驗證 Slug
    await expect(page.getByLabel('Slug')).toHaveValue('e2e-import-test');

    // 驗證內容包含 Markdown 文字
    const editor = page.locator('.bytemd-editor textarea, [role="textbox"]');
    const content = await editor.inputValue();
    expect(content).toContain('E2E 匯入測試');
  });

  test('匯入無效檔案應顯示錯誤', async ({ page }) => {
    await navigateToPostsPage(page);

    await page.getByRole('button', { name: '匯入' }).click();

    const dialog = page.getByRole('dialog');
    const fileInput = dialog.locator('input[type="file"]');

    // 上傳非 Markdown 檔案
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not a valid markdown with front matter'),
    });

    await dialog.getByRole('button', { name: '開始匯入' }).click();

    // 驗證錯誤訊息
    await expect(
      page.getByText('匯入失敗').or(page.getByText('格式不正確'))
    ).toBeVisible();
  });

  // 清理
  test('清理匯入的測試文章', async ({ page }) => {
    await navigateToPostsPage(page);

    const row = page.locator('tr', { hasText: 'E2E 匯入測試文章' });
    if (await row.isVisible()) {
      await row.getByRole('button', { name: '刪除' }).click();

      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: '確認刪除' }).click();

      await expect(page.getByText('E2E 匯入測試文章')).not.toBeVisible();
    }
  });
});
