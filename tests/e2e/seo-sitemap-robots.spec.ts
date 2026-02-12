/**
 * @file Sitemap & Robots.txt E2E 測試
 * @description 測試 sitemap.xml 和 robots.txt 的生成：
 *   - 請求 /sitemap.xml 並驗證 XML 格式正確
 *   - 驗證包含已發佈文章
 *   - 請求 /robots.txt 並驗證 txt 格式正確
 *   - 驗證包含 Sitemap URL
 *
 * ⚠️ 前置條件（目前無法執行）：
 *   1. PostgreSQL 資料庫已啟動並完成 Prisma migration
 *   2. 已執行 `npx prisma db seed` 建立管理者帳號與範例資料
 *   3. 環境變數已正確設定（DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL）
 *   4. 應用程式可透過 `npm run dev` 正常啟動
 *   5. 至少有一篇已發佈（PUBLISHED）的文章供 sitemap 收錄
 *
 * 注意：sitemap.xml 和 robots.txt 不需要認證即可存取。
 */

import { test, expect } from '@playwright/test';

test.describe.skip('Sitemap & Robots.txt E2E @skip-no-db', () => {
  test.describe('Sitemap.xml', () => {
    test('應返回有效的 XML 格式', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');

      expect(response.ok()).toBeTruthy();

      // Content-Type 應為 XML
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/xml/);

      const body = await response.text();

      // 應以 XML 宣告或 urlset 標籤開頭
      expect(body).toMatch(/<\?xml|<urlset/);

      // 應包含 urlset 結束標籤
      expect(body).toContain('</urlset>');
    });

    test('應包含首頁 URL', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 應包含至少一個 <url> 項目
      expect(body).toContain('<url>');
      expect(body).toContain('<loc>');

      // 首頁應存在
      // Next.js sitemap 會使用 NEXT_PUBLIC_SITE_URL 或 localhost
      expect(body).toMatch(/<loc>https?:\/\/[^<]+<\/loc>/);
    });

    test('應包含已發佈文章的 URL', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 應包含文章路徑 /posts/
      expect(body).toMatch(/<loc>[^<]*\/posts\/[^<]+<\/loc>/);
    });

    test('每個 URL 應有 lastmod 和 changefreq', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 應包含 lastmod 標籤
      expect(body).toContain('<lastmod>');

      // lastmod 應為有效日期格式
      expect(body).toMatch(
        /<lastmod>\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/
      );

      // 應包含 changefreq 標籤
      expect(body).toContain('<changefreq>');

      // changefreq 應為有效值
      expect(body).toMatch(
        /<changefreq>(always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>/
      );
    });

    test('每個 URL 應有 priority', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 應包含 priority 標籤
      expect(body).toContain('<priority>');

      // priority 應為 0.0 ~ 1.0 之間的數值
      expect(body).toMatch(/<priority>[01](\.\d+)?<\/priority>/);
    });

    test('noIndex 文章不應出現在 sitemap 中', async ({ page }) => {
      // 先透過 API 取得文章列表
      const postsResponse = await page.request.get(
        '/api/admin/posts?limit=100'
      );
      const postsJson = await postsResponse.json();

      if (!postsJson.success) return;

      // 找一篇文章設定 noIndex
      const posts = postsJson.data as Array<{
        id: string;
        slug: string;
        status: string;
      }>;
      const publishedPost = posts.find((p) => p.status === 'PUBLISHED');

      if (!publishedPost) return;

      // 設定 noIndex
      await page.request.put(
        `/api/admin/seo/posts/${publishedPost.id}`,
        {
          data: {
            noIndex: true,
            twitterCard: 'summary_large_image',
          },
        }
      );

      // 重新取得 sitemap
      const sitemapResponse = await page.request.get('/sitemap.xml');
      const sitemapBody = await sitemapResponse.text();

      // noIndex 文章不應出現在 sitemap 中
      expect(sitemapBody).not.toContain(`/posts/${publishedPost.slug}`);

      // 恢復 noIndex 設定
      await page.request.put(
        `/api/admin/seo/posts/${publishedPost.id}`,
        {
          data: {
            noIndex: false,
            twitterCard: 'summary_large_image',
          },
        }
      );
    });

    test('應包含分類頁面 URL', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 如果有分類，應包含分類路徑
      const hasCategoryUrls = body.includes('/categories/');

      // 查詢是否有分類
      const catResponse = await page.request.get('/api/admin/categories');
      const catJson = await catResponse.json();

      if (catJson.success && catJson.data && catJson.data.length > 0) {
        expect(hasCategoryUrls).toBe(true);
      }
    });

    test('應包含標籤頁面 URL', async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      const body = await response.text();

      // 如果有標籤，應包含標籤路徑
      const hasTagUrls = body.includes('/tags/');

      // 查詢是否有標籤
      const tagResponse = await page.request.get(
        '/api/admin/tags?limit=100'
      );
      const tagJson = await tagResponse.json();

      if (tagJson.success && tagJson.data && tagJson.data.length > 0) {
        expect(hasTagUrls).toBe(true);
      }
    });
  });

  test.describe('Robots.txt', () => {
    test('應返回有效的純文字格式', async ({ page }) => {
      const response = await page.request.get('/robots.txt');

      expect(response.ok()).toBeTruthy();

      // Content-Type 應為 text/plain
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/text\/plain/);

      const body = await response.text();
      expect(body.length).toBeGreaterThan(0);
    });

    test('應包含 User-agent 指令', async ({ page }) => {
      const response = await page.request.get('/robots.txt');
      const body = await response.text();

      // 應包含 User-agent 指令
      expect(body.toLowerCase()).toContain('user-agent');
    });

    test('應包含 Allow 和 Disallow 指令', async ({ page }) => {
      const response = await page.request.get('/robots.txt');
      const body = await response.text();

      // 應包含基本指令
      expect(body.toLowerCase()).toMatch(/allow|disallow/);
    });

    test('應禁止爬取 /admin/ 路徑', async ({ page }) => {
      const response = await page.request.get('/robots.txt');
      const body = await response.text();

      // /admin/ 應被禁止爬取
      expect(body).toMatch(/disallow:\s*\/admin/i);
    });

    test('應禁止爬取 /api/ 路徑', async ({ page }) => {
      const response = await page.request.get('/robots.txt');
      const body = await response.text();

      // /api/ 應被禁止爬取
      expect(body).toMatch(/disallow:\s*\/api/i);
    });

    test('應包含 Sitemap URL', async ({ page }) => {
      const response = await page.request.get('/robots.txt');
      const body = await response.text();

      // 應包含 Sitemap 指令
      expect(body.toLowerCase()).toContain('sitemap');

      // Sitemap URL 應指向 /sitemap.xml
      expect(body).toMatch(/sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/i);
    });

    test('Sitemap URL 應可正常存取', async ({ page }) => {
      const robotsResponse = await page.request.get('/robots.txt');
      const robotsBody = await robotsResponse.text();

      // 擷取 Sitemap URL
      const sitemapMatch = robotsBody.match(
        /sitemap:\s*(https?:\/\/[^\s]+)/i
      );
      expect(sitemapMatch).not.toBeNull();

      if (sitemapMatch) {
        // 嘗試存取 Sitemap URL
        const sitemapResponse = await page.request.get(sitemapMatch[1]);
        expect(sitemapResponse.ok()).toBeTruthy();
      }
    });
  });
});
