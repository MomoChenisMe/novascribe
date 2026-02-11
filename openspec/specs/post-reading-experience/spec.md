## ADDED Requirements

### Requirement: Table of Contents (TOC)

系統 MUST 在文章頁右側顯示常駐目錄，方便讀者快速跳轉。

#### Scenario: 自動生成目錄

- **WHEN** 系統渲染文章頁
- **THEN** 系統解析 Markdown 中的 h2 與 h3 標籤，生成目錄結構

#### Scenario: 高亮當前章節

- **WHEN** 使用者捲動文章內容
- **THEN** 系統使用 IntersectionObserver 高亮目錄中對應的章節標題

#### Scenario: 點擊跳轉

- **WHEN** 使用者點擊目錄中的標題
- **THEN** 系統平滑捲動至對應章節

#### Scenario: Sticky 定位

- **WHEN** 使用者向下捲動文章
- **THEN** 目錄保持在右側固定位置 (`sticky top-24`)

### Requirement: 最佳閱讀寬度

系統 MUST 限制文章內容寬度為 680px，確保最佳閱讀體驗。

#### Scenario: 設定內容寬度

- **WHEN** 系統渲染文章內容
- **THEN** 內容區塊使用 `max-w-[680px] mx-auto`，置中顯示

#### Scenario: 響應式調整

- **WHEN** 使用者在行動裝置瀏覽
- **THEN** 內容寬度自動調整為螢幕寬度 90%

### Requirement: 浮動操作按鈕

系統 MUST 在文章頁左側或底部顯示浮動操作按鈕（分享、回到頂部）。

#### Scenario: 顯示分享按鈕

- **WHEN** 使用者瀏覽文章
- **THEN** 系統在左側顯示浮動分享按鈕 (Twitter, Facebook, 複製連結)

#### Scenario: 回到頂部按鈕

- **WHEN** 使用者向下捲動超過 500px
- **THEN** 系統顯示「回到頂部」按鈕，點擊後平滑捲動至頁面頂部

#### Scenario: 行動裝置定位

- **WHEN** 使用者在行動裝置瀏覽
- **THEN** 浮動按鈕改為顯示在頁面底部固定位置

### Requirement: Markdown 樣式優化

系統 MUST 優化 Markdown 內容的排版樣式（程式碼區塊、引言、列表）。

#### Scenario: 程式碼區塊樣式

- **WHEN** 文章包含程式碼區塊
- **THEN** 系統使用 Slate 50 背景、Slate 200 邊框、JetBrains Mono 字體

#### Scenario: 引言樣式

- **WHEN** 文章包含 `>` 引言
- **THEN** 系統顯示左側 Rose 600 豎線、Italic 斜體文字

#### Scenario: 列表樣式

- **WHEN** 文章包含有序或無序列表
- **THEN** 系統使用適當的縮排與項目符號樣式

### Requirement: SEO 與 Metadata 保持一致

系統 MUST 確保重構後的文章頁保留現有的 SEO 優化。

#### Scenario: Meta Tags 不變

- **WHEN** 系統渲染文章頁
- **THEN** `generateMetadata` 輸出的 title, description, og:image 與重構前一致

#### Scenario: JSON-LD 不變

- **WHEN** 搜尋引擎爬蟲造訪文章頁
- **THEN** 系統輸出的 Article JSON-LD 結構化資料與重構前一致
