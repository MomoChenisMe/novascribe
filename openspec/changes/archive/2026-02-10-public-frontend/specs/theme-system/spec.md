## ADDED Requirements

### Requirement: CSS 變數主題系統

系統 SHALL 使用 Tailwind CSS v4 的 `@theme` 搭配 CSS 變數定義主題色彩，並透過 `data-theme` 屬性切換 Light/Dark 模式。所有顏色值 MUST 透過 CSS 變數統一管理。

#### Scenario: Light 模式色彩

- **WHEN** 頁面 `data-theme` 屬性為 `light` 或未設定
- **THEN** 系統使用 Light 模式的 CSS 變數值（淺色背景、深色文字、對應的 primary/secondary/accent 色彩）

#### Scenario: Dark 模式色彩

- **WHEN** 頁面 `data-theme` 屬性為 `dark`
- **THEN** 系統使用 Dark 模式的 CSS 變數值（深色背景、淺色文字、對應的 primary/secondary/accent 色彩），確保足夠的對比度

### Requirement: Dark Mode 切換

系統 SHALL 支援 Dark mode 切換功能。預設使用系統偏好設定（`prefers-color-scheme`），使用者手動切換後 SHALL 將偏好持久化至 `localStorage`。系統 MUST 防止頁面載入時的主題閃爍。

#### Scenario: 首次造訪跟隨系統偏好

- **WHEN** 訪客首次造訪網站，且作業系統設定為 Dark mode
- **THEN** 系統自動套用 Dark 模式，無閃爍現象

#### Scenario: 首次造訪系統為 Light

- **WHEN** 訪客首次造訪網站，且作業系統設定為 Light mode
- **THEN** 系統自動套用 Light 模式

#### Scenario: 手動切換至 Dark mode

- **WHEN** 訪客點擊 ThemeToggle 按鈕切換至 Dark mode
- **THEN** 頁面立即切換為 Dark 模式，偏好儲存至 `localStorage`

#### Scenario: 手動偏好持久化

- **WHEN** 訪客先前已手動切換至 Dark mode 並重新載入頁面
- **THEN** 系統從 `localStorage` 讀取偏好，直接套用 Dark 模式，無閃爍

#### Scenario: 防閃爍機制

- **WHEN** 頁面 HTML 載入時
- **THEN** `<head>` 中的同步 script SHALL 在渲染前讀取 `localStorage` 或系統偏好並設定 `data-theme` 屬性，避免從 Light 閃爍到 Dark 的視覺跳動

### Requirement: 中文排版最佳化

系統 SHALL 針對 CJK（中日韓）文字提供最佳化的排版設定，確保中文內容的閱讀舒適度。

#### Scenario: 文章內容排版

- **WHEN** 訪客閱讀中文文章
- **THEN** 文章內容使用 `line-height: 1.8`、`letter-spacing: 0.02em`，段落間距適當，提供舒適的中文閱讀體驗

#### Scenario: 中英混排

- **WHEN** 文章內容包含中英文混排
- **THEN** 系統正確處理 CJK 與 Latin 字元的排版，文字換行遵循 `word-break` 和 `overflow-wrap` 規則

### Requirement: 響應式設計

系統 SHALL 提供完整的響應式佈局，適配手機（< 768px）、平板（768px - 1024px）和桌面（> 1024px）三種主要斷點。

#### Scenario: 手機版佈局

- **WHEN** 訪客使用手機（螢幕寬度 < 768px）瀏覽網站
- **THEN** 系統顯示單欄佈局，導航轉為漢堡選單，側邊欄隱藏或移至內容下方，字體和間距適合觸控操作

#### Scenario: 平板版佈局

- **WHEN** 訪客使用平板（螢幕寬度 768px - 1024px）瀏覽網站
- **THEN** 系統顯示適配的佈局，側邊欄可收合，內容區域適當調整寬度

#### Scenario: 桌面版佈局

- **WHEN** 訪客使用桌面（螢幕寬度 > 1024px）瀏覽網站
- **THEN** 系統顯示完整佈局，包含 Header、主內容區、Sidebar，最大內容寬度受限確保可讀性

### Requirement: 共用 Layout 元件

系統 SHALL 提供共用的前台 layout 元件，包含 Header、Footer、Sidebar 和 ThemeToggle，確保所有前台頁面有一致的外觀和導航體驗。

#### Scenario: Header 導航

- **WHEN** 訪客造訪任何前台頁面
- **THEN** 頁面頂部顯示 Header，包含 Logo/網站名稱、導航連結（首頁、分類、標籤、關於）、搜尋入口和 Dark mode 切換按鈕

#### Scenario: Footer 資訊

- **WHEN** 訪客造訪任何前台頁面
- **THEN** 頁面底部顯示 Footer，包含版權資訊、RSS 訂閱連結和社交連結

#### Scenario: Sidebar 內容

- **WHEN** 訪客在桌面版瀏覽文章列表頁面
- **THEN** 側邊欄顯示分類列表、標籤雲和熱門文章等輔助導航內容

#### Scenario: ThemeToggle 按鈕

- **WHEN** 訪客查看 Header
- **THEN** 顯示太陽/月亮圖示的 ThemeToggle 按鈕，點擊可切換 Light/Dark 模式

### Requirement: 豐富風格設計

系統 SHALL 採用現代化的豐富風格設計，使用卡片式佈局呈現文章列表，營造具有社交感的視覺體驗。

#### Scenario: 文章卡片樣式

- **WHEN** 訪客瀏覽文章列表
- **THEN** 每篇文章以卡片形式呈現，包含封面圖片、標題、摘要、作者資訊、發佈日期，卡片具有圓角、陰影和 hover 效果

#### Scenario: 視覺層次

- **WHEN** 訪客瀏覽前台頁面
- **THEN** 頁面具有清晰的視覺層次，包含適當的留白、色彩對比和字體大小區分，引導讀者的視覺動線
