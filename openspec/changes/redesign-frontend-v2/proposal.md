## Why

使用者對於上一版的前台設計（特別是 Header 部分）不滿意，認為視覺上不夠完美。目標是參考知名技術部落格（kaochenlong.com）的極簡風格，對底層 Layout 進行大規模重構，移除厚重的 Header，改採更現代、專注內容的佈局。同時，參考 `blog.miniasp.com` 強化 Footer 的功能性與專業感，加入免責聲明與專業證照區塊，提升部落格的專業形象。

## What Changes

- **Layout 重構**：
  - **移除** 現有的 `Navbar` 元件（置頂導航列）。
  - **實作** 全新的版面配置（參考 kaochenlong.com），採用 **左側固定導航 (Sidebar Navigation)** 或 **極簡置頂選單**（視設計探索決定，傾向於讓內容更突出的配置）。
  - 調整全站容器（Container）寬度與間距，強化閱讀體驗。

- **Footer 重構**：
  - 參考 `blog.miniasp.com` 的多欄位設計。
  - 新增 **免責聲明 (Disclaimer)** 區塊。
  - 新增 **專業證照 (Certifications)** 展示區塊。
  - 優化版權宣告與社群連結樣式。

- **視覺風格微調**：
  - 保持 **Modern Rose** (`#E11D48`) 主色系。
  - 優化 Typography 階層，使其更符合極簡現代風格（Swiss Modernism 2.0）。

## Capabilities

### Modified Capabilities

- `ui-design-system`: 更新 Layout 相關的 Design Tokens 與全域樣式（Container, Grid）。
- `ui-components`: 修改/替換 `Navbar` 與 `Footer` 元件；調整 `Card` 與 `Button` 樣式以配合新 Layout。
- `home-magazine-layout`: 重構首頁佈局，適應新的全站 Layout 架構。
- `public-pages`: 更新所有公開頁面的 Layout Wrapper。

### New Capabilities

- `frontend-layout-v2`: 定義全新的底層佈局系統（Sidebar/Minimal Nav + Content Area + Rich Footer）。

## Impact

- **UI 層**：`src/app/layout.tsx`, `src/app/(public)/layout.tsx` 將大幅修改。
- **元件層**：`src/components/ui/Navbar.tsx` 可能被移除或重寫；`Footer.tsx` 將大幅擴充。
- **SEO**：需確保 Layout 變更不影響現有的 SEO 結構（h1, semantic tags）。
