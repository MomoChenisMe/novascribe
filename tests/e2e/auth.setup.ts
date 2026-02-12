/**
 * @file E2E 認證設定
 * @description 建立 authenticated storage state 供其他 E2E 測試使用。
 *
 * ⚠️ 前置條件：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET 等）
 *   4. `npm run dev` 或 `npm run build && npm run start` 可正常啟動
 *
 * 使用方式：
 *   在 playwright.config.ts 中加入 setup project：
 *   ```
 *   projects: [
 *     { name: 'setup', testMatch: /auth\.setup\.ts/ },
 *     { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
 *   ]
 *   ```
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

/** 測試用管理者帳號（與 prisma/seed.ts 一致） */
const ADMIN_EMAIL = 'admin@novascribe.com';
const ADMIN_PASSWORD = 'admin123456';

/** 儲存 authenticated state 的路徑 */
const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // 前往登入頁
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('登入');

  // 填入帳密
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('密碼').fill(ADMIN_PASSWORD);

  // 點擊登入
  await page.getByRole('button', { name: '登入' }).click();

  // 等待導向至 /admin
  await page.waitForURL('/admin');
  await expect(page.locator('h1')).toContainText('NovaScribe');

  // 儲存 authenticated state
  await page.context().storageState({ path: authFile });
});
