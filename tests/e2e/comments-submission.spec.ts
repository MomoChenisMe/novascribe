/**
 * @file 前台評論提交 E2E 測試
 * @description 測試評論表單填寫、提交、驗證錯誤、rate limit
 * 
 * 測試場景：
 * - 12.1.1: 成功提交評論
 * - 12.1.2: 驗證錯誤（空欄位）
 * - 12.1.3: 驗證錯誤（Email 格式錯誤）
 * - 12.1.4: Rate limit（連續提交）
 */

import { test, expect } from '@playwright/test';

test.describe('Comment Submission', () => {
  let articleUrl: string;

  test.beforeEach(async ({ page }) => {
    // 前往首頁並進入第一篇文章
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]', { timeout: 10000 });
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    await page.waitForURL(/\/posts\/[^/]+$/);
    articleUrl = page.url();

    // 滾動到評論區
    const commentSection = page.locator('form').filter({ has: page.locator('textarea#content') });
    if (await commentSection.isVisible()) {
      await commentSection.scrollIntoViewIfNeeded();
    }
  });

  test('12.1.1: should submit comment successfully', async ({ page }) => {
    // 填寫評論表單
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'test@example.com');
    await page.fill('#content', '這是一則測試評論，感謝分享！');

    // 提交評論
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證成功訊息
    await expect(page.locator('text=評論已送出，待審核後顯示')).toBeVisible({ timeout: 5000 });

    // 驗證表單已清空
    await expect(page.locator('#authorName')).toHaveValue('');
    await expect(page.locator('#authorEmail')).toHaveValue('');
    await expect(page.locator('#content')).toHaveValue('');
  });

  test('12.1.2: should show validation errors for empty fields', async ({ page }) => {
    // 不填寫任何欄位，直接提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證錯誤訊息
    await expect(page.locator('text=請輸入姓名')).toBeVisible();
    await expect(page.locator('text=請輸入電子郵件')).toBeVisible();
    await expect(page.locator('text=請輸入評論內容')).toBeVisible();
  });

  test('12.1.3: should show validation error for empty author name', async ({ page }) => {
    // 只填寫 Email 和內容
    await page.fill('#authorEmail', 'test@example.com');
    await page.fill('#content', '測試內容');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證姓名錯誤訊息
    await expect(page.locator('text=請輸入姓名')).toBeVisible();

    // 其他欄位不應有錯誤
    await expect(page.locator('#authorEmail')).not.toHaveClass(/error|invalid/);
    await expect(page.locator('#content')).not.toHaveClass(/error|invalid/);
  });

  test('12.1.4: should show validation error for empty email', async ({ page }) => {
    // 只填寫姓名和內容
    await page.fill('#authorName', '測試使用者');
    await page.fill('#content', '測試內容');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證 Email 錯誤訊息
    await expect(page.locator('text=請輸入電子郵件')).toBeVisible();
  });

  test('12.1.5: should show validation error for empty content', async ({ page }) => {
    // 只填寫姓名和 Email
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'test@example.com');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證內容錯誤訊息
    await expect(page.locator('text=請輸入評論內容')).toBeVisible();
  });

  test('12.1.6: should show validation error for invalid email format', async ({ page }) => {
    // 填寫無效的 Email 格式
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'invalid-email');
    await page.fill('#content', '測試內容');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證 Email 格式錯誤訊息
    await expect(page.locator('text=請輸入有效的電子郵件格式')).toBeVisible();
  });

  test('12.1.7: should show validation error for email without domain', async ({ page }) => {
    // 填寫沒有網域的 Email
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'test@');
    await page.fill('#content', '測試內容');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證錯誤訊息
    await expect(page.locator('text=請輸入有效的電子郵件格式')).toBeVisible();
  });

  test('12.1.8: should show validation error for email without @', async ({ page }) => {
    // 填寫沒有 @ 的 Email
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'testexample.com');
    await page.fill('#content', '測試內容');

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證錯誤訊息
    await expect(page.locator('text=請輸入有效的電子郵件格式')).toBeVisible();
  });

  test('12.1.9: should clear field error when user starts typing', async ({ page }) => {
    // 先觸發驗證錯誤
    await page.click('button[type="submit"]:has-text("送出評論")');
    await expect(page.locator('text=請輸入姓名')).toBeVisible();

    // 開始輸入
    await page.fill('#authorName', '測試');

    // 錯誤訊息應該消失
    await expect(page.locator('text=請輸入姓名')).not.toBeVisible();
  });

  test('12.1.10: should handle rate limit (4 submissions)', async ({ page, context }) => {
    // 清理 localStorage 和 cookies，確保每次測試獨立
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    const timestamp = Date.now();

    // 連續提交 3 次評論（應該成功）
    for (let i = 1; i <= 3; i++) {
      // 重新載入頁面以重置表單狀態
      await page.goto(articleUrl);
      await page.waitForLoadState('networkidle');

      // 填寫表單
      await page.fill('#authorName', `測試使用者 ${timestamp}-${i}`);
      await page.fill('#authorEmail', `test${timestamp}${i}@example.com`);
      await page.fill('#content', `測試評論 ${timestamp}-${i}`);

      // 提交
      await page.click('button[type="submit"]:has-text("送出評論")');

      // 等待提交完成
      await page.waitForTimeout(500);
    }

    // 第 4 次提交（應該被 rate limit 阻擋）
    await page.goto(articleUrl);
    await page.waitForLoadState('networkidle');

    await page.fill('#authorName', `測試使用者 ${timestamp}-4`);
    await page.fill('#authorEmail', `test${timestamp}4@example.com`);
    await page.fill('#content', `測試評論 ${timestamp}-4`);

    // 提交第 4 次
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 驗證 rate limit 錯誤訊息
    await expect(
      page.locator('text=/請稍後再試|評論送出失敗|評論未通過驗證/i')
    ).toBeVisible({ timeout: 5000 });

    // 驗證不是成功訊息
    await expect(page.locator('text=評論已送出，待審核後顯示')).not.toBeVisible();
  });

  test('12.1.11: should disable submit button while submitting', async ({ page }) => {
    // 填寫表單
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'test@example.com');
    await page.fill('#content', '測試評論');

    // 取得送出按鈕
    const submitButton = page.locator('button[type="submit"]:has-text("送出")');

    // 點擊送出
    await submitButton.click();

    // 按鈕應該被禁用並顯示「送出中...」
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/送出中/);
  });

  test('12.1.12: should support markdown hint in content field', async ({ page }) => {
    // 驗證表單提示文字
    const markdownHint = page.locator('text=/支援.*Markdown.*格式/i');
    await expect(markdownHint).toBeVisible();
  });

  test('12.1.13: should have proper field labels and accessibility', async ({ page }) => {
    // 驗證欄位標籤
    await expect(page.locator('label[for="authorName"]')).toContainText('姓名');
    await expect(page.locator('label[for="authorEmail"]')).toContainText('電子郵件');
    await expect(page.locator('label[for="content"]')).toContainText('評論內容');

    // 驗證必填標記
    const nameLabel = page.locator('label[for="authorName"]');
    const emailLabel = page.locator('label[for="authorEmail"]');
    const contentLabel = page.locator('label[for="content"]');

    await expect(nameLabel).toContainText('*');
    await expect(emailLabel).toContainText('*');
    await expect(contentLabel).toContainText('*');
  });

  test('12.1.14: should not reveal honeypot field to users', async ({ page }) => {
    // Honeypot 欄位應該不可見（用於 anti-spam）
    const honeypotField = page.locator('input[name="website"]');
    
    if (await honeypotField.count() > 0) {
      // 檢查是否隱藏（position: absolute; left: -9999px 或 display: none）
      const isVisible = await honeypotField.isVisible();
      expect(isVisible).toBe(false);
    }
  });

  test('12.1.15: should persist form data during validation errors', async ({ page }) => {
    // 填寫部分表單（留下一個空欄位）
    await page.fill('#authorName', '測試使用者');
    await page.fill('#authorEmail', 'test@example.com');
    // 故意不填寫內容

    // 提交
    await page.click('button[type="submit"]:has-text("送出評論")');

    // 等待驗證錯誤
    await expect(page.locator('text=請輸入評論內容')).toBeVisible();

    // 驗證已填寫的欄位資料仍然保留
    await expect(page.locator('#authorName')).toHaveValue('測試使用者');
    await expect(page.locator('#authorEmail')).toHaveValue('test@example.com');
  });
});
