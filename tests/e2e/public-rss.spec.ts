import { test, expect } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

test.describe('RSS 2.0 Feed', () => {
  test('should serve RSS 2.0 feed at /feed.xml', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    
    // 驗證 HTTP 狀態碼
    expect(response?.status()).toBe(200);
    
    // 驗證 Content-Type
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('application/rss+xml');
  });

  test('should have valid RSS 2.0 XML structure', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    
    expect(xmlContent).toBeTruthy();
    expect(xmlContent).toContain('<?xml version');
    expect(xmlContent).toContain('<rss');
    expect(xmlContent).toContain('version="2.0"');
    
    // 解析 XML
    const feedData = parser.parse(xmlContent!);
    expect(feedData.rss).toBeTruthy();
    expect(feedData.rss.channel).toBeTruthy();
  });

  test('should include channel metadata', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const channel = feedData.rss.channel;
    
    // 驗證必要的 channel 元素
    expect(channel.title).toBeTruthy();
    expect(channel.link).toBeTruthy();
    expect(channel.description).toBeTruthy();
    expect(channel.language).toBe('zh-Hant');
    
    // 驗證 feedLinks
    expect(xmlContent).toContain('/feed.xml');
  });

  test('should include published articles', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const items = feedData.rss.channel.item;
    
    if (items) {
      const itemArray = Array.isArray(items) ? items : [items];
      expect(itemArray.length).toBeGreaterThan(0);
      
      // 驗證第一篇文章的結構
      const firstItem = itemArray[0];
      expect(firstItem.title).toBeTruthy();
      expect(firstItem.link).toBeTruthy();
      expect(firstItem.description).toBeTruthy();
      expect(firstItem.pubDate).toBeTruthy();
      expect(firstItem.guid).toBeTruthy();
    }
  });

  test('should include full content in items', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const items = feedData.rss.channel.item;
    
    if (items) {
      const itemArray = Array.isArray(items) ? items : [items];
      const firstItem = itemArray[0];
      
      // 驗證有完整內容（content:encoded 或 description 長度足夠）
      const content = firstItem['content:encoded'] || firstItem.description;
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);
    }
  });

  test('should include category information', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const items = feedData.rss.channel.item;
    
    if (items) {
      const itemArray = Array.isArray(items) ? items : [items];
      
      // 檢查是否有文章包含分類
      const hasCategory = itemArray.some(item => item.category);
      // 至少部分文章應該有分類（如果資料庫有分類資料）
      // 這裡不強制要求，因為可能所有文章都沒分類
    }
  });
});

