## Why

NovaScribe 目前只有後台管理系統（認證、內容管理、SEO 管理），缺少前台公開頁面。讀者無法瀏覽文章、搜尋內容或訂閱 RSS Feed。需要建立完整的前台系統，讓部落格能實際被讀者使用。

目標使用者：
- **技術人員**（開發者、工程師）：重視程式碼高亮品質、Markdown 渲染
- **一般讀者**：重視閱讀體驗、排版美觀、瀏覽流暢度

## What Changes

### 前台頁面渲染
- 首頁（文章列表、精選文章、分類導航）
- 文章頁面（Markdown 渲染、Shiki 程式碼高亮、目錄導航、相關文章）
- 分類頁面（分類列表、分類下文章列表）
- 標籤頁面（標籤雲、標籤下文章列表）
- 搜尋頁面（全文搜尋、篩選功能）
- 關於頁面（靜態內容）
- 使用 ISR（Incremental Static Regeneration）渲染策略

### 主題與設計系統
- 豐富風格設計（類似 Medium，卡片式佈局、社交感強）
- Dark mode 支援（預設 light，可切換 dark）
- 中文排版最佳化（CJK typography）
- 響應式設計（手機、平板、桌面）
- 共用元件（Header、Footer、Sidebar、ArticleCard、Pagination）

### RSS Feed
- RSS 2.0 格式（`/feed.xml`）
- Atom 格式（`/feed/atom.xml`）
- 分類 Feed（`/feed/[category].xml`）
- 全文輸出
- Auto-discovery `<link>` 標籤

### SEO 整合
- 整合已建立的 JSON-LD 結構化資料元件
- 整合 MetaTags 元件（OG / Twitter Card）
- 整合 AnalyticsProvider（GA4 追蹤）
- 動態 `generateMetadata` 每頁設定

## Capabilities

### New Capabilities
- `public-pages`: 前台頁面路由與渲染（首頁、文章、分類、標籤、搜尋、關於）
- `theme-system`: 主題設計系統（豐富風格、Dark mode、中文排版、響應式佈局）
- `markdown-rendering`: Markdown 渲染引擎（Shiki 程式碼高亮、目錄生成、自訂元件）
- `rss-feed`: RSS/Atom Feed 生成與 Auto-discovery
- `search-feature`: 前台全文搜尋功能

### Modified Capabilities
- `blog-post-management`: 新增前台文章查詢 API（公開端點，不需認證）
- `category-management`: 新增前台分類查詢 API（公開端點）
- `tag-management`: 新增前台標籤查詢 API（公開端點）

## Impact

### 新增檔案
- 前台頁面路由：`src/app/(public)/` 目錄下 6+ 頁面
- 共用元件：`src/components/public/` 目錄下 10+ 元件
- 主題設定：`src/styles/` 目錄下主題相關 CSS
- RSS 路由：`src/app/feed/` 目錄
- Markdown 工具：`src/lib/markdown.ts`

### 修改檔案
- `src/app/layout.tsx` — 整合 AnalyticsProvider、Dark mode、主題
- `src/app/globals.css` — 擴充主題變數、中文排版樣式
- `package.json` — 新增 shiki、rss 相關套件

### 新增套件
- `shiki` — 程式碼高亮
- `feed` — RSS/Atom Feed 生成
- `reading-time` — 閱讀時間計算

### SEO 影響
- 正面：前台頁面整合已建立的 JSON-LD、MetaTags、Sitemap
- 動態 `generateMetadata` 確保每頁都有正確的 meta tags
- ISR 策略確保搜尋引擎爬蟲拿到完整 HTML
