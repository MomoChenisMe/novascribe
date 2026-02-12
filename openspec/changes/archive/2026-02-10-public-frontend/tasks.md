## 1. 套件安裝與基礎設定

- [x] 1.1 安裝前台相關套件（unified、remark-parse、remark-gfm、remark-rehype、rehype-stringify、rehype-slug、@shikijs/rehype、shiki、reading-time、feed）
- [x] 1.2 建立前台 Route Group 結構（`src/app/(public)/layout.tsx`）與基礎 layout

## 2. 主題系統

- [x] 2.1 撰寫 CSS 變數主題系統測試（light/dark 變數定義、`data-theme` 切換）
- [x] 2.2 實作 CSS 變數主題系統（`globals.css` 中 `@theme` + `[data-theme="dark"]`）
- [x] 2.3 撰寫 ThemeToggle 元件測試（切換按鈕、localStorage 持久化、系統偏好偵測）
- [x] 2.4 實作 ThemeToggle 元件（`src/components/public/layout/ThemeToggle.tsx`）與防閃爍 script
- [x] 2.5 撰寫中文排版樣式測試（`.prose-cjk` 行高、字距、斷行規則）
- [x] 2.6 實作中文排版最佳化樣式（CJK typography CSS）
- [x] 2.7 撰寫響應式設計測試（手機/平板/桌面斷點、元素顯示/隱藏規則）
- [x] 2.8 實作響應式設計基礎樣式與 breakpoint 設定

## 3. 共用 Layout 元件

- [x] 3.1 撰寫 Header 元件測試（Logo、導航連結、搜尋入口、Dark mode 切換、響應式漢堡選單）
- [x] 3.2 實作 Header 元件（`src/components/public/layout/Header.tsx`）
- [x] 3.3 撰寫 Footer 元件測試（版權資訊、RSS 連結、社交連結）
- [x] 3.4 實作 Footer 元件（`src/components/public/layout/Footer.tsx`）
- [x] 3.5 撰寫 Sidebar 元件測試（分類列表、標籤雲、熱門文章）
- [x] 3.6 實作 Sidebar 元件（`src/components/public/layout/Sidebar.tsx`）
- [x] 3.7 撰寫 Breadcrumb 元件測試（首頁 → 分類 → 文章路徑）
- [x] 3.8 實作 Breadcrumb 元件（`src/components/public/common/Breadcrumb.tsx`）
- [x] 3.9 撰寫 Pagination 元件測試（頁碼、上/下一頁、總頁數、邊界情況）
- [x] 3.10 實作 Pagination 元件（`src/components/public/common/Pagination.tsx`）

## 4. 公開查詢 Service 層

- [x] 4.1 撰寫 public-post.service 測試（getPublishedPosts 分頁/篩選、getPostBySlug、getRelatedPosts）
- [x] 4.2 實作 public-post.service（`src/lib/services/public-post.service.ts`）
- [x] 4.3 撰寫 public-category.service 測試（getPublicCategories 含文章數、getCategoryBySlug）
- [x] 4.4 實作 public-category.service（`src/lib/services/public-category.service.ts`）
- [x] 4.5 撰寫 public-tag.service 測試（getPublicTags 含文章數、getTagBySlug）
- [x] 4.6 實作 public-tag.service（`src/lib/services/public-tag.service.ts`）

## 5. Markdown 渲染引擎

- [x] 5.1 撰寫 Markdown 渲染函式測試（基本解析、GFM 表格/刪除線/任務清單、HTML 輸出）
- [x] 5.2 實作 Markdown 渲染函式（`src/lib/markdown.ts`，unified pipeline：remark-parse → remark-gfm → remark-rehype → rehype-stringify）
- [x] 5.3 撰寫 Shiki 程式碼高亮測試（語言偵測、高亮輸出、Dark/Light 主題、常用語言支援）
- [x] 5.4 整合 Shiki 至 Markdown pipeline（`@shikijs/rehype`，支援 TS/JS/Python/Shell/CSS/HTML/JSON/SQL）
- [x] 5.5 撰寫目錄生成測試（heading extraction、巢狀層級、自動 ID）
- [x] 5.6 實作目錄生成函式（extractToc，從 Markdown 抽取 H2/H3 標題樹）與 rehype-slug 整合
- [x] 5.7 撰寫閱讀時間計算測試（中文字數計算、英文單字計算、混合內容）
- [x] 5.8 實作閱讀時間計算函式（`calculateReadingTime`，中文 400 字/分鐘、英文 200 字/分鐘）

