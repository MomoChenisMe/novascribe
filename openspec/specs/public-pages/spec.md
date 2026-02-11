## ADDED Requirements

### Requirement: 首頁文章列表

系統 SHALL 在首頁顯示已發佈（PUBLISHED）文章列表，按 `publishedAt` 降序排列，支援分頁瀏覽。每頁顯示預設數量的文章卡片，包含標題、摘要、封面圖片、分類、標籤、發佈日期與閱讀時間。

#### Scenario: 載入首頁文章列表

- **WHEN** 訪客造訪首頁
- **THEN** 系統顯示最新的已發佈文章列表，每頁 10 篇，包含文章卡片（標題、摘要、封面圖片、分類、標籤、發佈日期、閱讀時間），並顯示分頁導航

#### Scenario: 首頁分頁導航

- **WHEN** 訪客點擊第 2 頁的分頁連結
- **THEN** 系統顯示第 2 頁的文章列表，URL 更新為 `/?page=2`

#### Scenario: 無已發佈文章

- **WHEN** 系統中沒有任何 PUBLISHED 狀態的文章
- **THEN** 首頁顯示「目前沒有文章」的提示訊息

#### Scenario: 不顯示非 PUBLISHED 文章

- **WHEN** 系統中有 DRAFT、SCHEDULED、ARCHIVED 狀態的文章
- **THEN** 首頁僅顯示 PUBLISHED 狀態的文章，其他狀態的文章不出現在列表中

### Requirement: 精選文章展示

系統 SHALL 在首頁突出顯示精選文章區域，展示最新或特定的文章作為 Hero 區塊，提供視覺焦點。精選文章 SHALL 預設為最新的已發佈文章，未來可擴充為支援手動標記（如 `isFeatured` 欄位）。

#### Scenario: 顯示精選文章

- **WHEN** 訪客造訪首頁
- **THEN** 系統在頁面頂部 Hero 區域展示最新的已發佈文章，包含大標題、摘要和封面圖片

#### Scenario: 精選文章來源

- **WHEN** 系統尚未實作手動標記功能
- **THEN** 精選文章區域自動選擇最新的已發佈文章（按 `publishedAt` 降序第一篇）

### Requirement: 分類導航

系統 SHALL 在首頁提供分類導航區域，讓訪客能快速瀏覽各分類。

#### Scenario: 顯示分類導航

- **WHEN** 訪客造訪首頁
- **THEN** 系統顯示所有含有已發佈文章的分類列表，每個分類附帶文章數量，點擊可跳轉至該分類頁面

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

### Requirement: 分類列表頁

系統 SHALL 提供分類列表頁面（`/categories`），顯示所有分類及其文章數量。

#### Scenario: 載入分類列表

- **WHEN** 訪客造訪 `/categories`
- **THEN** 系統顯示所有含有已發佈文章的分類，每個分類包含名稱、描述和文章數量

#### Scenario: 無分類

- **WHEN** 系統中沒有任何分類或沒有含已發佈文章的分類
- **THEN** 系統顯示「目前沒有分類」的提示訊息

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

### Requirement: 標籤列表頁

系統 SHALL 提供標籤列表頁面（`/tags`），以標籤雲的形式顯示所有標籤，標籤大小依據文章數量調整。

#### Scenario: 載入標籤雲

- **WHEN** 訪客造訪 `/tags`
- **THEN** 系統以標籤雲的形式顯示所有有關聯已發佈文章的標籤，文章數量多的標籤字體較大

#### Scenario: 無標籤

- **WHEN** 系統中沒有任何標籤或沒有與已發佈文章關聯的標籤
- **THEN** 系統顯示「目前沒有標籤」的提示訊息

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

### Requirement: 關於頁面

系統 SHALL 提供關於頁面（`/about`），顯示部落格介紹的靜態內容。

#### Scenario: 載入關於頁面

- **WHEN** 訪客造訪 `/about`
- **THEN** 系統顯示部落格介紹、作者資訊等靜態內容

### Requirement: ISR 渲染策略

系統 SHALL 使用 Incremental Static Regeneration（ISR）策略渲染前台頁面，在效能與即時性之間取得平衡。

#### Scenario: 文章頁 ISR 設定

- **WHEN** 訪客造訪文章頁面
- **THEN** 系統使用 `revalidate = 60` 的 ISR 策略，頁面在建構後最多 60 秒後重新驗證

#### Scenario: 首頁和列表頁 ISR 設定

- **WHEN** 訪客造訪首頁或分類/標籤列表頁面
- **THEN** 系統使用 `revalidate = 300` 的 ISR 策略，頁面每 5 分鐘重新驗證

#### Scenario: 關於頁 ISR 設定

- **WHEN** 訪客造訪關於頁面
- **THEN** 系統使用 `revalidate = 3600` 的 ISR 策略，頁面每小時重新驗證

### Requirement: SEO 整合

系統 SHALL 為每個前台頁面提供完整的 SEO 支援，包含 `generateMetadata` 動態 meta tags、JSON-LD 結構化資料和 MetaTags 元件整合。

#### Scenario: 文章頁 SEO metadata

- **WHEN** 訪客或搜尋引擎爬蟲造訪文章頁面
- **THEN** 系統透過 `generateMetadata` 輸出動態 meta tags，包含 title（SeoMetadata 優先，fallback 文章標題）、description（SeoMetadata 優先，fallback 摘要）、Open Graph tags、Twitter Card tags、canonical URL、robots 指令

#### Scenario: 文章頁 JSON-LD

- **WHEN** 訪客造訪文章頁面
- **THEN** 系統嵌入 `Article` 類型的 JSON-LD 結構化資料，包含標題、作者、發佈日期、修改日期、圖片

#### Scenario: 首頁 JSON-LD

- **WHEN** 訪客造訪首頁
- **THEN** 系統嵌入 `WebSite` 類型的 JSON-LD 結構化資料

#### Scenario: 麵包屑 JSON-LD

- **WHEN** 訪客造訪文章或分類頁面
- **THEN** 系統嵌入 `BreadcrumbList` 類型的 JSON-LD 結構化資料

#### Scenario: RSS Auto-discovery

- **WHEN** 訪客或 RSS 閱讀器造訪任何前台頁面
- **THEN** 頁面 `<head>` 包含 RSS/Atom auto-discovery `<link>` 標籤

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
