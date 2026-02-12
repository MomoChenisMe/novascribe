## 1. 基礎建設 - Design System 調整

- [x] 1.1 更新 `tailwind.config.ts`：調整色彩變數 (Accents Only 策略)
- [x] 1.2 更新 `src/app/globals.css`：設定 Monochrome 基底色與 Typography (Full Sans)
- [ ] 1.3 測試：驗證色彩與字體變更生效

## 2. Layout 核心 - Minimal Navigation

- [x] 2.1 建立 `src/components/public/layout/NavToggle.tsx` (Hamburger Button)
- [x] 2.2 建立 `src/components/public/layout/SideDrawer.tsx` (導航面板)
- [x] 2.3 實作 Drawer 開關邏輯 (Zustand 或 Context)
- [x] 2.4 實作 Drawer 內容 (Avatar, Bio, Links, Social)
- [ ] 2.5 測試：撰寫 NavToggle 與 SideDrawer 互動測試

## 3. Footer 系統 - Widget Framework

- [ ] 3.1 定義 Widget Config 結構 (`src/config/widgets.ts`)
- [ ] 3.2 建立 `src/components/public/widgets/WidgetModal.tsx` (通用 Modal)
- [ ] 3.3 建立 `src/components/public/widgets/RichTextWidget.tsx`
- [ ] 3.4 建立 `src/components/public/widgets/ImageGridWidget.tsx`
- [ ] 3.5 建立 `src/components/public/layout/FooterBar.tsx` (整合 Widget 連結)
- [ ] 3.6 測試：驗證 Widget Modal 開啟與內容渲染

## 4. 首頁重構 - Magazine View

- [ ] 4.1 建立 `src/components/public/home/FeaturedHero.tsx` (大圖 Hero)
- [ ] 4.2 建立 `src/components/public/home/VisualGrid.tsx` (3 欄卡片)
- [ ] 4.3 修改 `src/app/(public)/page.tsx`：整合 Hero 與 Grid
- [ ] 4.4 測試：驗證首頁響應式佈局 (Mobile 1 欄, Desktop 3 欄)

## 5. 全站整合

- [ ] 5.1 建立 `src/components/public/layout/LayoutMinimal.tsx`
- [ ] 5.2 修改 `src/app/(public)/layout.tsx`：套用 LayoutMinimal
- [ ] 5.3 移除舊版 `Navbar` 與 `Footer` 引用
- [ ] 5.4 測試：全站 E2E 測試 (導航流暢度、Footer 互動)

## 6. 最終驗證

- [ ] 6.1 執行視覺回歸測試 (Visual Regression Test)
- [ ] 6.2 檢查 Accessibility (Focus trap in Modal/Drawer)
- [ ] 6.3 更新文件
