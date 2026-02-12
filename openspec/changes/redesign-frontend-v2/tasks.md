## 1. 基礎建設 - Design System 更新

- [ ] 1.1 更新 `tailwind.config.ts`：調整 `colors` 權重與新增 `layout` 相關的 spacing/width tokens
- [ ] 1.2 更新 `src/app/globals.css`：定義新的 CSS Variables 與 `@theme` 設定
- [ ] 1.3 測試：驗證 Tailwind 配置是否正確生效

## 2. Layout 元件實作 - Sidebar & Header

- [ ] 2.1 建立 `src/components/public/layout/Sidebar.tsx` (Desktop 導航)
- [ ] 2.2 實作 Sidebar 內容 (Logo, 簡介, 導航連結, 社群圖示)
- [ ] 2.3 建立 `src/components/public/layout/MobileHeader.tsx` (Mobile 置頂導航)
- [ ] 2.4 實作 Mobile Drawer/Menu 互動邏輯
- [ ] 2.5 測試：撰寫 Sidebar 與 MobileHeader 的單元測試 (RTL)
- [ ] 2.6 測試：驗證響應式行為 (Desktop 顯示 Sidebar, Mobile 顯示 Header)

## 3. Layout 元件實作 - Rich Footer

- [ ] 3.1 建立 `src/components/public/layout/RichFooter.tsx`
- [ ] 3.2 實作 Footer 3 欄式佈局 (Brand, Links, Legal)
- [ ] 3.3 實作「免責聲明」與「專業證照」區塊
- [ ] 3.4 測試：撰寫 RichFooter 的單元測試 (確保內容正確渲染)
- [ ] 3.5 測試：驗證 Footer 響應式佈局 (Mobile 單欄, Desktop 3 欄)

## 4. Layout 整合 (MainLayout)

- [ ] 4.1 建立 `src/components/public/layout/MainLayout.tsx`
- [ ] 4.2 整合 Sidebar, MobileHeader, RichFooter 與 Main Content 區域
- [ ] 4.3 修改 `src/app/(public)/layout.tsx`：替換為新的 MainLayout
- [ ] 4.4 移除舊版 `Navbar.tsx` 與 `Footer.tsx` 引用
- [ ] 4.5 測試：撰寫 MainLayout 整合測試
- [ ] 4.6 測試：使用 Playwright 截圖驗證全站 Layout 結構 (Desktop & Mobile)

## 5. 頁面適配 - 首頁

- [ ] 5.1 修改 `src/app/(public)/page.tsx`：調整 Hero Section 樣式以適應新 Layout
- [ ] 5.2 修改 Article Grid 響應式斷點 (2 欄/3 欄切換策略)
- [ ] 5.3 測試：驗證首頁在寬螢幕與窄螢幕下的顯示效果
- [ ] 5.4 測試：執行 Lighthouse CI 驗證 Performance Score

## 6. 頁面適配 - 文章頁與其他頁面

- [ ] 6.1 修改 `src/app/(public)/posts/[slug]/page.tsx`：確保文章內容寬度限制 (Reading Width)
- [ ] 6.2 驗證 TOC 元件在 Sidebar 佈局下的定位行為
- [ ] 6.3 測試：驗證文章頁閱讀體驗 (字體、行高、寬度)
- [ ] 6.4 測試：驗證分類、標籤、關於頁的 Layout 適配

## 7. 最終驗證與交付

- [ ] 7.1 執行全站 E2E 測試套件
- [ ] 7.2 執行視覺回歸測試 (Visual Regression Test)
- [ ] 7.3 檢查 Accessibility (WCAG AA)
- [ ] 7.4 更新文件 (Design Spec, Migration Guide)
