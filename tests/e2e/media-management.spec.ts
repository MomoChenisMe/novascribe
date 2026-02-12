/**
 * @file 媒體管理 E2E 測試
 * @description 測試媒體完整流程：上傳 → 瀏覽 → 刪除
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 */

import { test, expect, type Page } from '@playwright/test';
import path from 'path';

/** 測試用圖片名稱 */
const TEST_IMAGE_NAME = 'e2e-test-image.png';

/** 導航到媒體管理頁面 */
async function navigateToMediaPage(page: Page) {
  await page.goto('/admin/media');
  await expect(page.locator('h1')).toContainText('媒體');
}

test.describe.skip('媒體管理 E2E @skip-no-db', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToMediaPage(page);
  });

  test('上傳圖片', async ({ page }) => {
    // 找到檔案上傳區域
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-area');
    await expect(uploadArea).toBeVisible();

    // 準備測試用圖片（使用 Playwright 的 fileChooser）
    const fileInput = page.locator('input[type="file"]');

    // 建立一個簡單的測試圖片 Buffer
    // 在實際環境中使用真實的測試圖片
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadArea.click(),
    ]);

    // 上傳測試圖片
    await fileChooser.setFiles(
      path.join(__dirname, '../../fixtures/test-image.png')
    );

    // 等待上傳完成
    await expect(page.getByText('上傳成功')).toBeVisible({ timeout: 10000 });

    // 驗證圖片出現在媒體庫
    await expect(
      page.locator('[data-testid="media-item"], .media-item').first()
    ).toBeVisible();
  });

  test('瀏覽媒體庫', async ({ page }) => {
    // 驗證媒體網格渲染
    const mediaGrid = page.locator(
      '[data-testid="media-grid"], .media-grid'
    );
    await expect(mediaGrid).toBeVisible();

    // 驗證有媒體項目
    const items = page.locator('[data-testid="media-item"], .media-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // 點擊第一個項目查看詳細資訊
    await items.first().click();

    // 驗證詳細資訊面板
    const detailPanel = page.locator(
      '[data-testid="media-detail"], .media-detail'
    );
    await expect(detailPanel).toBeVisible();

    // 驗證顯示檔案資訊
    await expect(detailPanel.getByText('檔案名稱')).toBeVisible();
    await expect(detailPanel.getByText('檔案大小')).toBeVisible();
  });

  test('複製媒體 URL', async ({ page }) => {
    // 點擊第一個媒體項目
    const items = page.locator('[data-testid="media-item"], .media-item');
    await items.first().click();

    // 點擊複製 URL 按鈕
    await page.getByRole('button', { name: '複製連結' }).click();

    // 驗證複製成功訊息
    await expect(page.getByText('已複製')).toBeVisible();
  });

  test('分頁瀏覽', async ({ page }) => {
    // 檢查是否有分頁控制元件
    const pagination = page.locator('[data-testid="pagination"], .pagination');

    // 如果有多頁，測試分頁
    if (await pagination.isVisible()) {
      const nextButton = pagination.getByRole('button', { name: '下一頁' });

      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // 等待載入
        await page.waitForResponse((res) =>
          res.url().includes('/api/admin/media') && res.status() === 200
        );

        // 驗證頁面更新
        const items = page.locator('[data-testid="media-item"], .media-item');
        expect(await items.count()).toBeGreaterThan(0);
      }
    }
  });

  test('刪除媒體', async ({ page }) => {
    // 找到媒體項目
    const items = page.locator('[data-testid="media-item"], .media-item');
    const initialCount = await items.count();

    // 點擊第一個項目
    await items.first().click();

    // 點擊刪除按鈕
    await page.getByRole('button', { name: '刪除' }).click();

    // 確認刪除對話框
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('確定要刪除此媒體？')).toBeVisible();
    await dialog.getByRole('button', { name: '確認刪除' }).click();

    // 驗證刪除成功
    await expect(page.getByText('媒體已刪除')).toBeVisible();

    // 驗證項目數量減少
    const finalCount = await items.count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('拖拽上傳', async ({ page }) => {
    // 驗證拖拽上傳區域存在
    const dropZone = page.locator(
      '[data-testid="upload-area"], .upload-area'
    );
    await expect(dropZone).toBeVisible();

    // 驗證拖拽提示文字
    await expect(dropZone.getByText('拖拽')).toBeVisible();
  });

  test('不支援的檔案格式應顯示錯誤', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-area');

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadArea.click(),
    ]);

    // 嘗試上傳不支援的檔案格式
    await fileChooser.setFiles(
      path.join(__dirname, '../../fixtures/test-file.exe')
    );

    // 驗證錯誤訊息
    await expect(page.getByText('不支援的檔案格式')).toBeVisible();
  });
});
