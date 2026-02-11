## 1. Phase 1: 基礎建設 - Design System 設定

- [ ] 1.1 安裝 Google Fonts (Inter, Noto Sans TC, JetBrains Mono) 至 `app/layout.tsx`
- [ ] 1.2 更新 `tailwind.config.ts`：擴充自訂色票 (primary, bg-main, text-primary 等)
- [ ] 1.3 更新 `tailwind.config.ts`：設定字體家族 (font-sans, font-mono)
- [ ] 1.4 更新 `tailwind.config.ts`：設定預設圓角大小 (rounded-2xl, rounded-full)
- [ ] 1.5 更新 `app/globals.css`：設定全域字體與背景色
- [ ] 1.6 測試：驗證 Tailwind 自訂 Token 可在 IDE 中自動補全

## 2. Phase 1: 基礎 UI 元件庫

- [ ] 2.1 建立 `src/components/ui/Button.tsx` (Primary, Secondary, Outline, Icon variants)
- [ ] 2.2 建立 `src/components/ui/Card.tsx` (基礎卡片，含 Hover 效果)
- [ ] 2.3 建立 `src/components/ui/Tag.tsx` (標籤元件)
- [ ] 2.4 建立 `src/components/ui/Input.tsx` 與 `Textarea.tsx` (表單元件)
- [ ] 2.5 建立 `src/components/ui/Navbar.tsx` (Sticky 導航列)
- [ ] 2.6 建立 `src/components/ui/Footer.tsx` (Footer 元件)
- [ ] 2.7 測試：撰寫 Button 元件單元測試 (所有 variant 渲染正確)
- [ ] 2.8 測試：撰寫 Card 元件單元測試 (Hover 效果正確)
- [ ] 2.9 測試：撰寫 Tag 元件單元測試 (Hover 變色正確)
- [ ] 2.10 測試：執行 jest-axe 驗證所有元件符合 WCAG AA 標準

## 3. Phase 2: 首頁重構 - Hero Section

- [ ] 3.1 建立 `src/components/public/HeroSection.tsx`
- [ ] 3.2 實作 Hero Section 左圖右文佈局 (Desktop)
- [ ] 3.3 實作 Hero Section 上圖下文佈局 (Mobile)
- [ ] 3.4 整合最新文章資料至 Hero Section
- [ ] 3.5 測試：撰寫 HeroSection 元件單元測試
- [ ] 3.6 測試：使用 Playwright 截圖驗證 Hero Section 響應式佈局

## 4. Phase 2: 首頁重構 - Magazine Grid

- [ ] 4.1 建立 `src/components/public/ArticleCard.tsx`
- [ ] 4.2 實作文章卡片 (縮圖 16:9、標題、摘要、分類、日期)
- [ ] 4.3 實作卡片 Hover 效果 (shadow-md + translate-y-1)
- [ ] 4.4 更新 `src/app/(public)/page.tsx`：使用 3 欄網格佈局
- [ ] 4.5 實作分頁導航元件
- [ ] 4.6 測試：撰寫 ArticleCard 元件單元測試
- [ ] 4.7 測試：執行 E2E 測試驗證首頁文章列表與分頁功能

## 5. Phase 2: 首頁重構 - Newsletter 區塊

- [ ] 5.1 建立 `src/components/public/NewsletterForm.tsx`
- [ ] 5.2 實作訂閱表單 UI (Rose 50 背景、Email 輸入框)
- [ ] 5.3 實作表單驗證 (Email 格式檢查)
- [ ] 5.4 實作成功訊息顯示 (暫不整合後端)
- [ ] 5.5 測試：撰寫 NewsletterForm 元件單元測試
- [ ] 5.6 測試：執行 Lighthouse CI 驗證首頁 Performance Score >= 90

## 6. Phase 3: 文章頁優化 - TOC (Table of Contents)

- [ ] 6.1 建立 `src/components/public/TOC.tsx` (Client Component)
- [ ] 6.2 實作 Server-side Markdown heading 解析 (提取 h2/h3 與 id)
- [ ] 6.3 實作目錄 Sticky 定位 (`sticky top-24`)
- [ ] 6.4 實作 IntersectionObserver 監聽當前章節
- [ ] 6.5 實作目錄高亮效果 (Rose 600 文字)
- [ ] 6.6 實作點擊跳轉平滑捲動
- [ ] 6.7 測試：撰寫 TOC 元件單元測試
- [ ] 6.8 測試：執行 E2E 測試驗證目錄高亮與跳轉功能

