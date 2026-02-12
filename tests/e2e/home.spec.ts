import { test, expect } from '@playwright/test';

test.describe('首頁', () => {
  test('應顯示 NovaScribe 標題', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('NovaScribe');
  });
});
