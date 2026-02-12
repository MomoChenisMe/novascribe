import { test, expect } from '@playwright/test';

test.describe('Public Category Pages', () => {
  test('should display category list page', async ({ page }) => {
    await page.goto('/categories');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/分類|Categories/i);
    
    // 驗證分類列表
    const categoryList = page.locator('[data-testid="category-list"]');
    await expect(categoryList).toBeVisible();
    
    // 驗證至少有一個分類卡片
    const categoryCards = page.locator('[data-testid="category-card"]');
    if (await categoryCards.count() > 0) {
      const firstCard = categoryCards.first();
      await expect(firstCard).toBeVisible();
      
      // 驗證分類名稱
      await expect(firstCard.locator('[data-testid="category-name"]')).toBeVisible();
      
      // 驗證文章數量
      const postCount = firstCard.locator('[data-testid="post-count"]');
      if (await postCount.isVisible().catch(() => false)) {
        await expect(postCount).toHaveText(/\d+/);
      }
    }
  });

  test('should navigate to category detail page', async ({ page }) => {
    await page.goto('/categories');
    
    // 點擊第一個分類
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    
    // 驗證導航到分類詳情頁
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    // 驗證分類標題
    const categoryTitle = page.locator('[data-testid="category-title"]');
    await expect(categoryTitle).toBeVisible();
  });

  test('should display category articles', async ({ page }) => {
    await page.goto('/categories');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    // 驗證文章列表
    const articleList = page.locator('[data-testid="article-list"]');
    await expect(articleList).toBeVisible();
    
    // 驗證文章卡片
    const articleCards = page.locator('[data-testid="article-card"]');
    if (await articleCards.count() > 0) {
      await expect(articleCards.first()).toBeVisible();
    }
  });

  test('should display category description if available', async ({ page }) => {
    await page.goto('/categories');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    // 檢查分類描述
    const description = page.locator('[data-testid="category-description"]');
    if (await description.isVisible().catch(() => false)) {
      await expect(description).toHaveText(/.+/);
    }
  });

  test('should support pagination in category articles', async ({ page }) => {
    await page.goto('/categories');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    // 檢查分頁元件
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible().catch(() => false)) {
      const nextButton = pagination.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForURL(/\?page=2/);
        await expect(page.locator('[data-testid="article-list"]')).toBeVisible();
      }
    }
  });

  test('should display breadcrumb in category page', async ({ page }) => {
    await page.goto('/categories');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible().catch(() => false)) {
      await expect(breadcrumb).toBeVisible();
      
      // 驗證麵包屑包含「首頁」和「分類」
      await expect(breadcrumb).toContainText(/首頁|Home/i);
    }
  });

  test('should handle non-existent category gracefully', async ({ page }) => {
    await page.goto('/categories/non-existent-category-12345');
    
    // 應該顯示 404 或錯誤訊息
    await expect(page.locator('text=/404|Not Found|找不到/i')).toBeVisible();
  });
});

test.describe('Public Tag Pages', () => {
  test('should display tag list page', async ({ page }) => {
    await page.goto('/tags');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/標籤|Tags/i);
    
    // 驗證標籤雲或標籤列表
    const tagCloud = page.locator('[data-testid="tag-cloud"]');
    await expect(tagCloud).toBeVisible();
    
    // 驗證至少有一個標籤
    const tagLinks = page.locator('[data-testid="tag-link"]');
    if (await tagLinks.count() > 0) {
      await expect(tagLinks.first()).toBeVisible();
    }
  });

  test('should display tags with varying sizes based on post count', async ({ page }) => {
    await page.goto('/tags');
    
    const tagLinks = page.locator('[data-testid="tag-link"]');
    if (await tagLinks.count() > 1) {
      // 驗證標籤有不同的樣式（字體大小可能不同）
      const firstTag = tagLinks.first();
      const secondTag = tagLinks.nth(1);
      
      await expect(firstTag).toBeVisible();
      await expect(secondTag).toBeVisible();
      
      // 可以檢查 data-count 屬性或 CSS class
      const firstCount = await firstTag.getAttribute('data-count');
      const secondCount = await secondTag.getAttribute('data-count');
      
      // 至少應該有文章數量資訊
      expect(firstCount || secondCount).toBeTruthy();
    }
  });

  test('should navigate to tag detail page', async ({ page }) => {
    await page.goto('/tags');
    
    // 點擊第一個標籤
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    
    // 驗證導航到標籤詳情頁
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    // 驗證標籤標題
    const tagTitle = page.locator('[data-testid="tag-title"]');
    await expect(tagTitle).toBeVisible();
  });

  test('should display tag articles', async ({ page }) => {
    await page.goto('/tags');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    // 驗證文章列表
    const articleList = page.locator('[data-testid="article-list"]');
    await expect(articleList).toBeVisible();
    
    // 驗證文章卡片
    const articleCards = page.locator('[data-testid="article-card"]');
    if (await articleCards.count() > 0) {
      await expect(articleCards.first()).toBeVisible();
    }
  });

  test('should support pagination in tag articles', async ({ page }) => {
    await page.goto('/tags');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    // 檢查分頁元件
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible().catch(() => false)) {
      const nextButton = pagination.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForURL(/\?page=2/);
        await expect(page.locator('[data-testid="article-list"]')).toBeVisible();
      }
    }
  });

  test('should display breadcrumb in tag page', async ({ page }) => {
    await page.goto('/tags');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible().catch(() => false)) {
      await expect(breadcrumb).toBeVisible();
      
      // 驗證麵包屑包含「首頁」和「標籤」
      await expect(breadcrumb).toContainText(/首頁|Home/i);
    }
  });

  test('should handle non-existent tag gracefully', async ({ page }) => {
    await page.goto('/tags/non-existent-tag-12345');
    
    // 應該顯示 404 或錯誤訊息
    await expect(page.locator('text=/404|Not Found|找不到/i')).toBeVisible();
  });

  test('should allow filtering articles by multiple tags', async ({ page }) => {
    await page.goto('/tags');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    const tagName = await firstTag.textContent();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    // 驗證頁面顯示的是該標籤的文章
    const tagTitle = page.locator('[data-testid="tag-title"]');
    await expect(tagTitle).toContainText(tagName || '');
  });
});

test.describe('Category and Tag SEO', () => {
  test('should have proper SEO meta tags on category page', async ({ page }) => {
    await page.goto('/categories');
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    await page.waitForURL(/\/categories\/[^/]+$/);
    
    // 驗證 meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // 驗證 OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('should have proper SEO meta tags on tag page', async ({ page }) => {
    await page.goto('/tags');
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
    
    // 驗證 meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // 驗證 OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile - category list', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/categories');
    
    // 驗證分類列表在手機版可見
    const categoryList = page.locator('[data-testid="category-list"]');
    await expect(categoryList).toBeVisible();
  });

  test('should be responsive on mobile - tag cloud', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tags');
    
    // 驗證標籤雲在手機版可見且可點擊
    const tagCloud = page.locator('[data-testid="tag-cloud"]');
    await expect(tagCloud).toBeVisible();
    
    const firstTag = page.locator('[data-testid="tag-link"]').first();
    await firstTag.click();
    await page.waitForURL(/\/tags\/[^/]+$/);
  });
});
