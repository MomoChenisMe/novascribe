## MODIFIED Requirements

### Requirement: 文章詳情頁

系統 SHALL 提供文章詳情頁面（`/posts/[slug]`），渲染 Markdown 內容為 HTML，並顯示文章標題、作者名稱、發佈日期、閱讀時間、分類、標籤、目錄導航、相關文章和分享按鈕。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。

#### Scenario: 載入已發佈文章

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/posts/my-article`，且該文章狀態為 PUBLISHED
- **THEN** 系統顯示文章完整內容，包含：Markdown 渲染後的 HTML、文章標題、作者名稱、發佈日期、閱讀時間、分類連結、標籤連結、目錄導航（Table of Contents）、相關文章推薦、社交分享按鈕

#### Scenario: 存取未發佈文章

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/posts/draft-article`，且該文章狀態為 DRAFT
- **THEN** 系統回傳 404 頁面

#### Scenario: 存取不存在的文章

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/posts/non-existent-slug`
- **THEN** 系統回傳 404 頁面

#### Scenario: 文章目錄導航

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 文章內容包含多個 heading（h2、h3）
- **THEN** 系統在側邊欄顯示目錄導航，點擊目錄項目可跳轉至對應的章節

#### Scenario: 相關文章推薦

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客瀏覽一篇文章
- **THEN** 系統在文章底部顯示最多 3 篇相關文章（同分類或同標籤），包含標題和摘要

#### Scenario: 社交分享按鈕

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客瀏覽文章頁面
- **THEN** 系統顯示分享按鈕（Twitter/X、Facebook、複製連結），點擊可分享該文章

#### Scenario: Page 元件 params 使用 async/await

- **GIVEN** Page 元件為 async Server Component
- **WHEN** Page 元件需要存取 `params.slug`
- **THEN** 系統 MUST 先 await params 再解構 slug（`const { slug } = await params`）

#### Scenario: generateMetadata params 使用 async/await

- **GIVEN** generateMetadata 函式為 async 函式
- **WHEN** generateMetadata 函式需要存取 `params.slug`
- **THEN** 系統 MUST 先 await params 再解構 slug（`const { slug } = await params`）

### Requirement: 分類文章列表頁

系統 SHALL 提供分類文章列表頁面（`/categories/[slug]`），顯示該分類下的所有已發佈文章，支援分頁。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。

#### Scenario: 載入分類文章列表

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/categories/tech`
- **THEN** 系統顯示「技術」分類下的所有已發佈文章，按 `publishedAt` 降序排列，支援分頁

#### Scenario: 分類不存在

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/categories/non-existent`
- **THEN** 系統回傳 404 頁面

#### Scenario: 分類下無已發佈文章

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪一個存在但無已發佈文章的分類頁面
- **THEN** 系統顯示分類名稱及「此分類目前沒有文章」的提示

#### Scenario: Page 元件 params 和 searchParams 使用 async/await

- **GIVEN** Page 元件為 async Server Component
- **WHEN** Page 元件需要存取 `params.slug` 或 `searchParams.page`
- **THEN** 系統 MUST 先 await params 和 searchParams 再解構（`const { slug } = await params; const { page } = await searchParams`）

#### Scenario: generateMetadata params 使用 async/await

- **GIVEN** generateMetadata 函式為 async 函式
- **WHEN** generateMetadata 函式需要存取 `params.slug`
- **THEN** 系統 MUST 先 await params 再解構 slug（`const { slug } = await params`）

### Requirement: 標籤文章列表頁

系統 SHALL 提供標籤文章列表頁面（`/tags/[slug]`），顯示該標籤下的所有已發佈文章，支援分頁。動態路由參數 `params` 和 `searchParams` MUST 使用 async/await 方式存取，符合 Next.js 16 API 規範。

#### Scenario: 載入標籤文章列表

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/tags/javascript`
- **THEN** 系統顯示含有「JavaScript」標籤的所有已發佈文章，按 `publishedAt` 降序排列，支援分頁

#### Scenario: 標籤不存在

- **GIVEN** 系統使用 Next.js 16 App Router
- **WHEN** 訪客造訪 `/tags/non-existent`
- **THEN** 系統回傳 404 頁面

#### Scenario: Page 元件 params 和 searchParams 使用 async/await