## 6. 文章相關元件

- [x] 6.1 撰寫 ArticleCard 元件測試（封面圖、標題、摘要、日期、分類、標籤、閱讀時間）
- [x] 6.2 實作 ArticleCard 元件（`src/components/public/article/ArticleCard.tsx`）
- [x] 6.3 撰寫 ArticleContent 元件測試（HTML 渲染、程式碼區塊樣式、圖片響應式）
- [x] 6.4 實作 ArticleContent 元件（`src/components/public/article/ArticleContent.tsx`）
- [x] 6.5 撰寫 ArticleHeader 元件測試（標題、作者、日期、閱讀時間、分類標籤）
- [x] 6.6 實作 ArticleHeader 元件（`src/components/public/article/ArticleHeader.tsx`）
- [x] 6.7 撰寫 ArticleToc 元件測試（目錄渲染、巢狀層級、active 狀態、sticky 行為）
- [x] 6.8 實作 ArticleToc 元件（`src/components/public/article/ArticleToc.tsx`）
- [x] 6.9 撰寫 RelatedPosts 元件測試（相關文章列表、無相關文章時不顯示）
- [x] 6.10 實作 RelatedPosts 元件（`src/components/public/article/RelatedPosts.tsx`）
- [x] 6.11 撰寫 ShareButtons 元件測試（Twitter/Facebook/Line 分享連結、複製連結）
- [x] 6.12 實作 ShareButtons 元件（`src/components/public/article/ShareButtons.tsx`）

## 7. 首頁元件

- [x] 7.1 撰寫 HeroSection 元件測試（主標題、副標題、CTA 按鈕）
- [x] 7.2 實作 HeroSection 元件（`src/components/public/home/HeroSection.tsx`）
- [x] 7.3 撰寫 FeaturedPosts 元件測試（精選文章卡片、輪播或網格佈局）
- [x] 7.4 實作 FeaturedPosts 元件（`src/components/public/home/FeaturedPosts.tsx`）
- [x] 7.5 撰寫 RecentPosts 元件測試（最新文章列表、排序、分頁連結）
- [x] 7.6 實作 RecentPosts 元件（`src/components/public/home/RecentPosts.tsx`）
- [x] 7.7 撰寫 TagCloud 元件測試（標籤雲渲染、字體大小對應文章數）
- [x] 7.8 實作 TagCloud 元件（`src/components/public/common/TagCloud.tsx`）
- [x] 7.9 撰寫 CategoryList 元件測試（分類列表、文章數顯示、連結）
- [x] 7.10 實作 CategoryList 元件（`src/components/public/common/CategoryList.tsx`）

## 8. 前台頁面路由

- [x] 8.1 撰寫首頁測試（文章列表渲染、精選文章、分類導航、分頁、generateMetadata）
- [x] 8.2 實作首頁（`src/app/(public)/page.tsx`，ISR revalidate=300）
- [x] 8.3 撰寫文章頁測試（Markdown 渲染、目錄、相關文章、SEO meta、JSON-LD、generateMetadata）
- [x] 8.4 實作文章頁（`src/app/(public)/posts/[slug]/page.tsx`，ISR revalidate=60）
- [x] 8.5 撰寫分類列表頁測試（分類列表渲染、文章數、generateMetadata）
- [x] 8.6 實作分類列表頁（`src/app/(public)/categories/page.tsx`，ISR revalidate=300）
- [x] 8.7 撰寫分類文章列表頁測試（該分類文章、分頁、麵包屑、generateMetadata）
- [x] 8.8 實作分類文章列表頁（`src/app/(public)/categories/[slug]/page.tsx`，ISR revalidate=300）
- [x] 8.9 撰寫標籤列表頁測試（標籤雲渲染、generateMetadata）
- [x] 8.10 實作標籤列表頁（`src/app/(public)/tags/page.tsx`，ISR revalidate=300）
- [x] 8.11 撰寫標籤文章列表頁測試（該標籤文章、分頁、generateMetadata）
- [x] 8.12 實作標籤文章列表頁（`src/app/(public)/tags/[slug]/page.tsx`，ISR revalidate=300）
- [x] 8.13 撰寫關於頁測試（靜態內容渲染、generateMetadata）
- [x] 8.14 實作關於頁（`src/app/(public)/about/page.tsx`，ISR revalidate=3600）

