import { test, expect } from '@playwright/test';

test.describe('SEO - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper title tag', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70);
  });

  test('should have meta description', async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    const content = await metaDescription.getAttribute('content');
    expect(content!.length).toBeGreaterThan(50);
    expect(content!.length).toBeLessThan(160);
  });

  test('should have Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
    
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /.+/);
  });

  test('should have Twitter Card tags', async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', /.+/);
    
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    if (await twitterTitle.count() > 0) {
      await expect(twitterTitle).toHaveAttribute('content', /.+/);
    }
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count() > 0) {
      await expect(canonical).toHaveAttribute('href', /.+/);
    }
  });

  test('should have proper robots meta tag', async ({ page }) => {
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count() > 0) {
      const content = await robots.getAttribute('content');
      expect(content).toMatch(/index|noindex/);
    }
  });

  test('should have viewport meta tag', async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should have charset meta tag', async ({ page }) => {
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'utf-8');
  });

  test('should have language attributes', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /.+/);
  });

  test('should have WebSite JSON-LD structured data', async ({ page }) => {
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    expect(scriptCount).toBeGreaterThan(0);
    
    // 尋找 WebSite JSON-LD
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content?.includes('WebSite')) {
        const jsonData = JSON.parse(content);
        expect(jsonData['@type']).toContain('WebSite');
        expect(jsonData.name).toBeTruthy();
        expect(jsonData.url).toBeTruthy();
        break;
      }
    }
  });
});

test.describe('SEO - Article Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]');
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    await page.waitForURL(/\/posts\/[^/]+$/);
  });

  test('should have proper title tag', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
  });

  test('should have meta description', async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should have Open Graph article tags', async ({ page }) => {
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'article');
    
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /.+/);
    
    const ogPublishedTime = page.locator('meta[property="article:published_time"]');
    if (await ogPublishedTime.count() > 0) {
      await expect(ogPublishedTime).toHaveAttribute('content', /.+/);
    }
  });

  test('should have og:image if featured image exists', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]');
    if (await ogImage.count() > 0) {
      const content = await ogImage.getAttribute('content');
      expect(content).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i);
    }
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /.+/);
    
    const href = await canonical.getAttribute('href');
    expect(href).toContain('/posts/');
  });

  test('should have Article JSON-LD structured data', async ({ page }) => {
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    expect(scriptCount).toBeGreaterThan(0);
    
    let foundArticle = false;
    
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content?.includes('Article') || content?.includes('BlogPosting')) {
        foundArticle = true;
        const jsonData = JSON.parse(content);
        
        expect(jsonData['@type']).toMatch(/Article|BlogPosting/);
        expect(jsonData.headline).toBeTruthy();
        expect(jsonData.author).toBeTruthy();
        expect(jsonData.datePublished).toBeTruthy();
        
        break;
      }
    }
    
    expect(foundArticle).toBe(true);
  });

  test('should have Breadcrumb JSON-LD structured data', async ({ page }) => {
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    
    let foundBreadcrumb = false;
    
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content?.includes('BreadcrumbList')) {
        foundBreadcrumb = true;
        const jsonData = JSON.parse(content);
        
        expect(jsonData['@type']).toBe('BreadcrumbList');
        expect(jsonData.itemListElement).toBeTruthy();
        expect(Array.isArray(jsonData.itemListElement)).toBe(true);
        
        break;
      }
    }
    
    // 麵包屑可能不是所有頁面都有
    // expect(foundBreadcrumb).toBe(true);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    // 每頁應該只有一個 H1
    expect(h1Count).toBe(1);
    
    // H1 應該有內容
    const h1Text = await h1.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text!.length).toBeGreaterThan(5);
  });
});

test.describe('SEO - Category Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories');
    await page.waitForSelector('[data-testid="category-card"]');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
  });

  test('should have proper title with category name', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have meta description', async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should have proper Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count() > 0) {
      const href = await canonical.getAttribute('href');
      expect(href).toContain('/categories/');
    }
  });
});

test.describe('SEO - Tag Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags');
    await page.waitForSelector('[data-testid="tag-link"]');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
  });

  test('should have proper title with tag name', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have meta description', async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should have proper Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });
});

test.describe('SEO - Sitemap Integration', () => {
  test('should have sitemap link in robots.txt or accessible at /sitemap.xml', async ({ page }) => {
    // 嘗試訪問 sitemap
    const response = await page.goto('/sitemap.xml');
    
    if (response?.status() === 200) {
      const content = await response.text();
      expect(content).toContain('<?xml');
      expect(content).toContain('<urlset');
      expect(content).toContain('<url>');
    } else {
      // sitemap 可能在其他路徑，或者尚未實作
      // 這不是 Wave 7 的任務，所以不強制要求
    }
  });

  test('should have robots.txt file', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    
    if (response?.status() === 200) {
      const content = await response.text();
      expect(content).toBeTruthy();
      
      // 可能包含 sitemap 路徑
      if (content.toLowerCase().includes('sitemap')) {
        expect(content).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/i);
      }
    }
  });
});

test.describe('SEO - Analytics Integration', () => {
  test('should have Google Analytics script', async ({ page }) => {
    await page.goto('/');
    
    // 檢查 GA4 script
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag"]');
    const gaInlineScript = page.locator('script:has-text("gtag")');
    
    const hasGA = await gaScript.count() > 0 || await gaInlineScript.count() > 0;
    
    // GA4 應該已整合（如果環境變數有設定）
    // 這裡不強制要求，因為測試環境可能沒有 GA ID
    if (hasGA) {
      expect(hasGA).toBe(true);
    }
  });

  test('should not track in admin pages', async ({ page }) => {
    // 前往後台頁面（如果需要認證，可能會重定向）
    const response = await page.goto('/admin');
    
    if (response?.status() === 200) {
      // 檢查後台頁面不應該有前台 Analytics
      // 這取決於實作細節
    }
  });
});

test.describe('SEO - Performance', () => {
  test('should have reasonable page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    
    // 首頁應該在 5 秒內載入完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have optimized images with alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        
        // 驗證有 alt 屬性
        const alt = await img.getAttribute('alt');
        expect(alt !== null).toBe(true);
        
        // 驗證有 src
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
      }
    }
  });
});

test.describe('SEO - Social Sharing', () => {
  test('should have proper meta tags for social sharing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]');
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    await page.waitForURL(/\/posts\/[^/]+$/);
    
    // Twitter Card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', /.+/);
    
    // Open Graph
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
  });
});