## 7. Phase 3: 文章頁優化 - 浮動操作按鈕

- [ ] 7.1 建立 `src/components/public/FloatingActions.tsx`
- [ ] 7.2 實作分享按鈕 (Twitter, Facebook, 複製連結)
- [ ] 7.3 實作回到頂部按鈕 (捲動超過 500px 顯示)
- [ ] 7.4 實作平滑捲動至頂部功能
- [ ] 7.5 實作行動裝置定位 (底部固定)
- [ ] 7.6 測試：撰寫 FloatingActions 元件單元測試
- [ ] 7.7 測試：執行 E2E 測試驗證分享與回到頂部功能

## 8. Phase 3: 文章頁優化 - Markdown 樣式

- [ ] 8.1 更新 `app/globals.css`：定義程式碼區塊樣式 (Slate 50 背景、Slate 200 邊框)
- [ ] 8.2 更新 `app/globals.css`：定義引言樣式 (Rose 600 左豎線、Italic 文字)
- [ ] 8.3 更新 `app/globals.css`：定義列表樣式 (縮排與項目符號)
- [ ] 8.4 更新 `src/app/(public)/posts/[slug]/page.tsx`：設定內容寬度 `max-w-[680px]`
- [ ] 8.5 測試：使用 Playwright 截圖驗證 Markdown 樣式正確渲染
- [ ] 8.6 測試：執行 Lighthouse CI 驗證文章頁 Performance Score >= 90

## 9. Phase 4: 其他頁面重構

- [ ] 9.1 更新 `src/app/(public)/categories/[slug]/page.tsx`：套用卡片網格佈局
- [ ] 9.2 更新 `src/app/(public)/tags/[slug]/page.tsx`：套用卡片網格佈局
- [ ] 9.3 更新 `src/app/(public)/about/page.tsx`：套用新 Typography 樣式
- [ ] 9.4 測試：執行 E2E 測試驗證分類/標籤頁功能正常

## 10. Phase 4: 後台 UI 重構

- [ ] 10.1 更新 `src/app/(admin)/layout.tsx`：實作左側邊欄 + 右側內容區佈局
- [ ] 10.2 更新側邊欄樣式 (Stone 50 背景、Rose 600 Hover 文字)
- [ ] 10.3 建立 `src/components/admin/Table.tsx` (表格元件)
- [ ] 10.4 更新文章管理頁面：套用新表格樣式
- [ ] 10.5 更新表單樣式：使用統一的 Input 元件
- [ ] 10.6 測試：執行 E2E 測試驗證後台功能正常

## 11. 視覺回歸測試與驗證

- [ ] 11.1 使用 Playwright 截圖比對首頁 (Desktop + Mobile)
- [ ] 11.2 使用 Playwright 截圖比對文章頁 (Desktop + Mobile)
- [ ] 11.3 使用 Playwright 截圖比對後台頁面
- [ ] 11.4 執行完整的 E2E 測試套件
- [ ] 11.5 執行 Lighthouse CI 驗證所有頁面 Performance Score >= 90
- [ ] 11.6 手動測試鍵盤導航功能
- [ ] 11.7 手動測試 Screen Reader 相容性

## 12. SEO 與 Metadata 驗證

- [ ] 12.1 驗證首頁 meta tags 與 JSON-LD 不變
- [ ] 12.2 驗證文章頁 meta tags 與 JSON-LD 不變
- [ ] 12.3 驗證分類/標籤頁 meta tags 不變
- [ ] 12.4 使用 Google Search Console 驗證 Structured Data 正確

## 13. 文檔與交付

- [ ] 13.1 更新 `docs/plans/2026-02-11-frontend-design-spec.md` (若有變更)
- [ ] 13.2 建立 Migration Guide 文件 (元件庫使用說明)
- [ ] 13.3 更新 README.md (新增 Design System 章節)
- [ ] 13.4 執行最終的測試覆蓋率檢查 (目標 >= 80%)
- [ ] 13.5 Git commit 並推送至 main branch