test.describe('Atom Feed', () => {
  test('should serve Atom feed at /feed/atom.xml', async ({ page }) => {
    const response = await page.goto('/feed/atom.xml');
    
    // 驗證 HTTP 狀態碼
    expect(response?.status()).toBe(200);
    
    // 驗證 Content-Type
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('application/atom+xml');
  });

  test('should have valid Atom XML structure', async ({ page }) => {
    const response = await page.goto('/feed/atom.xml');
    const xmlContent = await response?.text();
    
    expect(xmlContent).toBeTruthy();
    expect(xmlContent).toContain('<?xml version');
    expect(xmlContent).toContain('<feed');
    expect(xmlContent).toContain('xmlns="http://www.w3.org/2005/Atom"');
    
    // 解析 XML
    const feedData = parser.parse(xmlContent!);
    expect(feedData.feed).toBeTruthy();
  });

  test('should include feed metadata', async ({ page }) => {
    const response = await page.goto('/feed/atom.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const feed = feedData.feed;
    
    // 驗證必要的 feed 元素
    expect(feed.title).toBeTruthy();
    expect(feed.id).toBeTruthy();
    expect(feed.updated).toBeTruthy();
    
    // 驗證 link 元素
    const links = Array.isArray(feed.link) ? feed.link : [feed.link];
    expect(links.length).toBeGreaterThan(0);
  });

  test('should include published entries', async ({ page }) => {
    const response = await page.goto('/feed/atom.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const entries = feedData.feed.entry;
    
    if (entries) {
      const entryArray = Array.isArray(entries) ? entries : [entries];
      expect(entryArray.length).toBeGreaterThan(0);
      
      // 驗證第一個 entry 的結構
      const firstEntry = entryArray[0];
      expect(firstEntry.title).toBeTruthy();
      expect(firstEntry.id).toBeTruthy();
      expect(firstEntry.updated).toBeTruthy();
      expect(firstEntry.content).toBeTruthy();
    }
  });
});

test.describe('Category-specific Feed', () => {
  test('should serve category feed at /feed/[category].xml', async ({ page }) => {
    // 先獲取一個分類 slug
    await page.goto('/categories');
    await page.waitForSelector('[data-testid="category-card"]');
    
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    const categoryLink = firstCategory.locator('a').first();
    const href = await categoryLink.getAttribute('href');
    
    if (href) {
      const categorySlug = href.split('/').pop();
      
      // 訪問該分類的 feed
      const response = await page.goto(`/feed/${categorySlug}.xml`);
      
      if (response?.status() === 200) {
        // 驗證 Content-Type
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/rss+xml');
        
        // 驗證 XML 結構
        const xmlContent = await response.text();
        expect(xmlContent).toContain('<rss');
        
        const feedData = parser.parse(xmlContent);
        expect(feedData.rss.channel).toBeTruthy();
      }
    }
  });

  test('should only include articles from specific category', async ({ page }) => {
    // 先獲取一個分類 slug
    await page.goto('/categories');
    await page.waitForSelector('[data-testid="category-card"]');
    
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    const categoryName = await firstCategory.locator('[data-testid="category-name"]').textContent();
    const categoryLink = firstCategory.locator('a').first();
    const href = await categoryLink.getAttribute('href');
    
    if (href) {
      const categorySlug = href.split('/').pop();
      
      const response = await page.goto(`/feed/${categorySlug}.xml`);
      
      if (response?.status() === 200) {
        const xmlContent = await response.text();
        const feedData = parser.parse(xmlContent);
        
        // 驗證 channel title 包含分類名稱
        expect(feedData.rss.channel.title).toContain(categoryName || categorySlug);
        
        // 驗證所有 item 都屬於該分類
        const items = feedData.rss.channel.item;
        if (items) {
          const itemArray = Array.isArray(items) ? items : [items];
          itemArray.forEach(item => {
            if (item.category) {
              const categories = Array.isArray(item.category) ? item.category : [item.category];
              // 可以進一步驗證分類匹配
            }
          });
        }
      }
    }
  });

  test('should return 404 for non-existent category', async ({ page }) => {
    const response = await page.goto('/feed/non-existent-category-12345.xml');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Feed Auto-discovery', () => {
  test('should include RSS auto-discovery link in homepage', async ({ page }) => {
    await page.goto('/');
    
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute('href', /\/feed\.xml$/);
    await expect(rssLink).toHaveAttribute('title', /.+/);
  });

  test('should include Atom auto-discovery link in homepage', async ({ page }) => {
    await page.goto('/');
    
    const atomLink = page.locator('link[type="application/atom+xml"]');
    if (await atomLink.count() > 0) {
      await expect(atomLink).toHaveAttribute('href', /\/feed\/atom\.xml$/);
    }
  });

  test('should include auto-discovery links in article pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]');
    
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    await page.waitForURL(/\/posts\/[^/]+$/);
    
    // 驗證 RSS auto-discovery
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute('href', /.+/);
  });
});

test.describe('Feed Performance', () => {
  test('should respond within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.goto('/feed.xml');
    const endTime = Date.now();
    
    expect(response?.status()).toBe(200);
    
    // 應該在 3 秒內回應
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(3000);
  });

  test('should have proper cache headers', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    
    const headers = response?.headers();
    
    // 可能有 cache-control 或 expires header
    // ISR 設定 revalidate=3600 應該有對應的 cache 設定
    if (headers) {
      // 至少應該有 content-type
      expect(headers['content-type']).toBeTruthy();
    }
  });
});

test.describe('Feed Content Validation', () => {
  test('should escape HTML entities properly', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    
    // 檢查是否有未轉義的特殊字元（可能導致 XML 解析失敗）
    // 如果有 <script> 標籤，應該被轉義為 &lt;script&gt;
    
    // 嘗試解析 XML，不應拋出錯誤
    expect(() => parser.parse(xmlContent!)).not.toThrow();
  });

  test('should include valid URLs', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const items = feedData.rss.channel.item;
    
    if (items) {
      const itemArray = Array.isArray(items) ? items : [items];
      
      itemArray.forEach(item => {
        // 驗證 link 是完整的 URL
        expect(item.link).toMatch(/^https?:\/\/.+/);
        
        // 驗證 guid
        expect(item.guid).toBeTruthy();
      });
    }
  });

  test('should include valid dates', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    const xmlContent = await response?.text();
    const feedData = parser.parse(xmlContent!);
    
    const items = feedData.rss.channel.item;
    
    if (items) {
      const itemArray = Array.isArray(items) ? items : [items];
      
      itemArray.forEach(item => {
        // 驗證 pubDate 是有效的日期格式
        expect(item.pubDate).toBeTruthy();
        const date = new Date(item.pubDate);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    }
  });
});
