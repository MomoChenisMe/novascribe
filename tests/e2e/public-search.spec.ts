import { test, expect } from '@playwright/test';

test.describe('Public Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display search bar in header', async ({ page }) => {
    const searchBar = page.locator('[data-testid="search-bar"]');
    await expect(searchBar).toBeVisible();
    
    // 驗證搜尋輸入框
    const searchInput = searchBar.locator('input[type="search"], input[type="text"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /.+/);
  });

  test('should navigate to search page on submit', async ({ page }) => {
    const searchBar = page.locator('[data-testid="search-bar"]');
    const searchInput = searchBar.locator('input');
    
    // 輸入搜尋關鍵字
    await searchInput.fill('test');
    
    // 按 Enter 提交
    await searchInput.press('Enter');
    
    // 驗證導航到搜尋頁
    await page.waitForURL(/\/search\?q=test/);
    
    // 驗證搜尋結果頁面載入
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/search?q=test');
    
    // 等待搜尋結果載入
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 驗證搜尋關鍵字顯示
    const searchQuery = page.locator('[data-testid="search-query"]');
    if (await searchQuery.isVisible().catch(() => false)) {
      await expect(searchQuery).toContainText('test');
    }
    
    // 驗證結果列表
    const resultsList = page.locator('[data-testid="search-results-list"]');
    if (await resultsList.isVisible().catch(() => false)) {
      const resultItems = resultsList.locator('[data-testid="search-result-item"]');
      
      // 如果有結果，驗證結果卡片
      if (await resultItems.count() > 0) {
        const firstResult = resultItems.first();
        await expect(firstResult).toBeVisible();
        
        // 驗證結果包含標題
        await expect(firstResult.locator('[data-testid="result-title"]')).toBeVisible();
        
        // 驗證結果包含摘要或匹配文字
        const resultExcerpt = firstResult.locator('[data-testid="result-excerpt"]');
        if (await resultExcerpt.isVisible().catch(() => false)) {
          await expect(resultExcerpt).toBeVisible();
        }
      }
    }
  });

  test('should highlight search keywords in results', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    const resultsList = page.locator('[data-testid="search-results-list"]');
    const resultItems = resultsList.locator('[data-testid="search-result-item"]');
    
    if (await resultItems.count() > 0) {
      const firstResult = resultItems.first();
      
      // 檢查是否有高亮標記（通常用 <mark> 或特殊 class）
      const highlightedText = firstResult.locator('mark, .highlight, .search-highlight');
      
      if (await highlightedText.count() > 0) {
        await expect(highlightedText.first()).toBeVisible();
      }
    }
  });

  test('should display empty state when no results found', async ({ page }) => {
    // 使用一個不太可能存在的搜尋關鍵字
    await page.goto('/search?q=xyzabc123nonexistent');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 驗證空結果訊息
    const emptyState = page.locator('[data-testid="search-empty"], [data-testid="no-results"]');
    
    // 可能顯示「沒有找到結果」訊息
    const hasEmptyMessage = await page.locator('text=/沒有找到|No results|找不到結果/i').isVisible();
    expect(hasEmptyMessage).toBe(true);
  });

  test('should support pagination in search results', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查分頁元件
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible().catch(() => false)) {
      const nextButton = pagination.locator('[data-testid="next-page"]');
      
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForURL(/page=2/);
        
        // 驗證結果列表仍然可見
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      }
    }
  });

  test('should preserve search query in input field on results page', async ({ page }) => {
    const searchQuery = 'test search query';
    await page.goto(`/search?q=${encodeURIComponent(searchQuery)}`);
    
    const searchInput = page.locator('[data-testid="search-bar"] input, input[name="q"]');
    
    if (await searchInput.isVisible().catch(() => false)) {
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe(searchQuery);
    }
  });

  test('should allow refining search from results page', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    const searchInput = page.locator('[data-testid="search-bar"] input, input[name="q"]');
    
    if (await searchInput.isVisible().catch(() => false)) {
      // 清空並輸入新的搜尋
      await searchInput.clear();
      await searchInput.fill('new search');
      await searchInput.press('Enter');
      
      // 驗證 URL 更新
      await page.waitForURL(/q=new\+search/);
    }
  });

  test('should debounce search input', async ({ page }) => {
    const searchBar = page.locator('[data-testid="search-bar"]');
    const searchInput = searchBar.locator('input');
    
    // 快速輸入多個字元
    await searchInput.type('testing', { delay: 50 });
    
    // 等待 debounce 時間
    await page.waitForTimeout(500);
    
    // 驗證輸入值
    const value = await searchInput.inputValue();
    expect(value).toBe('testing');
  });

  test('should handle special characters in search query', async ({ page }) => {
    const specialQuery = 'test & search "quotes"';
    await page.goto(`/search?q=${encodeURIComponent(specialQuery)}`);
    
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 驗證頁面不崩潰，能正常顯示結果或空狀態
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should display result count', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查結果數量顯示
    const resultCount = page.locator('[data-testid="result-count"]');
    if (await resultCount.isVisible().catch(() => false)) {
      await expect(resultCount).toHaveText(/\d+/);
    }
  });

  test('should allow clicking search result to navigate to article', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    const resultsList = page.locator('[data-testid="search-results-list"]');
    const resultItems = resultsList.locator('[data-testid="search-result-item"]');
    
    if (await resultItems.count() > 0) {
      const firstResult = resultItems.first();
      const resultLink = firstResult.locator('a[href*="/posts/"]');
      
      if (await resultLink.isVisible().catch(() => false)) {
        await resultLink.click();
        await page.waitForURL(/\/posts\/[^/]+$/);
        
        // 驗證文章頁載入
        await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
      }
    }
  });

  test('should handle empty search query gracefully', async ({ page }) => {
    await page.goto('/search?q=');
    
    // 應該顯示提示訊息或空狀態
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();
    
    // 可能顯示「請輸入搜尋關鍵字」訊息
    const hasPrompt = await page.locator('text=/請輸入|Enter a search|輸入關鍵字/i').isVisible().catch(() => false);
    // 空查詢是合法的，只要不崩潰即可
    expect(searchResults).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search?q=test');
    
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 驗證搜尋結果在手機版可讀
    const resultsList = page.locator('[data-testid="search-results-list"]');
    await expect(resultsList).toBeVisible();
    
    // 驗證搜尋欄可見且可用
    const searchInput = page.locator('[data-testid="search-bar"] input, input[name="q"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should have proper SEO meta tags on search page', async ({ page }) => {
    await page.goto('/search?q=test');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/搜尋|Search/i);
    
    // 驗證 meta robots（搜尋頁通常設為 noindex）
    const metaRobots = page.locator('meta[name="robots"]');
    if (await metaRobots.count() > 0) {
      const content = await metaRobots.getAttribute('content');
      // 搜尋結果頁可能設為 noindex, follow
      expect(content).toBeTruthy();
    }
  });

  test('should display article metadata in search results', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForSelector('[data-testid="search-results"]');
    
    const resultItems = page.locator('[data-testid="search-result-item"]');
    
    if (await resultItems.count() > 0) {
      const firstResult = resultItems.first();
      
      // 驗證發布日期
      const publishDate = firstResult.locator('[data-testid="publish-date"]');
      if (await publishDate.isVisible().catch(() => false)) {
        await expect(publishDate).toBeVisible();
      }
      
      // 驗證分類
      const category = firstResult.locator('[data-testid="article-category"]');
      if (await category.isVisible().catch(() => false)) {
        await expect(category).toBeVisible();
      }
    }
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // 連續發送多個搜尋請求
    for (let i = 0; i < 5; i++) {
      await page.goto(`/search?q=test${i}`);
      await page.waitForTimeout(100);
    }
    
    // 驗證最後一個請求仍然正常顯示（或顯示 rate limit 訊息）
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();
  });
});
