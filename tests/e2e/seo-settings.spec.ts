/**
 * @file 全站 SEO 設定 E2E 測試
 * @description 測試全站 SEO 設定頁面完整功能：
 *   - 存取 /admin/seo/settings
 *   - 設定 GA4 Measurement ID
 *   - 設定 Google Search Console 驗證碼
 *   - 儲存設定
 *   - 驗證前台 <head> 包含對應標籤（GA4 script, GSC meta tag）
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 *
 * 注意：測試假設使用者已通過 auth.setup.ts 登入。
 */

import { test, expect, type Page } from '@playwright/test';

/** 測試用 SEO 設定資料 */
const TEST_SETTINGS = {
  siteTitle: 'E2E 測試站台',
  siteDescription: '這是 E2E 測試用的站台描述',
  siteUrl: 'https://e2e-test.example.com',
  ga4MeasurementId: 'G-E2ETEST1234',
  googleSiteVerification: 'e2e_test_verification_code_12345',
  defaultOgImage: 'https://example.com/e2e-og-image.jpg',
};

/** 導航到全站 SEO 設定頁面 */
async function navigateToSeoSettings(page: Page) {
  await page.goto('/admin/seo/settings');
  await expect(page.locator('h1')).toContainText('全站 SEO 設定');
}

test.describe.skip('全站 SEO 設定 E2E @skip-no-db', () => {
  test('設定頁面應正常載入', async ({ page }) => {
    await navigateToSeoSettings(page);

    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('全站 SEO 設定');

    // 驗證基本設定 fieldset
    await expect(page.getByText('基本設定')).toBeVisible();

    // 驗證第三方整合 fieldset
    await expect(page.getByText('第三方整合')).toBeVisible();

    // 驗證表單欄位存在
    await expect(page.getByLabel('網站標題')).toBeVisible();
    await expect(page.getByLabel('網站描述')).toBeVisible();
    await expect(page.getByLabel('網站 URL')).toBeVisible();
    await expect(page.getByLabel('GA4 Measurement ID')).toBeVisible();
    await expect(
      page.getByLabel('Google Search Console 驗證碼')
    ).toBeVisible();
    await expect(page.getByLabel('預設 OG Image URL')).toBeVisible();

    // 驗證儲存按鈕
    await expect(
      page.getByRole('button', { name: '儲存設定' })
    ).toBeVisible();
  });

  test('應該能填寫並儲存基本設定', async ({ page }) => {
    await navigateToSeoSettings(page);

    // 填寫網站標題
    const titleInput = page.getByLabel('網站標題');
    await titleInput.clear();
    await titleInput.fill(TEST_SETTINGS.siteTitle);

    // 填寫網站描述
    const descInput = page.getByLabel('網站描述');
    await descInput.clear();
    await descInput.fill(TEST_SETTINGS.siteDescription);

    // 填寫網站 URL
    const urlInput = page.getByLabel('網站 URL');
    await urlInput.clear();
    await urlInput.fill(TEST_SETTINGS.siteUrl);

    // 填寫預設 OG Image
    const ogImageInput = page.getByLabel('預設 OG Image URL');
    await ogImageInput.clear();
    await ogImageInput.fill(TEST_SETTINGS.defaultOgImage);

    // 儲存
    await page.getByRole('button', { name: '儲存設定' }).click();

    // 驗證成功訊息
    const message = page.locator('[data-testid="save-message"]');
    await expect(message).toBeVisible();
    await expect(message).toContainText('設定已儲存');
  });

  test('應該能設定 GA4 Measurement ID', async ({ page }) => {
    await navigateToSeoSettings(page);

    // 填寫 GA4 ID
    const ga4Input = page.getByLabel('GA4 Measurement ID');
    await ga4Input.clear();
    await ga4Input.fill(TEST_SETTINGS.ga4MeasurementId);

    // 儲存
    await page.getByRole('button', { name: '儲存設定' }).click();

    // 驗證成功
    const message = page.locator('[data-testid="save-message"]');
    await expect(message).toContainText('設定已儲存');

    // 重新載入頁面驗證資料持久化
    await page.reload();
    await expect(page.getByLabel('GA4 Measurement ID')).toHaveValue(
      TEST_SETTINGS.ga4MeasurementId
    );
  });

  test('應該能設定 Google Search Console 驗證碼', async ({ page }) => {
    await navigateToSeoSettings(page);

    // 填寫 GSC 驗證碼
    const gscInput = page.getByLabel('Google Search Console 驗證碼');
    await gscInput.clear();
    await gscInput.fill(TEST_SETTINGS.googleSiteVerification);

    // 儲存
    await page.getByRole('button', { name: '儲存設定' }).click();

    // 驗證成功
    const message = page.locator('[data-testid="save-message"]');
    await expect(message).toContainText('設定已儲存');

    // 重新載入頁面驗證資料持久化
    await page.reload();
    await expect(
      page.getByLabel('Google Search Console 驗證碼')
    ).toHaveValue(TEST_SETTINGS.googleSiteVerification);
  });

  test('應該能同時設定所有欄位並儲存', async ({ page }) => {
    await navigateToSeoSettings(page);

    // 填寫所有欄位
    const titleInput = page.getByLabel('網站標題');
    await titleInput.clear();
    await titleInput.fill(TEST_SETTINGS.siteTitle);

    const descInput = page.getByLabel('網站描述');
    await descInput.clear();
    await descInput.fill(TEST_SETTINGS.siteDescription);

    const urlInput = page.getByLabel('網站 URL');
    await urlInput.clear();
    await urlInput.fill(TEST_SETTINGS.siteUrl);

    const ogImageInput = page.getByLabel('預設 OG Image URL');
    await ogImageInput.clear();
    await ogImageInput.fill(TEST_SETTINGS.defaultOgImage);

    const ga4Input = page.getByLabel('GA4 Measurement ID');
    await ga4Input.clear();
    await ga4Input.fill(TEST_SETTINGS.ga4MeasurementId);

    const gscInput = page.getByLabel('Google Search Console 驗證碼');
    await gscInput.clear();
    await gscInput.fill(TEST_SETTINGS.googleSiteVerification);

    // 儲存
    await page.getByRole('button', { name: '儲存設定' }).click();

    // 驗證成功
    const message = page.locator('[data-testid="save-message"]');
    await expect(message).toContainText('設定已儲存');
  });

  test('設定 API 應返回正確資料結構', async ({ page }) => {
    // 先透過 API 設定
    const putResponse = await page.request.put('/api/admin/seo/settings', {
      data: {
        site_title: TEST_SETTINGS.siteTitle,
        site_description: TEST_SETTINGS.siteDescription,
        site_url: TEST_SETTINGS.siteUrl,
        ga4_measurement_id: TEST_SETTINGS.ga4MeasurementId,
        google_site_verification: TEST_SETTINGS.googleSiteVerification,
        default_og_image: TEST_SETTINGS.defaultOgImage,
      },
    });

    expect(putResponse.ok()).toBeTruthy();

    const putJson = await putResponse.json();
    expect(putJson.success).toBe(true);

    // 透過 API 讀取
    const getResponse = await page.request.get('/api/admin/seo/settings');
    expect(getResponse.ok()).toBeTruthy();

    const getJson = await getResponse.json();
    expect(getJson.success).toBe(true);
    expect(getJson.data).toBeDefined();

    expect(getJson.data.site_title).toBe(TEST_SETTINGS.siteTitle);
    expect(getJson.data.ga4_measurement_id).toBe(
      TEST_SETTINGS.ga4MeasurementId
    );
    expect(getJson.data.google_site_verification).toBe(
      TEST_SETTINGS.googleSiteVerification
    );
  });

  test('前台 <head> 應包含 GA4 script', async ({ page }) => {
    // 確保 GA4 ID 已設定
    await page.request.put('/api/admin/seo/settings', {
      data: {
        ga4_measurement_id: TEST_SETTINGS.ga4MeasurementId,
      },
    });

    // 存取前台首頁
    await page.goto('/');

    // 檢查頁面是否包含 GA4 相關的 script
    // @next/third-parties/google 會注入 gtag.js script
    const ga4Script = page.locator(
      `script[src*="googletagmanager.com/gtag"][src*="${TEST_SETTINGS.ga4MeasurementId}"], ` +
        `script[src*="www.googletagmanager.com"][src*="${TEST_SETTINGS.ga4MeasurementId}"]`
    );

    // 或者檢查 inline script 中是否包含 GA4 ID
    const inlineScript = page.locator('script');
    const scripts = await inlineScript.allInnerTexts();
    const hasGa4Reference = scripts.some(
      (s) =>
        s.includes(TEST_SETTINGS.ga4MeasurementId) ||
        s.includes('googletagmanager')
    );

    // GA4 script 或 inline reference 至少應有一個存在
    const hasExternalScript = (await ga4Script.count()) > 0;
    expect(hasExternalScript || hasGa4Reference).toBe(true);
  });

  test('前台 <head> 應包含 Google Search Console 驗證 meta tag', async ({
    page,
  }) => {
    // 確保 GSC 驗證碼已設定
    await page.request.put('/api/admin/seo/settings', {
      data: {
        google_site_verification: TEST_SETTINGS.googleSiteVerification,
      },
    });

    // 存取前台首頁
    await page.goto('/');

    // 檢查 <head> 中的 google-site-verification meta tag
    const gscMeta = page.locator(
      'meta[name="google-site-verification"]'
    );

    await expect(gscMeta).toBeVisible();

    const content = await gscMeta.getAttribute('content');
    expect(content).toBe(TEST_SETTINGS.googleSiteVerification);
  });

  test('後台頁面不應載入 GA4 追蹤碼', async ({ page }) => {
    // 確保 GA4 ID 已設定
    await page.request.put('/api/admin/seo/settings', {
      data: {
        ga4_measurement_id: TEST_SETTINGS.ga4MeasurementId,
      },
    });

    // 存取後台頁面
    await page.goto('/admin/seo/settings');

    // 後台頁面不應載入 GA4 script
    const ga4Script = page.locator(
      `script[src*="googletagmanager.com/gtag"][src*="${TEST_SETTINGS.ga4MeasurementId}"]`
    );
    await expect(ga4Script).toHaveCount(0);

    // inline script 中也不應包含 GA4 tracking（後台排除）
    const scripts = await page.locator('script').allInnerTexts();
    const hasGa4Tracking = scripts.some(
      (s) =>
        s.includes(TEST_SETTINGS.ga4MeasurementId) &&
        s.includes('gtag')
    );
    expect(hasGa4Tracking).toBe(false);
  });

  test('儲存按鈕在提交時應顯示載入狀態', async ({ page }) => {
    await navigateToSeoSettings(page);

    const submitButton = page.getByRole('button', { name: '儲存設定' });
    await expect(submitButton).toBeEnabled();

    // 監聽 API 請求
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/seo/settings') &&
        res.request().method() === 'PUT'
    );

    // 點擊儲存
    await submitButton.click();

    // 按鈕應顯示「儲存中...」
    await expect(
      page.getByRole('button', { name: '儲存中...' })
    ).toBeVisible();

    // 等待 API 回應
    await responsePromise;

    // 按鈕應恢復為「儲存設定」
    await expect(
      page.getByRole('button', { name: '儲存設定' })
    ).toBeVisible();
  });

  test('清空 GA4 ID 後前台不應載入追蹤碼', async ({ page }) => {
    // 清空 GA4 ID
    await page.request.put('/api/admin/seo/settings', {
      data: {
        ga4_measurement_id: '',
      },
    });

    // 存取前台首頁
    await page.goto('/');

    // 不應有 GA4 script
    const ga4Script = page.locator(
      'script[src*="googletagmanager.com/gtag"]'
    );
    await expect(ga4Script).toHaveCount(0);

    // 恢復 GA4 ID（清理）
    await page.request.put('/api/admin/seo/settings', {
      data: {
        ga4_measurement_id: TEST_SETTINGS.ga4MeasurementId,
      },
    });
  });
});
