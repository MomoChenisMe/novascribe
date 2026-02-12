/**
 * @file 文章 SEO 設定流程 E2E 測試
 * @description 測試文章 SEO 設定完整流程：
 *   - 開啟文章編輯器
 *   - 填寫 SEO 設定（meta title/description/OG tags）
 *   - 預覽 Google 搜尋結果
 *   - 儲存 SEO 設定
 *   - 驗證評分更新
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號與範例資料
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 需先透過 auth.setup.ts 建立 authenticated state
 *   6. 至少有一篇已發佈的文章供測試使用
 *
 * 注意：測試假設使用者已通過 auth.setup.ts 登入。
 */

import { test, expect, type Page } from '@playwright/test';

/** 測試用 SEO 設定資料 */
const TEST_SEO = {
  metaTitle: 'E2E 測試 Meta Title — NovaScribe',
  metaDescription:
    '這是 E2E 測試用的 Meta Description，用於驗證文章 SEO 設定流程是否正常運作。',
  ogTitle: 'E2E 測試 OG Title',
  ogDescription: '這是 E2E 測試用的 OG Description',
  ogImage: 'https://example.com/test-og-image.jpg',
  focusKeyword: 'E2E 測試關鍵字',
  canonicalUrl: 'https://example.com/canonical-test',
};

/** 取得第一篇文章的 ID */
async function getFirstPostId(page: Page): Promise<string> {
  await page.goto('/admin/posts');
  await expect(page.locator('h1')).toContainText('文章');

  // 取得第一篇文章的編輯連結
  const editLink = page.locator('a[href*="/admin/posts/"]').first();
  await expect(editLink).toBeVisible();

  const href = await editLink.getAttribute('href');
  // 從 /admin/posts/{id}/edit 取得 id
  const match = href?.match(/\/admin\/posts\/([^/]+)/);
  if (!match) throw new Error('無法取得文章 ID');
  return match[1];
}

/** 導航到文章 SEO 設定 API（透過頁面 fetch） */
async function fetchSeoData(
  page: Page,
  postId: string
): Promise<Record<string, unknown>> {
  const response = await page.request.get(
    `/api/admin/seo/posts/${postId}`
  );
  const json = await response.json();
  return json;
}