## 9. SEO 整合

- [x] 9.1 撰寫前台 SEO 整合測試（各頁面 generateMetadata 正確性、OG tags、Twitter Card）
- [x] 9.2 整合 SEO 元件至前台頁面（ArticleJsonLd、BreadcrumbJsonLd、WebSiteJsonLd、MetaTags）
- [x] 9.3 撰寫 AnalyticsProvider 整合測試（前台載入 GA4、後台不載入）
- [x] 9.4 整合 AnalyticsProvider 至前台 layout（含 ScrollTracker、ReadTimeTracker、OutboundLinkTracker）

## 10. 搜尋功能

- [x] 10.1 撰寫搜尋 API 測試（GET `/api/search`、query 參數、分頁、只搜尋 PUBLISHED、Rate limiting）
- [x] 10.2 實作搜尋 API route handler（`src/app/api/search/route.ts`）
- [x] 10.3 撰寫 SearchBar 元件測試（輸入框、debounce、提交導航）
- [x] 10.4 實作 SearchBar 元件（`src/components/public/common/SearchBar.tsx`）
- [x] 10.5 撰寫搜尋結果頁測試（搜尋結果列表、關鍵字高亮、分頁、空結果處理）
- [x] 10.6 實作搜尋結果頁（`src/app/(public)/search/page.tsx`，client-side 搜尋）

## 11. RSS Feed

- [x] 11.1 撰寫 RSS 2.0 Feed 測試（XML 格式、文章列表、全文內容、channel 資訊）
- [x] 11.2 實作 RSS 2.0 Feed route handler（`src/app/feed/route.ts`，revalidate=3600）
- [x] 11.3 撰寫 Atom Feed 測試（Atom XML 格式、entry 內容）
- [x] 11.4 實作 Atom Feed route handler（`src/app/feed/atom/route.ts`，revalidate=3600）
- [x] 11.5 撰寫分類 Feed 測試（分類篩選、不存在分類回傳 404）
- [x] 11.6 實作分類 Feed route handler（`src/app/feed/[category]/route.ts`，revalidate=3600）
- [x] 11.7 撰寫 Auto-discovery 測試（`<link>` 標籤存在、href 正確）
- [x] 11.8 整合 Auto-discovery `<link>` 標籤至前台 layout

## 12. E2E 測試

- [x] 12.1 撰寫首頁 E2E 測試（頁面載入、文章列表、分頁導航、Dark mode 切換）
- [x] 12.2 撰寫文章頁 E2E 測試（Markdown 渲染、程式碼高亮、目錄導航、相關文章、分享按鈕）
- [x] 12.3 撰寫分類/標籤頁 E2E 測試（列表渲染、文章篩選、分頁）
- [x] 12.4 撰寫搜尋功能 E2E 測試（搜尋輸入、結果顯示、關鍵字高亮、空結果）
- [x] 12.5 撰寫 RSS Feed E2E 測試（`/feed.xml`、`/feed/atom.xml`、XML 格式驗證）
- [x] 12.6 撰寫 SEO E2E 測試（meta tags、JSON-LD、sitemap 整合驗證）

## 13. ISR 快取管理

- [x] 13.1 撰寫 revalidatePath 整合測試（更新文章後呼叫 revalidatePath 清除快取）
- [x] 13.2 整合 revalidatePath 至文章 CRUD Service（createPost、updatePost、deletePost、updatePostStatus 後清除對應路徑）