- **GIVEN** Page 元件為 async Server Component
- **WHEN** Page 元件需要存取 `params.slug` 或 `searchParams.page`
- **THEN** 系統 MUST 先 await params 和 searchParams 再解構（`const { slug } = await params; const { page } = await searchParams`）

#### Scenario: generateMetadata params 使用 async/await

- **GIVEN** generateMetadata 函式為 async 函式
- **WHEN** generateMetadata 函式需要存取 `params.slug`
- **THEN** 系統 MUST 先 await params 再解構 slug（`const { slug } = await params`）

## ADDED Requirements

### Requirement: TypeScript 型別安全

系統 MUST 使用 Next.js 提供的 `PageProps<路徑>` 工具型別取代自訂 interface，提供路由參數的型別安全和自動推斷。

#### Scenario: 使用 PageProps 工具型別

- **GIVEN** 定義動態路由頁面的 props 型別
- **WHEN** 開發者撰寫 Page 元件或 generateMetadata 函式簽章
- **THEN** 系統使用 `PageProps<'/categories/[slug]'>` 格式，TypeScript 自動推斷 params 和 searchParams 的結構

#### Scenario: 型別錯誤偵測

- **GIVEN** 開發者定義動態路由頁面的 props 型別
- **WHEN** 開發者輸入錯誤的路由路徑（如 `PageProps<'/categories/[foo]'>`）
- **THEN** TypeScript 在編譯時拋出型別錯誤，提示路由不存在

#### Scenario: 自動補全支援

- **GIVEN** 開發者在 IDE 中撰寫程式碼
- **WHEN** 開發者解構 params（如 `const { slug } = await params`）
- **THEN** IDE 提供 slug 的自動補全和型別檢查

### Requirement: 執行時穩定性

系統 MUST 確保所有動態路由頁面修正後不再拋出 async params 相關錯誤，並在開發和生產環境中穩定運作。

#### Scenario: 消除 params 錯誤

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 訪客造訪任何動態路由頁面（`/categories/[slug]`, `/tags/[slug]`, `/posts/[slug]`）
- **THEN** 終端機和瀏覽器控制台不得出現「params should be awaited」錯誤

#### Scenario: 正常回傳 200 狀態

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 訪客造訪存在的動態路由頁面（如 `/categories/tech`）
- **THEN** 系統回傳 HTTP 200 狀態碼，頁面正常渲染

#### Scenario: 開發伺服器穩定運行

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 執行 `npm run dev` 啟動開發伺服器
- **THEN** 所有動態路由頁面可正常訪問，無執行時錯誤

### Requirement: SEO 行為一致性

系統 MUST 確保修正 async params 後，`generateMetadata` 函式產出的 SEO meta tags 與修正前邏輯完全一致，不得影響搜尋引擎索引。

#### Scenario: Meta tags 輸出一致

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 訪客或搜尋引擎爬蟲造訪動態路由頁面
- **THEN** `<title>`, `<meta name="description">`, `<link rel="canonical">` 等標籤的內容與修正前相同（僅改 API 使用方式，不改邏輯）

#### Scenario: Open Graph tags 正常

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 使用者分享動態路由頁面至社交媒體
- **THEN** Open Graph 和 Twitter Card meta tags 正常顯示，內容與修正前一致

#### Scenario: JSON-LD 結構化資料不變

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 搜尋引擎爬蟲解析頁面
- **THEN** JSON-LD 結構化資料（Article、BreadcrumbList 等）的內容與修正前相同

### Requirement: 建置驗證

系統 MUST 通過 Next.js 建置流程驗證，確保所有動態路由頁面在靜態建置時正確處理 async params。

#### Scenario: 建置成功

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 執行 `npm run build`
- **THEN** 建置流程成功完成，無編譯錯誤或警告

#### Scenario: TypeScript 編譯通過

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 建置過程執行 TypeScript 型別檢查
- **THEN** 所有動態路由頁面的型別定義正確，無型別錯誤

#### Scenario: 動態路由頁面靜態生成

- **GIVEN** 所有動態路由頁面已修正為 async/await params
- **WHEN** 建置過程處理動態路由頁面
- **THEN** Next.js 正確識別 async params 使用方式，生成靜態頁面或設定 ISR 策略
