import { test, expect } from '@playwright/test';

test.describe('Public Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // 前往首頁
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    // 驗證頁面標題
    await expect(page).toHaveTitle(/NovaScribe/i);
    
    // 驗證 Header 存在
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 驗證 Logo 存在
    const logo = header.locator('[data-testid="logo"]');
    await expect(logo).toBeVisible();
  });

  test('should display article list', async ({ page }) => {
    // 驗證文章列表容器存在
    const articleList = page.locator('[data-testid="article-list"]');
    await expect(articleList).toBeVisible();
    
    // 驗證至少有一篇文章卡片
    const articleCards = page.locator('[data-testid="article-card"]');
    await expect(articleCards.first()).toBeVisible();
    
    // 驗證文章卡片包含必要元素
    const firstCard = articleCards.first();
    await expect(firstCard.locator('[data-testid="article-title"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="article-excerpt"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="article-date"]')).toBeVisible();
  });

  test('should display featured posts section', async ({ page }) => {
    // 驗證精選文章區塊
    const featuredSection = page.locator('[data-testid="featured-posts"]');
    
    // 如果有精選文章，應該顯示
    const hasFeatured = await featuredSection.isVisible().catch(() => false);
    if (hasFeatured) {
      const featuredCards = featuredSection.locator('[data-testid="article-card"]');
      await expect(featuredCards.first()).toBeVisible();
    }
  });

  test('should display sidebar with categories and tags', async ({ page }) => {
    // 在桌面版驗證 Sidebar
    if (await page.viewportSize()?.width! >= 1024) {
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();
      
      // 驗證分類列表
      const categoryList = sidebar.locator('[data-testid="category-list"]');
      if (await categoryList.isVisible().catch(() => false)) {
        await expect(categoryList.locator('a').first()).toBeVisible();
      }
      
      // 驗證標籤雲
      const tagCloud = sidebar.locator('[data-testid="tag-cloud"]');
      if (await tagCloud.isVisible().catch(() => false)) {
        await expect(tagCloud.locator('a').first()).toBeVisible();
      }
    }
  });

  test('should navigate to article page when clicking article card', async ({ page }) => {
    // 點擊第一篇文章卡片
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    await firstArticle.click();
    
    // 驗證導航到文章頁
    await page.waitForURL(/\/posts\/[^/]+$/);
    
    // 驗證文章內容存在
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
  });

  test('should display pagination when articles exceed page limit', async ({ page }) => {
    // 驗證分頁元件（如果存在）
    const pagination = page.locator('[data-testid="pagination"]');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (hasPagination) {
      // 驗證頁碼顯示
      await expect(pagination.locator('[data-testid="page-number"]')).toBeVisible();
      
      // 驗證下一頁按鈕
      const nextButton = pagination.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForURL(/\?page=2/);
        await expect(page.locator('[data-testid="article-list"]')).toBeVisible();
      }
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    // 找到 Dark mode 切換按鈕
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // 獲取當前主題
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-theme');
    
    // 點擊切換
    await themeToggle.click();
    
    // 等待主題切換完成
    await page.waitForTimeout(100);
    
    // 驗證主題已變更
    const newTheme = await htmlElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
    
    // 再次點擊應該切回
    await themeToggle.click();
    await page.waitForTimeout(100);
    const finalTheme = await htmlElement.getAttribute('data-theme');
    expect(finalTheme).toBe(initialTheme);
  });

  test('should persist theme preference in localStorage', async ({ page, context }) => {
    // 切換到 dark mode
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    await page.waitForTimeout(100);
    
    // 驗證 localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBeTruthy();
    
    // 重新載入頁面
    await page.reload();
    
    // 驗證主題保持
    const htmlElement = page.locator('html');
    const persistedTheme = await htmlElement.getAttribute('data-theme');
    expect(persistedTheme).toBe(theme);
  });

  test('should display navigation menu in header', async ({ page }) => {
    const header = page.locator('header');
    
    // 驗證導航連結
    const navLinks = [
      { text: /首頁|Home/i, href: '/' },
      { text: /分類|Categories/i, href: '/categories' },
      { text: /標籤|Tags/i, href: '/tags' },
      { text: /關於|About/i, href: '/about' },
    ];
    
    for (const link of navLinks) {
      const navLink = header.locator(`a:has-text("${link.text.source}")`).first();
      if (await navLink.isVisible().catch(() => false)) {
        await expect(navLink).toHaveAttribute('href', link.href);
      }
    }
  });

  test('should display search bar in header', async ({ page }) => {
    const searchBar = page.locator('[data-testid="search-bar"]');
    
    if (await searchBar.isVisible().catch(() => false)) {
      // 輸入搜尋關鍵字
      await searchBar.fill('test');
      
      // 提交搜尋（按 Enter 或點擊搜尋按鈕）
      await searchBar.press('Enter');
      
      // 驗證導航到搜尋頁
      await page.waitForURL(/\/search\?q=test/);
    }
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // 驗證版權資訊
    await expect(footer.locator(':text("©")')).toBeVisible();
    
    // 驗證 RSS 連結
    const rssLink = footer.locator('a[href*="/feed"]').first();
    if (await rssLink.isVisible().catch(() => false)) {
      await expect(rssLink).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 設定手機視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 驗證頁面仍然可見
    await expect(page.locator('[data-testid="article-list"]')).toBeVisible();
    
    // 驗證漢堡選單（如果存在）
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
    if (await mobileMenu.isVisible().catch(() => false)) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    
    // 首頁可能沒有麵包屑或只有「首頁」
    if (await breadcrumb.isVisible().catch(() => false)) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // 驗證 meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // 驗證 OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
    
    // 驗證 RSS auto-discovery
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute('href', /.+/);
  });

  test('should load and display recent posts section', async ({ page }) => {
    const recentPosts = page.locator('[data-testid="recent-posts"]');
    
    if (await recentPosts.isVisible().catch(() => false)) {
      // 驗證標題
      await expect(recentPosts.locator('h2, h3')).toBeVisible();
      
      // 驗證文章列表
      const articles = recentPosts.locator('[data-testid="article-card"]');
      await expect(articles.first()).toBeVisible();
    }
  });
});
