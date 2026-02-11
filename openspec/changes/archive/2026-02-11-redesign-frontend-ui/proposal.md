## Why

NovaScribe 目前的前台介面設計過於陽春，缺乏現代感與品牌識別度，使用體驗也不夠流暢。為了提升讀者的閱讀體驗、建立獨特的個人品牌風格，並改善導航與互動的直觀性，需要對前台 UI/UX 進行全面重新設計。

## What Changes

- 重新設計色彩系統：採用「Modern Rose」主題色（#E11D48）搭配 Stone 灰階色系
- 優化字體系統：使用 Noto Sans TC + Inter 純 Sans-serif 字體組合，提升閱讀舒適度
- 重構首頁佈局：改為「雜誌卡片網格 (Magazine Grid)」風格，包含大型 Hero 區塊與卡片式文章列表
- 優化文章頁面：實作常駐目錄 (TOC)、浮動操作按鈕、最佳化閱讀寬度
- 統一後台風格：後台配色與前台保持一致，延續 Rose 主題色
- 建立完整的 Design Token 系統：包含色彩、字體階層、間距、圓角、陰影等規範
- 優化互動體驗：統一 Hover 狀態、Transition 動效、Loading 狀態呈現

## Capabilities

### New Capabilities
- `ui-design-system`: 定義完整的 Design Token 系統（顏色、字體、間距、圓角、陰影）
- `ui-components`: 建立可重用的基礎 UI 元件庫（Button, Card, Tag, Input, Navbar）
- `home-magazine-layout`: 首頁雜誌網格佈局（Hero Section + Featured Grid + Newsletter）
- `post-reading-experience`: 文章頁閱讀體驗優化（TOC、浮動操作、最佳閱讀寬度）
- `admin-ui-redesign`: 後台介面重新設計（與前台風格一致）

### Modified Capabilities
- `public-pages`: 調整現有公開頁面的視覺風格與佈局結構（首頁、分類頁、標籤頁、文章頁）

## Impact

**影響範圍：**
- 前台所有頁面：`src/app/(public)/**/*.tsx`
- 全域樣式配置：`tailwind.config.ts`, `app/globals.css`
- UI 元件庫：`src/components/public/**/*.tsx` (需重構或新建)
- 後台頁面：`src/app/(admin)/**/*.tsx` (需更新配色與風格)

**相依性：**
- 需要更新 Tailwind CSS 配置（新增自訂色票、字體）
- 需要安裝 Google Fonts（Noto Sans TC, Inter, JetBrains Mono）
- 不影響後端 API 與資料庫 Schema

**SEO 影響：**
- 正面影響：改善視覺層級與閱讀體驗，降低跳出率，提升停留時間
- 需注意：確保重構後的 HTML 語意結構不變，保留現有的 meta tags 與 JSON-LD
- 需驗證：所有頁面的 Lighthouse Performance 與 Accessibility 分數不得下降
