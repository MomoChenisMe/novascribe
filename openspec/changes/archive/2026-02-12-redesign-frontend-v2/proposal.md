## Why

使用者期望網站能展現更強烈的極簡現代風格 (Swiss Style)，去除傳統 Header 的視覺干擾，讓內容成為絕對主角。參考 kaochenlong.com 的設計哲學，我們將採用「隱藏式導航」與「雜誌封面式 Hero」的組合，打造沈浸式的閱讀體驗。同時，Footer 需要具備高度彈性，以 Widget 系統來滿足不同階段的資訊展示需求 (如證照、聲明、社群等)，而不破壞極簡的視覺架構。

## What Changes

- **Layout 大重構 (The Minimal Canvas)**：
  - **移除** 傳統 Top Navbar。
  - **新增** 極簡導航按鈕 (Hamburger)，常駐於左上角或右上角 (待定，建議左上角符合 F-Pattern)。
  - **新增** 側邊抽屜 (Side Drawer) 選單，承載所有導航與個人簡介。
  
- **首頁體驗 (Magazine Style)**：
  - **新增** Featured Post Hero 區塊：最新文章以大圖全寬呈現。
  - **新增** Visual Grid 文章列表：3 欄式卡片佈局，強調視覺吸引力。
  
- **Footer 系統 (Dynamic Widgets)**：
  - **重構** Footer 為「極簡條 + Widget 容器」結構。
  - **實作** Widget 系統：支援 Image Wall (證照)、Text Link (聲明)、Social Icons 等模組。
  - **新增** 互動式 Modal/Drawer 機制，用於展示詳細的 Footer Widget 內容。

- **視覺風格 (Accents Only)**：
  - **調整** 色彩策略：大面積黑白灰，Modern Rose (`#E11D48`) 僅用於關鍵互動 (Hover, Buttons)。
  - **統一** 字體：全站使用 Inter + Noto Sans TC (Full Sans-Serif)。

## Capabilities

### New Capabilities

- `frontend-layout-minimal`: 定義無 Header、側邊抽屜導航的全新 Layout 系統。
- `ui-widget-system`: 定義 Footer 與其他區域可用的 Widget 基礎架構與標準元件。
- `home-magazine-view`: 定義首頁的 Featured Hero 與 Visual Grid 呈現邏輯。

### Modified Capabilities

- `ui-design-system`: 調整色彩權重 (Accents Only) 與 Typography 設定。
- `ui-components`: 移除 Navbar，新增 Drawer, MinimalButton, HeroCard, WidgetContainer 等元件。
- `public-pages`: 更新所有頁面 Layout Wrapper。

## Impact

- **UI 層**：全站視覺結構徹底改變，需確保與舊版 Admin UI 的過渡體驗。
- **元件層**：大量新增互動元件 (Drawer, Modal)，需注意 Accessibility (Focus trap, Aria)。
- **資料層**：需擴充 Site Settings 或 Config 以支援 Footer Widget 的動態設定 (初期可先寫死 Config，預留 API 介面)。