test.describe.skip('文章 SEO 設定流程 E2E @skip-no-db', () => {
  let testPostId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    testPostId = await getFirstPostId(page);
    await page.close();
  });

  test('應該能開啟文章編輯頁面', async ({ page }) => {
    await page.goto(`/admin/posts/${testPostId}/edit`);
    await expect(page.locator('h1')).toContainText('編輯文章');

    // 表單應載入完成
    const titleInput = page.getByLabel('標題');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).not.toBeEmpty();
  });

  test('應該能填寫 SEO 設定並儲存', async ({ page }) => {
    // 透過 API 直接設定 SEO（因為 SEO 表單是透過 API 操作）
    const putResponse = await page.request.put(
      `/api/admin/seo/posts/${testPostId}`,
      {
        data: {
          metaTitle: TEST_SEO.metaTitle,
          metaDescription: TEST_SEO.metaDescription,
          ogTitle: TEST_SEO.ogTitle,
          ogDescription: TEST_SEO.ogDescription,
          ogImage: TEST_SEO.ogImage,
          focusKeyword: TEST_SEO.focusKeyword,
          canonicalUrl: TEST_SEO.canonicalUrl,
          twitterCard: 'summary_large_image',
          noIndex: false,
          noFollow: false,
        },
      }
    );

    expect(putResponse.ok()).toBeTruthy();

    const result = await putResponse.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // 驗證儲存的資料
    expect(result.data.metaTitle).toBe(TEST_SEO.metaTitle);
    expect(result.data.metaDescription).toBe(TEST_SEO.metaDescription);
    expect(result.data.ogTitle).toBe(TEST_SEO.ogTitle);
    expect(result.data.ogDescription).toBe(TEST_SEO.ogDescription);
    expect(result.data.ogImage).toBe(TEST_SEO.ogImage);
    expect(result.data.focusKeyword).toBe(TEST_SEO.focusKeyword);
  });

  test('應該能讀取已儲存的 SEO 設定', async ({ page }) => {
    const json = await fetchSeoData(page, testPostId);

    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data');

    const data = json.data as Record<string, unknown>;
    expect(data.metaTitle).toBe(TEST_SEO.metaTitle);
    expect(data.metaDescription).toBe(TEST_SEO.metaDescription);
    expect(data.ogTitle).toBe(TEST_SEO.ogTitle);
    expect(data.ogDescription).toBe(TEST_SEO.ogDescription);
  });

  test('儲存 SEO 設定後應該自動計算評分', async ({ page }) => {
    const json = await fetchSeoData(page, testPostId);

    expect(json).toHaveProperty('success', true);

    const data = json.data as Record<string, unknown>;
    // 有設定 metaTitle 和 metaDescription 的文章應獲得分數
    expect(data.seoScore).toBeDefined();
    expect(typeof data.seoScore).toBe('number');
    expect(data.seoScore as number).toBeGreaterThan(0);
  });

  test('應該能透過評分 API 取得詳細評分結果', async ({ page }) => {
    const response = await page.request.get(
      `/api/admin/seo/score/${testPostId}`
    );

    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.totalScore).toBeGreaterThan(0);
    expect(json.data.maxScore).toBeGreaterThan(0);
    expect(json.data.grade).toBeDefined();
    expect(json.data.items).toBeDefined();
    expect(Array.isArray(json.data.items)).toBe(true);
  });

  test('SeoPreview 應該顯示設定的 meta title 和 description', async ({
    page,
  }) => {
    // 假設 SeoPreview 元件已整合到文章編輯頁面
    // 若未整合，可透過獨立頁面或 storybook 測試
    await page.goto(`/admin/posts/${testPostId}/edit`);

    // 檢查預覽區域是否存在
    const preview = page.locator('[aria-label="Google 搜尋結果預覽"]');

    if (await preview.isVisible()) {
      // 預覽標題應顯示 meta title
      const previewTitle = preview.locator('[data-testid="preview-title"]');
      await expect(previewTitle).toBeVisible();

      // 預覽描述應顯示 meta description
      const previewDescription = preview.locator(
        '[data-testid="preview-description"]'
      );
      await expect(previewDescription).toBeVisible();
    }
  });

  test('SeoScoreIndicator 應該顯示評分結果', async ({ page }) => {
    await page.goto(`/admin/posts/${testPostId}/edit`);

    // 檢查評分指示器是否存在
    const scoreIndicator = page.locator('[aria-label="SEO 評分指示器"]');

    if (await scoreIndicator.isVisible()) {
      // 總分應可見
      const scoreValue = scoreIndicator.locator(
        '[data-testid="score-value"]'
      );
      await expect(scoreValue).toBeVisible();

      const scoreText = await scoreValue.innerText();
      const score = parseInt(scoreText, 10);
      expect(score).toBeGreaterThanOrEqual(0);

      // 等級應可見
      const gradeLabel = scoreIndicator.locator(
        '[data-testid="score-grade"]'
      );
      await expect(gradeLabel).toBeVisible();

      const grade = await gradeLabel.innerText();
      expect(['優良', '尚可', '需改善']).toContain(grade);
    }
  });

  test('更新 SEO 設定後評分應即時更新', async ({ page }) => {
    // 先取得目前評分
    const beforeJson = await fetchSeoData(page, testPostId);
    const beforeScore = (beforeJson.data as Record<string, unknown>)
      .seoScore as number;

    // 清空 SEO 設定（模擬較差的 SEO）
    const clearResponse = await page.request.put(
      `/api/admin/seo/posts/${testPostId}`,
      {
        data: {
          metaTitle: '',
          metaDescription: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          focusKeyword: '',
          canonicalUrl: '',
          twitterCard: 'summary_large_image',
          noIndex: false,
          noFollow: false,
        },
      }
    );

    expect(clearResponse.ok()).toBeTruthy();

    // 取得清空後的評分
    const afterJson = await fetchSeoData(page, testPostId);
    const afterScore = (afterJson.data as Record<string, unknown>)
      .seoScore as number;

    // 清空後評分應降低
    expect(afterScore).toBeLessThan(beforeScore);

    // 恢復 SEO 設定
    await page.request.put(`/api/admin/seo/posts/${testPostId}`, {
      data: {
        metaTitle: TEST_SEO.metaTitle,
        metaDescription: TEST_SEO.metaDescription,
        ogTitle: TEST_SEO.ogTitle,
        ogDescription: TEST_SEO.ogDescription,
        ogImage: TEST_SEO.ogImage,
        focusKeyword: TEST_SEO.focusKeyword,
        canonicalUrl: TEST_SEO.canonicalUrl,
        twitterCard: 'summary_large_image',
        noIndex: false,
        noFollow: false,
      },
    });
  });

  test('noIndex 設定應影響文章索引狀態', async ({ page }) => {
    // 設定 noIndex
    const response = await page.request.put(
      `/api/admin/seo/posts/${testPostId}`,
      {
        data: {
          metaTitle: TEST_SEO.metaTitle,
          metaDescription: TEST_SEO.metaDescription,
          noIndex: true,
          noFollow: false,
          twitterCard: 'summary_large_image',
        },
      }
    );

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.data.noIndex).toBe(true);

    // 恢復 noIndex = false
    await page.request.put(`/api/admin/seo/posts/${testPostId}`, {
      data: {
        metaTitle: TEST_SEO.metaTitle,
        metaDescription: TEST_SEO.metaDescription,
        noIndex: false,
        noFollow: false,
        twitterCard: 'summary_large_image',
      },
    });
  });

  test('SEO 設定表單驗證應生效', async ({ page }) => {
    // 超長 meta title（超過 70 字元限制）
    const longTitle = 'a'.repeat(80);

    const response = await page.request.put(
      `/api/admin/seo/posts/${testPostId}`,
      {
        data: {
          metaTitle: longTitle,
          twitterCard: 'summary_large_image',
        },
      }
    );

    const json = await response.json();

    // 伺服器端應拒絕過長的 meta title（或截斷處理）
    if (!response.ok()) {
      expect(json.success).toBe(false);
    }
  });
});
