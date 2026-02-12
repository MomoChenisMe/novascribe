## Context

NovaScribe 前台 UI 目前採用標準的 Top Navbar + Content 佈局。使用者反饋 Header 設計不夠理想，希望改採類似 [kaochenlong.com](https://kaochenlong.com/) 的極簡風格，這通常意味著移除置頂導航列，改用側邊欄 (Sidebar) 或極簡的選單設計，讓內容成為視覺焦點。同時，參考 [blog.miniasp.com](https://blog.miniasp.com/)，Footer 需要強化功能性與專業感。本次設計目標是在保持現有 Modern Rose 主題色系的基礎上，徹底重構底層 Layout 與關鍵 UI 元件。

## Goals / Non-Goals

**Goals:**
1. **重構全站 Layout**：移除 Top Navbar，實作響應式 Sidebar (Desktop) + Minimal Header (Mobile) 架構。
2. **重構 Footer**：實作多欄式 Rich Footer，包含關於、連結、免責聲明、證照展示等區塊。
3. **優化閱讀體驗**：調整內容容器寬度與字體階層 (Type Scale)，對齊 Swiss Modernism 風格。
4. **保持視覺一致性**：延續 Modern Rose (`#E11D48`) 主題色，但重新分配色彩權重以符合極簡風格。
5. **SEO 結構維持**：確保 Layout 變更不破壞現有的 Semantic HTML 結構。

**Non-Goals:**
1. **不**修改後台 (Admin) UI：本次僅針對前台 (Public) 進行重構。
2. **不**變更後端 API：僅涉及前端呈現層。
3. **不**引入新的 CSS 框架：繼續使用 Tailwind CSS。

## Decisions

### 決策 1：佈局架構 (Sidebar vs. Minimal Top Nav)

**選擇：** 採用 **響應式側邊欄 (Responsive Sidebar)** 佈局。
- **Desktop (lg+)**：左側固定 Sidebar (寬度約 280px)，右側為主要內容區。Sidebar 包含 Logo、簡介、主要導航、社群連結。
- **Mobile/Tablet (md-)**：Sidebar 隱藏，頂部顯示 Minimal Header (僅 Logo + Hamburger Menu)，點擊 Menu 滑出 Drawer 顯示完整導航。

**理由：**
- **符合極簡目標**：kaochenlong.com 採用類似結構，能最大化垂直閱讀空間。
- **強調個人品牌**：Sidebar 常駐個人簡介與頭像，適合個人技術部落格。
- **解決 Header 厚重問題**：移除 Top Navbar 後，畫面頂部不再有視覺干擾。

**實作方式：**
建立新的 `src/components/public/layout/MainLayout.tsx` 作為前台共用 Layout wrapper。

### 決策 2：Footer 內容結構

**選擇：** 採用 **3 欄式 (Mobile 1 欄)** 佈局。
1. **Brand & Bio**：Logo、網站簡介、版權宣告。
2. **Links & Certs**：主要連結 (分類、標籤)、專業證照圖示 (如 AWS, Google Cloud 等 placeholder)。
3. **Legal & Social**：免責聲明 (Disclaimer)、隱私權政策、社群媒體連結。

**理由：**
- 參考 blog.miniasp.com 的專業感設計。
- 分離法律資訊與導航連結，結構更清晰。

### 決策 3：Grid System 調整

**選擇：** 調整首頁文章列表的 Grid 欄數策略。
- 由於 Sidebar 佔據了左側空間，內容區域寬度變小。
- **Desktop (xl)**：維持 3 欄或調整為 2 欄 (視卡片設計而定，建議 2 欄以保持卡片細節)。
- **Laptop (lg)**：2 欄。
- **Mobile (md-)**：1 欄。

**理由：**
- 確保卡片在縮小的容器中仍有足夠的展示空間。

## Risks / Trade-offs

### 風險 1：Sidebar 遮擋內容或佔用過多寬度
**緩解**：設定 Sidebar 為固定寬度 (280px)，並確保在小螢幕 (1024px 以下) 自動收折為 Drawer 模式。內容區域設定 `max-width` 並置中，避免在超寬螢幕上過度拉伸。

### 風險 2：Footer 資訊過多影響視覺簡潔
**緩解**：使用較淡的文字顏色 (`text-stone-500`) 與較小的字級 (`text-sm`) 呈現免責聲明與次要資訊，僅在 Hover 時加深顏色。

## Migration Plan

1. **建立新元件**：
   - `src/components/public/layout/Sidebar.tsx`
   - `src/components/public/layout/MobileHeader.tsx`
   - `src/components/public/layout/RichFooter.tsx`
   - `src/components/public/layout/MainLayout.tsx`
2. **調整全域樣式**：更新 `globals.css` 中的 Grid 與 Container 設定。
3. **替換 Layout**：修改 `src/app/(public)/layout.tsx`，移除舊版 Navbar/Footer，套用 `MainLayout`。
4. **調整頁面樣式**：修正首頁與文章頁的 Grid 響應式斷點。
5. **驗證**：檢查各斷點下的顯示效果與功能正常性。
