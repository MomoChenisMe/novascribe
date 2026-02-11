## MODIFIED Requirements

### Requirement: 首頁文章列表

系統 SHALL 在首頁顯示已發佈（PUBLISHED）文章列表，按 `publishedAt` 降序排列，支援分頁瀏覽。每頁顯示預設數量的文章卡片，包含標題、摘要、封面圖片、分類、標籤、發佈日期與閱讀時間。佈局 MUST 採用「雜誌卡片網格 (Magazine Grid)」風格，使用 Rose 600 作為品牌主色。

#### Scenario: 載入首頁文章列表

- **WHEN** 訪客造訪首頁
- **THEN** 系統顯示最新的已發佈文章列表，每頁 10 篇，包含文章卡片（標題、摘要、封面圖片、分類、標籤、發佈日期、閱讀時間），並顯示分頁導航

#### Scenario: 卡片網格佈局

- **WHEN** 訪客在桌面裝置瀏覽首頁
- **THEN** 系統以 3 欄網格 (Grid-cols-3) 顯示文章卡片

#### Scenario: 卡片 Hover 效果

- **WHEN** 訪客將滑鼠移至文章卡片上方
- **THEN** 卡片陰影從 `shadow-sm` 增強至 `shadow-md`，並向上移動 4px

#### Scenario: 卡片圓角

- **WHEN** 系統渲染文章卡片
- **THEN** 卡片使用 `rounded-2xl` 大圓角

### Requirement: 精選文章展示

系統 SHALL 在首頁突出顯示精選文章區域（Hero Section），展示最新或特定的文章作為 Hero 區塊，提供視覺焦點。精選文章 SHALL 預設為最新的已發佈文章，未來可擴充為支援手動標記（如 `isFeatured` 欄位）。Hero Section MUST 使用大標題與高品質配圖，符合雜誌風格。

#### Scenario: 顯示精選文章

- **WHEN** 訪客造訪首頁
- **THEN** 系統在頁面頂部 Hero 區域展示最新的已發佈文章，包含大標題、摘要和封面圖片

#### Scenario: Hero 佈局（桌面）

- **WHEN** 訪客在桌面裝置瀏覽首頁
- **THEN** Hero Section 使用左圖右文佈局（50/50 比例），圖片使用 `aspect-[16/9]`

#### Scenario: Hero 佈局（行動）

- **WHEN** 訪客在行動裝置瀏覽首頁
- **THEN** Hero Section 使用上圖下文垂直佈局

### Requirement: 文章詳情頁

系統 SHALL 提供文章詳情頁面（`/posts/[slug]`），渲染 Markdown 內容為 HTML，並顯示文章標題、作者名稱、發佈日期、閱讀時間、分類、標籤、目錄導航、相關文章和分享按鈕。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。文章內容區 MUST 使用最佳閱讀寬度（680px），右側顯示常駐目錄 (TOC)。

#### Scenario: 最佳閱讀寬度

- **WHEN** 訪客瀏覽文章頁
- **THEN** 文章內容區使用 `max-w-[680px] mx-auto` 置中顯示

#### Scenario: 常駐目錄 (TOC)

- **WHEN** 訪客瀏覽文章頁
- **THEN** 系統在右側顯示 Sticky 定位的目錄，包含 h2 與 h3 標題

#### Scenario: 目錄高亮

- **WHEN** 訪客捲動文章內容
- **THEN** 目錄中對應當前章節的標題高亮顯示 (Rose 600 文字)

#### Scenario: 浮動操作按鈕

- **WHEN** 訪客瀏覽文章頁
- **THEN** 系統在左側顯示浮動分享按鈕與回到頂部按鈕

### Requirement: 分類文章列表頁

系統 SHALL 提供分類文章列表頁面（`/categories/[slug]`），顯示該分類下的所有已發佈文章，支援分頁。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。頁面風格 MUST 與首頁保持一致，使用相同的卡片網格佈局與 Modern Rose 配色。

#### Scenario: 載入分類文章列表

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/categories/tech`
- **THEN** 系統顯示「技術」分類下的所有已發佈文章，按 `publishedAt` 降序排列，支援分頁

#### Scenario: 卡片樣式一致性

- **WHEN** 系統渲染分類頁文章卡片
- **THEN** 卡片樣式（圓角、陰影、Hover 效果）與首頁一致

### Requirement: 標籤文章列表頁

系統 SHALL 提供標籤文章列表頁面（`/tags/[slug]`），顯示該標籤下的所有已發佈文章，支援分頁。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。頁面風格 MUST 與首頁保持一致，使用相同的卡片網格佈局與 Modern Rose 配色。

#### Scenario: 載入標籤文章列表

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/tags/javascript`
- **THEN** 系統顯示含有「JavaScript」標籤的所有已發佈文章，按 `publishedAt` 降序排列，支援分頁

#### Scenario: 標籤樣式

- **WHEN** 系統顯示標籤名稱
- **THEN** 標籤使用 `bg-stone-100 text-stone-600 rounded-full`，Hover 變為 `bg-rose-50 text-rose-600`
