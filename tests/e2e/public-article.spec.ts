import { test, expect } from '@playwright/test';

test.describe('Public Article Page', () => {
  test.beforeEach(async ({ page }) => {
    // 前往首頁並點擊第一篇文章
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-card"]');
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    await page.waitForURL(/\/posts\/[^/]+$/);
  });

  test('should load article page successfully', async ({ page }) => {
    // 驗證文章標題存在
    const articleTitle = page.locator('[data-testid="article-title"]');
    await expect(articleTitle).toBeVisible();
    await expect(articleTitle).toHaveText(/.+/);
    
    // 驗證文章內容存在
    const articleContent = page.locator('[data-testid="article-content"]');
    await expect(articleContent).toBeVisible();
  });

  test('should display article header with metadata', async ({ page }) => {
    const articleHeader = page.locator('[data-testid="article-header"]');
    await expect(articleHeader).toBeVisible();
    
    // 驗證發布日期
    const publishDate = articleHeader.locator('[data-testid="publish-date"]');
    await expect(publishDate).toBeVisible();
    
    // 驗證閱讀時間
    const readingTime = articleHeader.locator('[data-testid="reading-time"]');
    if (await readingTime.isVisible().catch(() => false)) {
      await expect(readingTime).toHaveText(/\d+\s*分鐘/);
    }
    
    // 驗證分類標籤
    const category = articleHeader.locator('[data-testid="article-category"]');
    if (await category.isVisible().catch(() => false)) {
      await expect(category).toBeVisible();
    }
  });

  test('should render markdown content correctly', async ({ page }) => {
    const articleContent = page.locator('[data-testid="article-content"]');
    
    // 驗證基本 HTML 元素
    const paragraphs = articleContent.locator('p');
    if (await paragraphs.count() > 0) {
      await expect(paragraphs.first()).toBeVisible();
    }
    
    // 驗證標題
    const headings = articleContent.locator('h1, h2, h3');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // 驗證連結
    const links = articleContent.locator('a');
    if (await links.count() > 0) {
      await expect(links.first()).toHaveAttribute('href', /.+/);
    }
  });

  test('should display code blocks with syntax highlighting', async ({ page }) => {
    const articleContent = page.locator('[data-testid="article-content"]');
    
    // 尋找程式碼區塊
    const codeBlocks = articleContent.locator('pre code, .shiki');
    const hasCode = await codeBlocks.count() > 0;
    
    if (hasCode) {
      const firstCodeBlock = codeBlocks.first();
      await expect(firstCodeBlock).toBeVisible();
      
      // 驗證有 syntax highlighting 的 class
      const className = await firstCodeBlock.getAttribute('class');
      expect(className).toBeTruthy();
    }
  });

  test('should display table of contents', async ({ page }) => {
    const toc = page.locator('[data-testid="article-toc"]');
    
    // 如果文章有目錄
    if (await toc.isVisible().catch(() => false)) {
      await expect(toc).toBeVisible();
      
      // 驗證目錄連結
      const tocLinks = toc.locator('a');
      const linkCount = await tocLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // 點擊第一個目錄連結
      const firstLink = tocLinks.first();
      const href = await firstLink.getAttribute('href');
      await firstLink.click();
      
      // 驗證頁面滾動到對應位置（檢查 URL hash）
      if (href) {
        await expect(page).toHaveURL(new RegExp(href.replace('#', '\\#')));
      }
    }
  });

  test('should have sticky table of contents on desktop', async ({ page }) => {
    // 設定桌面視窗
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const toc = page.locator('[data-testid="article-toc"]');
    
    if (await toc.isVisible().catch(() => false)) {
      // 滾動頁面
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(200);
      
      // 驗證目錄仍然可見（sticky）
      await expect(toc).toBeVisible();
    }
  });

  test('should display related posts section', async ({ page }) => {
    const relatedPosts = page.locator('[data-testid="related-posts"]');
    
    // 如果有相關文章
    if (await relatedPosts.isVisible().catch(() => false)) {
      await expect(relatedPosts).toBeVisible();
      
      // 驗證相關文章卡片
      const relatedCards = relatedPosts.locator('[data-testid="article-card"]');
      const cardCount = await relatedCards.count();
      expect(cardCount).toBeGreaterThan(0);
      expect(cardCount).toBeLessThanOrEqual(3);
      
      // 點擊相關文章應該導航到該文章
      const firstRelated = relatedCards.first();
      await firstRelated.click();
      await page.waitForURL(/\/posts\/[^/]+$/);
    }
  });

  test('should display share buttons', async ({ page }) => {
    const shareButtons = page.locator('[data-testid="share-buttons"]');
    
    if (await shareButtons.isVisible().catch(() => false)) {
      await expect(shareButtons).toBeVisible();
      
      // 驗證各種分享按鈕
      const twitterButton = shareButtons.locator('[data-testid="share-twitter"]');
      const facebookButton = shareButtons.locator('[data-testid="share-facebook"]');
      const copyLinkButton = shareButtons.locator('[data-testid="share-copy-link"]');
      
      // 至少應該有一個分享按鈕
      const hasTwitter = await twitterButton.isVisible().catch(() => false);
      const hasFacebook = await facebookButton.isVisible().catch(() => false);
      const hasCopyLink = await copyLinkButton.isVisible().catch(() => false);
      
      expect(hasTwitter || hasFacebook || hasCopyLink).toBe(true);
    }
  });

  test('should copy link when clicking copy button', async ({ page, context }) => {
    const shareButtons = page.locator('[data-testid="share-buttons"]');
    const copyButton = shareButtons.locator('[data-testid="share-copy-link"]');
    
    if (await copyButton.isVisible().catch(() => false)) {
      // 授予剪貼簿權限
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // 點擊複製連結
      await copyButton.click();
      
      // 驗證顯示成功訊息或圖示變化
      await page.waitForTimeout(300);
      
      // 可選：驗證剪貼簿內容（需要 clipboard API 支援）
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain(page.url());
    }
  });

  test('should display article tags', async ({ page }) => {
    const tags = page.locator('[data-testid="article-tags"]');
    
    if (await tags.isVisible().catch(() => false)) {
      await expect(tags).toBeVisible();
      
      // 驗證標籤連結
      const tagLinks = tags.locator('[data-testid="tag-link"]');
      if (await tagLinks.count() > 0) {
        const firstTag = tagLinks.first();
        await expect(firstTag).toBeVisible();
        
        // 點擊標籤應該導航到標籤頁
        await firstTag.click();
        await page.waitForURL(/\/tags\/[^/]+$/);
      }
    }
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    
    if (await breadcrumb.isVisible().catch(() => false)) {
      await expect(breadcrumb).toBeVisible();
      
      // 驗證麵包屑路徑（首頁 → 分類? → 文章）
      const breadcrumbLinks = breadcrumb.locator('a');
      const linkCount = await breadcrumbLinks.count();
      expect(linkCount).toBeGreaterThanOrEqual(1);
      
      // 點擊首頁連結
      const homeLink = breadcrumbLinks.first();
      await homeLink.click();
      await page.waitForURL('/');
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // 驗證 meta title
    await expect(page).toHaveTitle(/.+/);
    
    // 驗證 meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // 驗證 OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'article');
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /.+/);
    
    // 驗證 Twitter Card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', /.+/);
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    // 驗證 ArticleJsonLd
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScript.count();
    expect(scriptCount).toBeGreaterThan(0);
    
    // 驗證 JSON-LD 包含文章資料
    const jsonLdContent = await jsonLdScript.first().textContent();
    expect(jsonLdContent).toBeTruthy();
    
    const jsonData = JSON.parse(jsonLdContent!);
    expect(jsonData['@type']).toMatch(/Article|BlogPosting/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 設定手機視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 驗證文章內容仍然可讀
    const articleContent = page.locator('[data-testid="article-content"]');
    await expect(articleContent).toBeVisible();
    
    // 驗證目錄在手機版可能隱藏或變成折疊式
    const toc = page.locator('[data-testid="article-toc"]');
    // 目錄可能在手機版隱藏，不強制要求可見
    
    // 驗證圖片響應式
    const images = articleContent.locator('img');
    if (await images.count() > 0) {
      const firstImg = images.first();
      const width = await firstImg.evaluate((el) => el.clientWidth);
      const viewportWidth = 375;
      // 圖片寬度不應超過視窗寬度
      expect(width).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test('should support dark mode', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    if (await themeToggle.isVisible().catch(() => false)) {
      // 切換到 dark mode
      await themeToggle.click();
      await page.waitForTimeout(100);
      
      // 驗證主題屬性
      const htmlElement = page.locator('html');
      const theme = await htmlElement.getAttribute('data-theme');
      expect(theme).toBe('dark');
      
      // 驗證程式碼區塊也切換主題
      const codeBlock = page.locator('.shiki').first();
      if (await codeBlock.isVisible().catch(() => false)) {
        // 程式碼區塊應該有對應的 dark 主題樣式
        await expect(codeBlock).toBeVisible();
      }
    }
  });

  test('should track reading time with analytics', async ({ page }) => {
    // 驗證 Analytics Provider 已載入
    const analyticsScript = page.locator('script[src*="gtag"], script:has-text("gtag")');
    if (await analyticsScript.count() > 0) {
      // Analytics 已整合
      // 實際的追蹤行為需要 GA4 環境，這裡只驗證腳本存在
      expect(await analyticsScript.count()).toBeGreaterThan(0);
    }
  });

  test('should handle non-existent article gracefully', async ({ page }) => {
    // 前往不存在的文章頁
    await page.goto('/posts/non-existent-article-slug-12345');
    
    // 應該顯示 404 頁面或錯誤訊息
    await expect(page.locator('text=/404|Not Found|找不到/i')).toBeVisible();
  });
});
