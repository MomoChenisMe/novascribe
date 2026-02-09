/**
 * @file 登入流程 E2E 測試
 * @description 測試完整登入流程：成功登入→進入後台→登出→回到登入頁。
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *
 * 測試帳號（與 prisma/seed.ts 一致）：
 *   - Email: admin@novascribe.com
 *   - Password: admin123456
 */

import { test, expect } from '@playwright/test';

/** 測試用管理者帳號 */
const ADMIN_EMAIL = 'admin@novascribe.com';
const ADMIN_PASSWORD = 'admin123456';

test.describe('登入流程', () => {
  test('成功登入後進入後台', async ({ page }) => {
    // 前往登入頁
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('登入');

    // 填入正確帳密
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('密碼').fill(ADMIN_PASSWORD);

    // 點擊登入按鈕
    await page.getByRole('button', { name: '登入' }).click();

    // 驗證已導向至後台首頁
    await page.waitForURL('/admin');
    await expect(page.locator('h1')).toContainText('NovaScribe');
  });

  test('登入失敗顯示錯誤訊息', async ({ page }) => {
    await page.goto('/login');

    // 填入錯誤密碼
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('密碼').fill('wrong-password');
    await page.getByRole('button', { name: '登入' }).click();

    // 驗證顯示錯誤訊息
    await expect(page.getByRole('alert')).toContainText('帳號或密碼錯誤');

    // 驗證停留在登入頁
    await expect(page).toHaveURL(/\/login/);
  });

  test('表單驗證 — 空白欄位顯示錯誤', async ({ page }) => {
    await page.goto('/login');

    // 直接點擊登入（不填寫任何欄位）
    await page.getByRole('button', { name: '登入' }).click();

    // 驗證顯示欄位驗證錯誤
    await expect(page.getByText('請輸入 email')).toBeVisible();
    await expect(page.getByText('請輸入密碼')).toBeVisible();
  });

  test('表單驗證 — 無效 email 格式', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('密碼').fill('somepassword');
    await page.getByRole('button', { name: '登入' }).click();

    // 驗證顯示 email 格式錯誤
    await expect(page.getByText('請輸入有效的 email')).toBeVisible();
  });

  test('完整流程：登入→後台→登出→回到登入頁', async ({ page }) => {
    // Step 1: 登入
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('密碼').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: '登入' }).click();

    // Step 2: 驗證進入後台
    await page.waitForURL('/admin');
    await expect(page.locator('h1')).toContainText('NovaScribe');

    // Step 3: 點擊登出
    await page.getByRole('button', { name: '登出' }).click();

    // Step 4: 驗證回到登入頁
    await page.waitForURL(/\/login/);
    await expect(page.locator('h1')).toContainText('登入');
  });

  test('登入中按鈕顯示載入狀態', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('密碼').fill(ADMIN_PASSWORD);

    // 點擊登入並立即檢查載入狀態
    const loginButton = page.getByRole('button', { name: '登入' });
    await loginButton.click();

    // 按鈕應顯示「登入中...」且被禁用（可能很短暫）
    // 注意：此斷言可能因網路速度而不穩定，生產環境可加上 network throttling
    await expect(loginButton).toBeDisabled();
  });
});
