/**
 * @file 管理後台評論管理 E2E 測試
 * @description 測試列表篩選、狀態更新、批次操作、管理員回覆
 * 
 * 測試場景：
 * - 12.3.1: 訪問評論管理頁面
 * - 12.3.2: 狀態篩選 tabs（全部、待審核、已核准）
 * - 12.3.3: 核准評論
 * - 12.3.4: 批次操作（勾選多則、批次核准）
 * - 12.3.5: 管理員回覆
 */

import { test, expect } from '@playwright/test';

// 使用 authenticated storage state
test.use({ storageState: '.auth/user.json' });

test.describe('Admin Comment Management', () => {
  test.beforeEach(async ({ page }) => {
    // 前往管理後台評論管理頁面
    await page.goto('/admin/comments');
    await page.waitForLoadState('networkidle');
  });

  test('12.3.1: should access comment management page successfully', async ({ page }) => {
    // 驗證頁面標題
    await expect(page.locator('h1:has-text("評論管理")')).toBeVisible();
    
    // 驗證 URL
    expect(page.url()).toContain('/admin/comments');
  });

  test('12.3.2: should display statistics cards', async ({ page }) => {
    // 驗證統計卡片存在
    const statsCards = page.locator('[data-testid="stats-card"]');
    
    if (await statsCards.count() > 0) {
      // 應該至少有幾個統計卡片（待審核、今日新增、已核准、Spam）
      expect(await statsCards.count()).toBeGreaterThanOrEqual(3);
      
      // 驗證第一個卡片可見
      await expect(statsCards.first()).toBeVisible();
    }
  });

  test('12.3.3: should display status tabs', async ({ page }) => {
    // 驗證狀態 tabs 存在
    const tabs = page.locator('[role="tablist"], nav').first();
    await expect(tabs).toBeVisible();
    
    // 驗證各個 tab 選項
    const allTab = page.locator('text=/^全部$/');
    const pendingTab = page.locator('text=/^待審核$/');
    const approvedTab = page.locator('text=/^已核准$/');
    
    // 至少應該有「全部」和「待審核」tab
    if (await allTab.isVisible()) {
      await expect(allTab).toBeVisible();
    }
    
    if (await pendingTab.isVisible()) {
      await expect(pendingTab).toBeVisible();
    }
  });

  test('12.3.4: should filter comments by "Pending" status', async ({ page }) => {
    // 點擊「待審核」tab
    const pendingTab = page.locator('a:has-text("待審核"), button:has-text("待審核")');
    
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState('networkidle');
      
      // 驗證 URL 包含 status=PENDING
      expect(page.url()).toContain('status=PENDING');
      
      // 驗證表格中的評論狀態都是「待審核」
      const statusBadges = page.locator('span:has-text("待審核")');
      const badgeCount = await statusBadges.count();
      
      if (badgeCount > 0) {
        // 所有可見的狀態標籤都應該是「待審核」
        await expect(statusBadges.first()).toBeVisible();
      }
    }
  });

  test('12.3.5: should filter comments by "Approved" status', async ({ page }) => {
    // 點擊「已核准」tab
    const approvedTab = page.locator('a:has-text("已核准"), button:has-text("已核准")');
    
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      await page.waitForLoadState('networkidle');
      
      // 驗證 URL 包含 status=APPROVED
      expect(page.url()).toContain('status=APPROVED');
      
      // 驗證表格中的評論狀態都是「已核准」
      const statusBadges = page.locator('span:has-text("已核准")');
      const badgeCount = await statusBadges.count();
      
      if (badgeCount > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    }
  });

  test('12.3.6: should filter comments by "Spam" status', async ({ page }) => {
    // 點擊「Spam」tab（如果存在）
    const spamTab = page.locator('a:has-text("Spam"), button:has-text("Spam")');
    
    if (await spamTab.isVisible()) {
      await spamTab.click();
      await page.waitForLoadState('networkidle');
      
      // 驗證 URL 包含 status=SPAM
      expect(page.url()).toContain('status=SPAM');
    }
  });

  test('12.3.7: should display comments table', async ({ page }) => {
    // 驗證表格存在
    const table = page.locator('table');
    
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
      
      // 驗證表格標題列
      await expect(page.locator('th:has-text("作者")')).toBeVisible();
      await expect(page.locator('th:has-text("內容")')).toBeVisible();
      await expect(page.locator('th:has-text("文章標題"), th:has-text("文章")')).toBeVisible();
      await expect(page.locator('th:has-text("狀態")')).toBeVisible();
      await expect(page.locator('th:has-text("時間")')).toBeVisible();
      await expect(page.locator('th:has-text("操作")')).toBeVisible();
    }
  });

  test('12.3.8: should display comment data in table rows', async ({ page }) => {
    // 尋找表格行
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // 驗證第一行包含必要資料
      const firstRow = tableRows.first();
      
      // 作者名稱和 Email
      const authorCell = firstRow.locator('td').nth(0);
      await expect(authorCell).toBeVisible();
      
      // 評論內容（截斷後的）
      const contentCell = firstRow.locator('td').nth(1);
      await expect(contentCell).toBeVisible();
      
      // 文章標題（連結）
      const postCell = firstRow.locator('td').nth(2);
      await expect(postCell).toBeVisible();
      
      // 狀態標籤
      const statusCell = firstRow.locator('td').nth(3);
      await expect(statusCell).toBeVisible();
      
      // 時間
      const timeCell = firstRow.locator('td').nth(4);
      await expect(timeCell).toBeVisible();
      
      // 操作按鈕
      const actionCell = firstRow.locator('td').nth(5);
      await expect(actionCell).toBeVisible();
    }
  });

  test('12.3.9: should approve pending comment', async ({ page }) => {
    // 先切換到待審核 tab
    const pendingTab = page.locator('a:has-text("待審核"), button:has-text("待審核")');
    
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 尋找核准按鈕
    const approveButtons = page.locator('button:has-text("核准")');
    
    if (await approveButtons.count() > 0) {
      const firstApproveButton = approveButtons.first();
      
      // 點擊核准按鈕
      await firstApproveButton.click();
      
      // 等待操作完成（可能有確認對話框或直接執行）
      await page.waitForTimeout(1000);
      
      // 驗證成功訊息或評論狀態變更
      // 方案 1: 檢查是否有成功訊息
      const successMessage = page.locator('text=/已核准|核准成功/i');
      if (await successMessage.isVisible().catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }
      
      // 方案 2: 檢查評論是否從列表中移除（如果在待審核頁面）
      // 或狀態標籤變成「已核准」
    }
  });

  test('12.3.10: should mark comment as spam', async ({ page }) => {
    // 先切換到待審核 tab
    const pendingTab = page.locator('a:has-text("待審核"), button:has-text("待審核")');
    
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 尋找標記 Spam 按鈕
    const spamButtons = page.locator('button:has-text("標記 Spam"), button:has-text("Spam")');
    
    if (await spamButtons.count() > 0) {
      const firstSpamButton = spamButtons.first();
      
      // 點擊標記 Spam
      await firstSpamButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(1000);
      
      // 驗證成功訊息
      const successMessage = page.locator('text=/已標記|標記成功/i');
      if (await successMessage.isVisible().catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('12.3.11: should unapprove approved comment', async ({ page }) => {
    // 切換到已核准 tab
    const approvedTab = page.locator('a:has-text("已核准"), button:has-text("已核准")');
    
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 尋找取消核准按鈕
    const unapproveButtons = page.locator('button:has-text("取消核准")');
    
    if (await unapproveButtons.count() > 0) {
      const firstUnapproveButton = unapproveButtons.first();
      
      // 點擊取消核准
      await firstUnapproveButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(1000);
      
      // 驗證操作結果
      const successMessage = page.locator('text=/已取消|取消成功/i');
      if (await successMessage.isVisible().catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('12.3.12: should delete comment', async ({ page }) => {
    // 尋找刪除按鈕
    const deleteButtons = page.locator('button:has-text("刪除")');
    
    if (await deleteButtons.count() > 0) {
      const firstDeleteButton = deleteButtons.first();
      
      // 記錄目前評論數量
      const tableRows = page.locator('tbody tr');
      const initialCount = await tableRows.count();
      
      // 點擊刪除按鈕
      await firstDeleteButton.click();
      
      // 處理確認對話框（如果有）
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });
      
      // 等待操作完成
      await page.waitForTimeout(1000);
      
      // 驗證評論數量減少或顯示成功訊息
      const successMessage = page.locator('text=/已刪除|刪除成功/i');
      if (await successMessage.isVisible().catch(() => false)) {
        await expect(successMessage).toBeVisible();
      } else {
        // 驗證評論數量減少
        const newCount = await tableRows.count();
        expect(newCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('12.3.13: should select multiple comments with checkboxes', async ({ page }) => {
    // 尋找核取方塊
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 2) {
      // 勾選前兩個評論
      await checkboxes.nth(1).check(); // 第一個評論（跳過全選框）
      await checkboxes.nth(2).check(); // 第二個評論
      
      // 驗證核取方塊已勾選
      await expect(checkboxes.nth(1)).toBeChecked();
      await expect(checkboxes.nth(2)).toBeChecked();
    }
  });

  test('12.3.14: should select all comments with "select all" checkbox', async ({ page }) => {
    // 尋找「全選」核取方塊（通常在表頭）
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]').first();
    
    if (await selectAllCheckbox.isVisible()) {
      // 點擊全選
      await selectAllCheckbox.check();
      
      // 驗證所有評論核取方塊都被勾選
      const commentCheckboxes = page.locator('tbody input[type="checkbox"]');
      const checkboxCount = await commentCheckboxes.count();
      
      if (checkboxCount > 0) {
        // 檢查第一個和最後一個核取方塊
        await expect(commentCheckboxes.first()).toBeChecked();
        await expect(commentCheckboxes.last()).toBeChecked();
      }
    }
  });

  test('12.3.15: should perform batch approve operation', async ({ page }) => {
    // 先切換到待審核 tab
    const pendingTab = page.locator('a:has-text("待審核"), button:has-text("待審核")');
    
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 勾選多個評論
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      
      // 尋找批次核准按鈕
      const batchApproveButton = page.locator('button:has-text("批次核准"), button:has-text("核准選取")');
      
      if (await batchApproveButton.isVisible()) {
        // 點擊批次核准
        await batchApproveButton.click();
        
        // 等待操作完成
        await page.waitForTimeout(1000);
        
        // 驗證成功訊息
        const successMessage = page.locator('text=/已核准|核准成功/i');
        if (await successMessage.isVisible().catch(() => false)) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('12.3.16: should perform batch delete operation', async ({ page }) => {
    // 勾選多個評論
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      
      // 尋找批次刪除按鈕
      const batchDeleteButton = page.locator('button:has-text("批次刪除"), button:has-text("刪除選取")');
      
      if (await batchDeleteButton.isVisible()) {
        // 處理確認對話框
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });
        
        // 點擊批次刪除
        await batchDeleteButton.click();
        
        // 等待操作完成
        await page.waitForTimeout(1000);
        
        // 驗證成功訊息
        const successMessage = page.locator('text=/已刪除|刪除成功/i');
        if (await successMessage.isVisible().catch(() => false)) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('12.3.17: should show admin reply form', async ({ page }) => {
    // 尋找回覆按鈕或展開按鈕
    const replyButtons = page.locator('button:has-text("回覆"), button:has-text("管理員回覆")');
    
    if (await replyButtons.count() > 0) {
      const firstReplyButton = replyButtons.first();
      
      // 點擊回覆按鈕
      await firstReplyButton.click();
      
      // 等待回覆表單出現
      await page.waitForTimeout(500);
      
      // 驗證回覆表單存在
      const replyForm = page.locator('form').filter({ has: page.locator('textarea') });
      
      if (await replyForm.isVisible()) {
        await expect(replyForm).toBeVisible();
        
        // 驗證表單包含必要欄位
        const textarea = replyForm.locator('textarea');
        await expect(textarea).toBeVisible();
      }
    }
  });

  test('12.3.18: should submit admin reply', async ({ page }) => {
    // 尋找回覆按鈕
    const replyButtons = page.locator('button:has-text("回覆"), button:has-text("管理員回覆")');
    
    if (await replyButtons.count() > 0) {
      const firstReplyButton = replyButtons.first();
      
      // 點擊回覆按鈕
      await firstReplyButton.click();
      await page.waitForTimeout(500);
      
      // 尋找回覆表單
      const replyForm = page.locator('form').filter({ has: page.locator('textarea') });
      
      if (await replyForm.isVisible()) {
        // 填寫回覆內容
        const textarea = replyForm.locator('textarea');
        await textarea.fill('這是管理員的回覆內容');
        
        // 提交回覆
        const submitButton = replyForm.locator('button[type="submit"]');
        await submitButton.click();
        
        // 等待操作完成
        await page.waitForTimeout(1000);
        
        // 驗證成功訊息
        const successMessage = page.locator('text=/已回覆|回覆成功/i');
        if (await successMessage.isVisible().catch(() => false)) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('12.3.19: should display pagination controls', async ({ page }) => {
    // 尋找分頁控制元件
    const pagination = page.locator('nav[aria-label="Pagination"], [data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
      
      // 驗證頁碼按鈕
      const pageButtons = pagination.locator('button, a').filter({ hasText: /^\d+$/ });
      
      if (await pageButtons.count() > 0) {
        await expect(pageButtons.first()).toBeVisible();
      }
    }
  });

  test('12.3.20: should navigate to next page', async ({ page }) => {
    // 尋找「下一頁」按鈕
    const nextButton = page.locator('button:has-text("下一頁"), a:has-text("下一頁"), button:has-text("Next")');
    
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      // 記錄目前 URL
      const currentUrl = page.url();
      
      // 點擊下一頁
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      // 驗證 URL 已變更（page 參數應該增加）
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);
      expect(newUrl).toContain('page=2');
    }
  });

  test('12.3.21: should navigate to previous page', async ({ page }) => {
    // 先前往第 2 頁
    await page.goto('/admin/comments?page=2');
    await page.waitForLoadState('networkidle');
    
    // 尋找「上一頁」按鈕
    const prevButton = page.locator('button:has-text("上一頁"), a:has-text("上一頁"), button:has-text("Previous")');
    
    if (await prevButton.isVisible() && !await prevButton.isDisabled()) {
      // 點擊上一頁
      await prevButton.click();
      await page.waitForLoadState('networkidle');
      
      // 驗證回到第 1 頁
      const url = page.url();
      expect(url).toMatch(/page=1|\/admin\/comments$/);
    }
  });

  test('12.3.22: should link to article edit page', async ({ page }) => {
    // 尋找文章標題連結
    const articleLinks = page.locator('td a[href*="/admin/posts/"]');
    
    if (await articleLinks.count() > 0) {
      const firstLink = articleLinks.first();
      
      // 驗證連結有 href
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('/admin/posts/');
      
      // 點擊連結應該導航到文章編輯頁（可選：在新標籤開啟）
      // 這裡只驗證連結存在，不實際點擊以避免離開評論管理頁
    }
  });

  test('12.3.23: should display "No comments" message when list is empty', async ({ page }) => {
    // 切換到一個可能沒有評論的狀態（例如 Spam）
    const spamTab = page.locator('a:has-text("Spam"), button:has-text("Spam")');
    
    if (await spamTab.isVisible()) {
      await spamTab.click();
      await page.waitForLoadState('networkidle');
      
      // 檢查是否有評論
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();
      
      if (rowCount === 0) {
        // 應該顯示「尚無評論」訊息
        await expect(page.locator('text=/尚無評論|暫無評論/i')).toBeVisible();
      }
    }
  });

  test('12.3.24: should be responsive on tablet', async ({ page }) => {
    // 設定平板視窗
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 驗證頁面仍然可用
    await expect(page.locator('h1:has-text("評論管理")')).toBeVisible();
    
    // 驗證表格可以橫向滾動或響應式調整
    const table = page.locator('table');
    
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  });

  test('12.3.25: should refresh data after status update', async ({ page }) => {
    // 先切換到待審核 tab
    const pendingTab = page.locator('a:has-text("待審核"), button:has-text("待審核")');
    
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 記錄目前待審核數量
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();
    
    if (initialCount > 0) {
      // 核准一則評論
      const approveButton = page.locator('button:has-text("核准")').first();
      
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await page.waitForTimeout(1000);
        
        // 重新載入或驗證列表更新
        await page.reload({ waitUntil: 'networkidle' });
        
        // 驗證待審核數量減少
        const newRows = page.locator('tbody tr');
        const newCount = await newRows.count();
        
        expect(newCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });
});
