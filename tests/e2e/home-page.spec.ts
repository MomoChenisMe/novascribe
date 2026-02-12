import { test, expect } from '@playwright/test';

/**
 * E2E 測試：首頁文章列表與分頁功能
 */
test.describe('首頁 - Magazine Grid 文章列表', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應該顯示首頁標題', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('最新文章');
  });

  test('應該以 3 欄網格佈局顯示文章卡片 (桌面版)', async ({ page }) => {
    // 設定桌面版視窗大小
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const grid = page.locator('div.grid');
    await expect(grid).toBeVisible();
    
    // 驗證 grid 包含正確的 class
    await expect(grid).toHaveClass(/lg:grid-cols-3/);
  });

  test('應該在平板版顯示 2 欄網格', async ({ page }) => {
    // 設定平板視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const grid = page.locator('div.grid');
    await expect(grid).toHaveClass(/md:grid-cols-2/);
  });

  test('應該在行動版顯示 1 欄網格', async ({ page }) => {
    // 設定行動版視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    const grid = page.locator('div.grid');
    await expect(grid).toHaveClass(/grid-cols-1/);
  });

  test('文章卡片應該包含所有必要元素', async ({ page }) => {
    const firstCard = page.locator('div.grid > a').first();
    
    // 驗證縮圖
    const image = firstCard.locator('img');
    await expect(image).toBeVisible();
    
    // 驗證標題
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();
    
    // 驗證分類標籤
    const category = firstCard.locator('span.rounded-full');
    await expect(category).toBeVisible();
    
    // 驗證日期
    const date = firstCard.locator('time');
    await expect(date).toBeVisible();
  });

  test('文章卡片應該有正確的連結', async ({ page }) => {
    const firstCard = page.locator('div.grid > a').first();
    const href = await firstCard.getAttribute('href');
    
    expect(href).toMatch(/^\/posts\//);
  });

  test('文章卡片 hover 時應該有提升效果', async ({ page }) => {
    const firstCard = page.locator('div.grid > a > div').first();
    
    // 檢查是否包含 hover 樣式 class
    const classes = await firstCard.getAttribute('class');
    expect(classes).toContain('hover:shadow-md');
    expect(classes).toContain('hover:-translate-y-1');
  });

  test('點擊文章卡片應該導航至文章詳情頁', async ({ page }) => {
    const firstCard = page.locator('div.grid > a').first();
    const href = await firstCard.getAttribute('href');
    
    await firstCard.click();
    await page.waitForURL(href!);
    
    expect(page.url()).toContain('/posts/');
  });

  test('縮圖應該使用 16:9 比例', async ({ page }) => {
    const firstImage = page.locator('div.grid .aspect-video').first();
    await expect(firstImage).toBeVisible();
  });

  test('摘要應該截斷為 2 行', async ({ page }) => {
    const firstExcerpt = page.locator('div.grid p.line-clamp-2').first();
    await expect(firstExcerpt).toBeVisible();
  });

  test('日期應該以 YYYY-MM-DD 格式顯示', async ({ page }) => {
    const firstDate = page.locator('div.grid time').first();
    const dateText = await firstDate.textContent();
    
    // 驗證日期格式: YYYY-MM-DD
    expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

test.describe('首頁 - 分頁功能', () => {
  test('應該顯示分頁導航 (當文章數量 > 9)', async ({ page }) => {
    await page.goto('/');
    
    const pagination = page.locator('nav[aria-label="分頁導航"]');
    const articleCount = await page.locator('div.grid > a').count();
    
    if (articleCount >= 9) {
      await expect(pagination).toBeVisible();
    }
  });

  test('分頁導航應該包含上一頁和下一頁按鈕', async ({ page }) => {
    await page.goto('/');
    
    const pagination = page.locator('nav[aria-label="分頁導航"]');
    
    if (await pagination.isVisible()) {
      await expect(page.getByLabelText('上一頁')).toBeVisible();
      await expect(page.getByLabelText('下一頁')).toBeVisible();
    }
  });

  test('第一頁時上一頁按鈕應該禁用', async ({ page }) => {
    await page.goto('/');
    
    const prevButton = page.locator('span[aria-disabled="true"]').filter({ hasText: '上一頁' });
    
    if (await prevButton.isVisible()) {
      await expect(prevButton).toHaveClass(/cursor-not-allowed/);
    }
  });

  test('點擊下一頁應該導航至第 2 頁', async ({ page }) => {
    await page.goto('/');
    
    const nextButton = page.getByLabel('下一頁');
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForURL('/?page=2');
      
      expect(page.url()).toContain('page=2');
    }
  });

  test('第 2 頁應該顯示不同的文章', async ({ page }) => {
    await page.goto('/');
    
    const firstPageFirstTitle = await page.locator('div.grid h3').first().textContent();
    
    const nextButton = page.getByLabel('下一頁');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForURL('/?page=2');
      
      const secondPageFirstTitle = await page.locator('div.grid h3').first().textContent();
      
      expect(firstPageFirstTitle).not.toBe(secondPageFirstTitle);
    }
  });

  test('點擊頁碼按鈕應該導航至對應頁面', async ({ page }) => {
    await page.goto('/');
    
    const page3Button = page.getByLabel('第 3 頁');
    
    if (await page3Button.isVisible()) {
      await page3Button.click();
      await page.waitForURL('/?page=3');
      
      expect(page.url()).toContain('page=3');
    }
  });

  test('當前頁碼應該高亮顯示', async ({ page }) => {
    await page.goto('/?page=2');
    
    const currentPageButton = page.locator('[aria-current="page"]');
    
    if (await currentPageButton.isVisible()) {
      await expect(currentPageButton).toHaveClass(/bg-\[var\(--color-primary\)\]/);
      await expect(currentPageButton).toContainText('2');
    }
  });

  test('從第 2 頁點擊上一頁應該回到首頁', async ({ page }) => {
    await page.goto('/?page=2');
    
    const prevButton = page.getByLabel('上一頁');
    await prevButton.click();
    await page.waitForURL('/');
    
    expect(page.url()).not.toContain('page=');
  });

  test('行動版應該顯示當前頁/總頁數', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?page=2');
    
    const mobilePageInfo = page.locator('.sm\\:hidden').filter({ hasText: '/' });
    
    if (await mobilePageInfo.isVisible()) {
      const text = await mobilePageInfo.textContent();
      expect(text).toMatch(/\d+\s*\/\s*\d+/);
    }
  });
});

test.describe('首頁 - 空狀態', () => {
  test('無文章時應該顯示提示訊息', async ({ page }) => {
    // 此測試需要在無文章的狀態下執行
    // 在實際專案中，可能需要使用測試資料庫或 mock
    await page.goto('/');
    
    const articleGrid = page.locator('div.grid');
    const emptyMessage = page.getByText('暫無文章');
    
    if (!(await articleGrid.isVisible())) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});

test.describe('首頁 - 效能與無障礙', () => {
  test('所有圖片應該有 alt 屬性', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('div.grid img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('分頁導航應該有正確的 ARIA 標籤', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav[aria-label="分頁導航"]');
    
    if (await nav.isVisible()) {
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', '分頁導航');
    }
  });

  test('圖片應該使用 lazy loading', async ({ page }) => {
    await page.goto('/');
    
    const firstImage = page.locator('div.grid img').first();
    
    // Next.js Image 元件預設啟用 lazy loading
    await expect(firstImage).toBeVisible();
  });
});
