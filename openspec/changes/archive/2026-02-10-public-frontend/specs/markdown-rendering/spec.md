## ADDED Requirements

### Requirement: Markdown 解析與渲染

系統 SHALL 使用 unified 生態系（remark + rehype）將 Markdown 內容解析並渲染為 HTML。渲染 MUST 在 Server 端完成（配合 ISR），不產生 runtime JavaScript 開銷。

#### Scenario: 基本 Markdown 渲染

- **WHEN** 系統渲染一篇包含標題、段落、列表、連結、圖片的 Markdown 文章
- **THEN** 輸出正確的 HTML 結構，所有 Markdown 語法正確轉換為對應的 HTML 元素

#### Scenario: 空內容處理

- **WHEN** 系統渲染空字串或 null 的 Markdown 內容
- **THEN** 系統回傳空的 HTML 字串，不拋出錯誤

### Requirement: GFM 支援

系統 SHALL 支援 GitHub Flavored Markdown（GFM）擴充語法，包含表格、刪除線和任務清單。

#### Scenario: 表格渲染

- **WHEN** Markdown 內容包含 GFM 表格語法
- **THEN** 系統渲染為具有正確表頭和對齊的 HTML 表格

#### Scenario: 刪除線渲染

- **WHEN** Markdown 內容包含 `~~刪除文字~~` 語法
- **THEN** 系統渲染為 `<del>刪除文字</del>` HTML 元素

#### Scenario: 任務清單渲染

- **WHEN** Markdown 內容包含 `- [x]` 和 `- [ ]` 任務清單語法
- **THEN** 系統渲染為帶有 checkbox 的清單項目，已完成項目顯示為勾選狀態

### Requirement: 程式碼高亮

系統 SHALL 使用 Shiki 作為程式碼高亮引擎，透過 `@shikijs/rehype` 外掛在建構時生成帶有語法高亮的 HTML。高亮結果 MUST 為零 runtime JavaScript（純 CSS + HTML）。系統 SHALL 支援常用程式語言：TypeScript、JavaScript、Python、Shell/Bash、CSS、HTML、JSON、SQL。

#### Scenario: 程式碼區塊高亮

- **WHEN** Markdown 內容包含指定語言的程式碼區塊（如 ````typescript`）
- **THEN** 系統使用 Shiki 渲染帶有語法高亮的程式碼，輸出純 HTML + inline styles，無需 runtime JS

#### Scenario: 未指定語言的程式碼區塊

- **WHEN** Markdown 內容包含未指定語言的程式碼區塊（僅 ` ``` `）
- **THEN** 系統渲染為純文字程式碼區塊，無語法高亮

#### Scenario: 不支援的語言

- **WHEN** Markdown 內容包含 Shiki 未載入的語言（如 ````cobol`）
- **THEN** 系統 gracefully fallback 為純文字渲染，不拋出錯誤

#### Scenario: Dark mode 程式碼高亮

- **WHEN** 訪客切換至 Dark mode
- **THEN** 程式碼區塊的高亮配色適配 Dark 模式，保持良好的可讀性

### Requirement: 目錄自動生成

系統 SHALL 從 Markdown 內容中提取所有 heading（h2、h3）自動生成文章目錄（Table of Contents）。

#### Scenario: 提取 heading 生成目錄

- **WHEN** 系統渲染一篇包含多個 h2 和 h3 heading 的文章
- **THEN** 系統提取所有 heading 的文字和層級，生成結構化的目錄資料（包含 id、text、level）

#### Scenario: 文章無 heading

- **WHEN** 系統渲染一篇不包含任何 heading 的文章
- **THEN** 系統回傳空的目錄資料，不顯示目錄導航

### Requirement: 自動 Heading ID

系統 SHALL 使用 `rehype-slug` 外掛為所有 heading 元素自動生成 ID 屬性，用於目錄導航的錨點跳轉。

#### Scenario: 自動生成 heading ID

- **WHEN** Markdown 內容包含 heading `## 快速開始`
- **THEN** 渲染後的 HTML heading 元素自動帶有 `id` 屬性（如 `id="快速開始"` 或經轉換的 slug），可被錨點連結定位

#### Scenario: 重複 heading 處理

- **WHEN** Markdown 內容包含兩個相同文字的 heading（如兩個 `## 範例`）
- **THEN** 系統為第二個 heading 自動生成不重複的 ID（如加上數字後綴）

### Requirement: 閱讀時間計算

系統 SHALL 根據文章內容計算預估閱讀時間。中文文章的閱讀速度 SHALL 以每分鐘約 400-500 字計算。

#### Scenario: 計算中文文章閱讀時間

- **WHEN** 系統處理一篇約 2000 字的中文文章
- **THEN** 系統計算出約 4-5 分鐘的閱讀時間

#### Scenario: 計算中英混合文章閱讀時間

- **WHEN** 系統處理一篇包含中英文混合及程式碼區塊的文章
- **THEN** 系統合理計算閱讀時間，程式碼區塊的字數也計入

#### Scenario: 極短文章閱讀時間

- **WHEN** 系統處理一篇少於 100 字的文章
- **THEN** 系統顯示閱讀時間為「1 分鐘」（最小值）
