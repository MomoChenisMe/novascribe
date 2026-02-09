## Why

部落格的內容再好，沒有被搜尋引擎發現就等於不存在。NovaScribe 需要從架構層面內建 SEO 最佳化能力，讓每篇文章都能被 Google 正確索引和排名。同時整合 Google Analytics 4 和 Google Search Console，提供流量分析和搜尋效能數據，讓管理者能根據數據優化內容策略。

**目標使用者**：部落格管理者（Momo），需要掌握部落格的搜尋引擎表現和流量狀況。

**SEO 影響評估**：此 change 直接決定部落格的搜尋引擎能見度。良好的 SEO 基礎設施（sitemap、structured data、meta tags）能顯著提升自然搜尋流量。

## What Changes

- 實作每篇文章的 SEO meta 資料管理介面（title、description、OG tags、canonical URL）
- 實作全站 sitemap.xml 自動生成（含文章更新頻率與優先權設定）
- 實作 robots.txt 管理
- 實作 JSON-LD structured data（Article、BreadcrumbList、WebSite schema）
- 實作 Open Graph 和 Twitter Card meta tags
- 整合 Google Analytics 4 追蹤碼
- 實作 GA4 自訂事件追蹤（頁面瀏覽、文章閱讀時間、捲動深度）
- 整合 Google Search Console 網站驗證
- 建立 SEO 分析儀表板（文章 SEO 評分、缺少 meta 資料警告）
- 建立流量分析儀表板（整合 GA4 數據顯示）

## Capabilities

### New Capabilities

- `seo-management`：每篇文章的 SEO meta 資料管理（meta title、meta description、Open Graph tags、Twitter Card、canonical URL），文章編輯時提供 SEO 預覽（Google 搜尋結果模擬）、SEO 完整度評分與建議
- `sitemap-generation`：自動生成 sitemap.xml，包含所有已發佈文章、分類頁、標籤頁的 URL，支援設定更新頻率（changefreq）和優先權（priority），文章發佈/更新時自動重新生成
- `structured-data`：自動生成 JSON-LD structured data，支援 Article、BreadcrumbList、WebSite、Person schema，提升搜尋結果的 rich snippet 呈現
- `robots-txt`：robots.txt 管理，設定爬蟲存取規則，自動指向 sitemap.xml
- `analytics-integration`：Google Analytics 4 追蹤碼嵌入，頁面瀏覽自動追蹤，自訂事件追蹤（文章閱讀時間、捲動深度、外部連結點擊），後台 GA4 數據概覽儀表板
- `search-console-integration`：Google Search Console 網站驗證（HTML meta tag 方式），後台顯示搜尋效能數據（曝光次數、點擊次數、平均排名、CTR）
- `seo-dashboard`：SEO 分析儀表板，顯示各文章 SEO 完整度評分、缺少 meta 資料的文章清單、SEO 改善建議、搜尋效能趨勢圖

### Modified Capabilities

- `blog-post-management`：文章編輯介面新增 SEO 設定區塊（meta title、description、OG image、canonical URL）

## Impact

- **資料庫**：posts 資料表新增 SEO 相關欄位（meta_title、meta_description、og_image、canonical_url），或獨立 seo_settings 資料表
- **API**：新增 `/api/sitemap.xml`、`/api/robots.txt` 動態生成端點，新增 `/api/admin/seo` 分析端點
- **前端**：需在 `<head>` 注入 meta tags、GA4 script、structured data
- **相依套件**：@next/third-parties（GA4）、next-sitemap 或自建、googleapis（Search Console API）
- **環境變數**：GA4_MEASUREMENT_ID、GOOGLE_SITE_VERIFICATION、GOOGLE_SEARCH_CONSOLE_API_KEY（可選）
- **第三方服務**：Google Analytics 4 帳戶、Google Search Console 帳戶
