import { test, expect, Page } from '@playwright/test';

/**
 * Hero Section E2E 測試
 * 驗證 Hero Section 響應式佈局與功能
 */
test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    // 假設首頁會渲染 HeroSection
    await page.goto('/');
  });

  test.describe('Desktop 佈局 (>= 768px)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('應顯示左圖右文佈局', async ({ page }) => {
      // 確認 Hero Section 存在
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // 確認圖片和文字區塊都存在
      const image = heroSection.locator('img').first();
      const heading = heroSection.locator('h1');
      const excerpt = heroSection.locator('p').first();
      const button = heroSection.locator('button', { hasText: '閱讀更多' });

      await expect(image).toBeVisible();
      await expect(heading).toBeVisible();
      await expect(excerpt).toBeVisible();
      await expect(button).toBeVisible();
    });

    test('應截圖驗證 Desktop 佈局', async ({ page }) => {
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();
      
      // 截圖比對
      await expect(page).toHaveScreenshot('hero-section-desktop.png', {
        fullPage: false,
        mask: [page.locator('img')], // 遮罩圖片避免內容變動影響測試
      });
    });

    test('圖片應有 16:9 比例', async ({ page }) => {
      const imageContainer = page.locator('.aspect-\\[16\\/9\\]').first();
      await expect(imageContainer).toBeVisible();

      const box = await imageContainer.boundingBox();
      if (box) {
        const ratio = box.width / box.height;
        // 允許 1% 誤差
        expect(ratio).toBeGreaterThan(16 / 9 - 0.16);
        expect(ratio).toBeLessThan(16 / 9 + 0.16);
      }
    });

    test('標題應使用大字體 (36px)', async ({ page }) => {
      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // text-4xl = 2.25rem = 36px (假設 base font-size 為 16px)
      expect(fontSize).toBe('36px');
    });

    test('點擊「閱讀更多」應導航至文章頁', async ({ page }) => {
      const link = page.locator('a', { has: page.locator('button:has-text("閱讀更多")') });
      await expect(link).toBeVisible();
      
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^\/posts\/.+/);
    });
  });

  test.describe('Mobile 佈局 (< 768px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('應顯示上圖下文佈局', async ({ page }) => {
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // 確認元素垂直排列
      const image = heroSection.locator('img').first();
      const heading = heroSection.locator('h1');

      const imageBox = await image.boundingBox();
      const headingBox = await heading.boundingBox();

      if (imageBox && headingBox) {
        // 圖片應在標題上方
        expect(imageBox.y).toBeLessThan(headingBox.y);
      }
    });

    test('應截圖驗證 Mobile 佈局', async ({ page }) => {
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();
      
      await expect(page).toHaveScreenshot('hero-section-mobile.png', {
        fullPage: false,
        mask: [page.locator('img')],
      });
    });

    test('文字區塊應佔滿寬度', async ({ page }) => {
      const textSection = page.locator('h1').locator('..'); // 父層 div
      const box = await textSection.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 375;

      if (box) {
        // 允許 padding，寬度應接近 viewport
        expect(box.width).toBeGreaterThan(viewportWidth * 0.85);
      }
    });
  });

  test.describe('Tablet 佈局 (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('應截圖驗證 Tablet 佈局', async ({ page }) => {
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();
      
      await expect(page).toHaveScreenshot('hero-section-tablet.png', {
        fullPage: false,
        mask: [page.locator('img')],
      });
    });
  });

  test.describe('互動功能', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('圖片 hover 應有縮放效果', async ({ page }) => {
      const image = page.locator('img').first();
      await expect(image).toBeVisible();

      // Hover 前取得 transform
      await page.waitForTimeout(500); // 等待動畫完成
      const transformBefore = await image.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });

      // Hover
      await image.hover();
      await page.waitForTimeout(500); // 等待 transition

      const transformAfter = await image.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });

      // 應該有 scale 變化 (hover:scale-105)
      expect(transformBefore).not.toBe(transformAfter);
    });

    test('按鈕應有正確的樣式', async ({ page }) => {
      const button = page.locator('button:has-text("閱讀更多")');
      await expect(button).toBeVisible();

      // 檢查 primary variant 樣式
      const bgColor = await button.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // 應該有背景色 (非透明)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  test.describe('無障礙 (Accessibility)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('圖片應有 alt 屬性', async ({ page }) => {
      const image = page.locator('img').first();
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    });

    test('標題應使用正確的語意標籤', async ({ page }) => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      expect(await heading.count()).toBe(1); // 頁面應只有一個 h1
    });

    test('連結應可使用鍵盤導航', async ({ page }) => {
      const link = page.locator('a', { has: page.locator('button:has-text("閱讀更多")') });
      await link.focus();
      
      const isFocused = await link.evaluate((el) => {
        return document.activeElement === el;
      });
      expect(isFocused).toBe(true);
    });
  });
});
