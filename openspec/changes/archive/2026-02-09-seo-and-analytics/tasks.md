## 1. 資料庫 Schema 與 Migration

- [x] 1.1 撰寫 `seo_metadata` model 的 Prisma schema 測試（驗證欄位定義、關聯、約束）
- [x] 1.2 在 `schema.prisma` 新增 `SeoMetadata` model（包含 meta title、description、OG tags、Twitter Card、canonical URL、noIndex、noFollow、focus keyword、seo score）
- [x] 1.3 撰寫 `sitemap_configs` model 的 Prisma schema 測試
- [x] 1.4 在 `schema.prisma` 新增 `SitemapConfig` model（包含 path、changefreq、priority、enabled）
- [x] 1.5 撰寫 `site_settings` model 的 Prisma schema 測試
- [x] 1.6 在 `schema.prisma` 新增 `SiteSetting` model（key-value 鍵值對）
- [x] 1.7 執行 `prisma migrate dev` 建立 migration 並驗證資料表結構正確

## 2. SEO Meta 資料 CRUD API

- [x] 2.1 撰寫 GET `/api/admin/seo/posts/[postId]` 的整合測試（取得文章 SEO 設定、無記錄時回傳空值、未認證回傳 401）
- [x] 2.2 實作 GET `/api/admin/seo/posts/[postId]` route handler
- [x] 2.3 撰寫 PUT `/api/admin/seo/posts/[postId]` 的整合測試（建立/更新 SEO 設定、欄位長度驗證、自動觸發評分計算）
- [x] 2.4 實作 PUT `/api/admin/seo/posts/[postId]` route handler（含 upsert 邏輯）
- [x] 2.5 撰寫 SEO 資料驗證邏輯的單元測試（meta title ≤ 70 字元、description ≤ 160 字元、priority 0.0-1.0）
- [x] 2.6 實作 SEO 資料驗證函式（`src/lib/seo/validation.ts`）

## 3. SEO 評分引擎

- [x] 3.1 撰寫 SEO 評分計算函式的單元測試（各評分項目權重、邊界值、無 SEO 設定時的評分）
- [x] 3.2 實作 SEO 評分計算函式（`src/lib/seo/score.ts`），涵蓋 10 項檢查（meta title、description、focus keyword、OG image、內容長度、子標題、連結等）
- [x] 3.3 撰寫 GET `/api/admin/seo/score/[postId]` 的整合測試（回傳總分與各項目明細）
- [x] 3.4 實作 GET `/api/admin/seo/score/[postId]` route handler
- [x] 3.5 撰寫評分等級判定的單元測試（80-100 優良、60-79 尚可、0-59 需改善）
- [x] 3.6 實作評分等級判定函式

## 4. SEO Meta 編輯元件

- [x] 4.1 撰寫 `SeoMetaForm` 元件的 RTL 測試（表單渲染、欄位填寫、送出、驗證錯誤顯示）
- [x] 4.2 實作 `SeoMetaForm` 元件（`src/components/seo/SeoMetaForm.tsx`），包含 meta title、description、OG 設定、canonical URL、noIndex/noFollow、focus keyword
- [x] 4.3 撰寫 `SeoPreview` 元件的 RTL 測試（模擬 Google 搜尋結果、長文字截斷、預設值顯示）
- [x] 4.4 實作 `SeoPreview` 元件（`src/components/seo/SeoPreview.tsx`），即時預覽 Google 搜尋結果
- [x] 4.5 撰寫 `SeoScoreIndicator` 元件的 RTL 測試（顏色對應、分數顯示、各項目明細）
- [x] 4.6 實作 `SeoScoreIndicator` 元件（`src/components/seo/SeoScoreIndicator.tsx`）

## 5. Sitemap 動態生成

- [x] 5.1 撰寫 `sitemap.ts` 的整合測試（包含已發佈文章、排除草稿/下架/noIndex 文章、包含分類和標籤頁、空白部落格情境）
- [x] 5.2 實作 `src/app/sitemap.ts`，動態生成 XML Sitemap
- [x] 5.3 撰寫 Sitemap 設定 API 的整合測試（GET/PUT `/api/admin/seo/sitemap-config`、priority 範圍驗證）
- [x] 5.4 實作 Sitemap 設定 API route handlers

## 6. Robots.txt 動態生成

- [x] 6.1 撰寫 `robots.ts` 的整合測試（預設規則、自訂規則、Sitemap URL 包含、保護性路徑不可解除）
- [x] 6.2 實作 `src/app/robots.ts`，動態生成 robots.txt
- [x] 6.3 撰寫 robots.txt 規則解析的單元測試（解析自訂規則字串、合併預設規則）
- [x] 6.4 實作 robots.txt 規則解析函式（`src/lib/seo/robots.ts`）

## 7. JSON-LD Structured Data 元件

- [x] 7.1 撰寫 `ArticleJsonLd` 元件的單元測試（完整欄位輸出、無圖片時省略 image、JSON-LD 格式正確性）
- [x] 7.2 實作 `ArticleJsonLd` 元件（`src/components/seo/ArticleJsonLd.tsx`）
- [x] 7.3 撰寫 `BreadcrumbJsonLd` 元件的單元測試（有分類路徑、無分類、子分類層級）
- [x] 7.4 實作 `BreadcrumbJsonLd` 元件（`src/components/seo/BreadcrumbJsonLd.tsx`）
- [x] 7.5 撰寫 `WebSiteJsonLd` 元件的單元測試（包含 SearchAction、預設標題）
- [x] 7.6 實作 `WebSiteJsonLd` 元件（`src/components/seo/WebSiteJsonLd.tsx`）
- [x] 7.7 撰寫 `MetaTags` 元件的單元測試（OG tags、Twitter Card tags、預設值邏輯）
- [x] 7.8 實作 `MetaTags` 元件（`src/components/seo/MetaTags.tsx`），處理 OG 和 Twitter Card meta tags 注入

## 8. 全站 SEO 設定 API

- [x] 8.1 撰寫 GET/PUT `/api/admin/seo/settings` 的整合測試（取得設定、更新設定、未認證回傳 401）
- [x] 8.2 實作全站 SEO 設定 API route handlers（`src/app/api/admin/seo/settings/route.ts`）
- [x] 8.3 撰寫 `getSettingValue` / `setSettingValue` 工具函式的單元測試
- [x] 8.4 實作 site_settings 工具函式（`src/lib/settings.ts`）

## 9. GA4 追蹤整合

- [x] 9.1 撰寫 `AnalyticsProvider` 元件的 RTL 測試（GA4 ID 存在時載入 script、未設定時不載入、後台頁面不追蹤）
- [x] 9.2 實作 `AnalyticsProvider` 元件（`src/components/analytics/AnalyticsProvider.tsx`），使用 `@next/third-parties`
- [x] 9.3 撰寫 `trackEvent` 工具函式的單元測試（正常發送事件、gtag 不存在時靜默失敗）
- [x] 9.4 實作 `trackEvent` 工具函式（`src/lib/analytics.ts`）
- [x] 9.5 撰寫 `ScrollTracker` 元件的 RTL 測試（捲動到各深度觸發事件、不重複觸發）
- [x] 9.6 實作 `ScrollTracker` 元件（`src/components/analytics/ScrollTracker.tsx`）
- [x] 9.7 撰寫 `ReadTimeTracker` 元件的 RTL 測試（離開頁面時發送閱讀時間）
- [x] 9.8 實作 `ReadTimeTracker` 元件（`src/components/analytics/ReadTimeTracker.tsx`）
- [x] 9.9 撰寫 `OutboundLinkTracker` 元件的 RTL 測試（點擊外部連結觸發事件、站內連結不觸發）
- [x] 9.10 實作 `OutboundLinkTracker` 元件（`src/components/analytics/OutboundLinkTracker.tsx`）

## 10. GA4 數據儀表板

- [x] 10.1 撰寫 GA4 Data API 服務層的單元測試（取得概覽數據、API 錯誤處理、未設定時的回應）
- [x] 10.2 實作 GA4 Data API 服務層（`src/lib/analytics/ga4-data.ts`）
- [x] 10.3 撰寫 GET `/api/admin/analytics/overview` 的整合測試
- [x] 10.4 實作 GA4 概覽 API route handler
- [x] 10.5 撰寫 `TrafficOverviewChart` 元件的 RTL 測試（數據顯示、比較百分比、無數據提示）
- [x] 10.6 實作 `TrafficOverviewChart` 元件（`src/components/dashboard/TrafficOverviewChart.tsx`）
- [x] 10.7 實作流量分析儀表板頁面（`src/app/(admin)/admin/analytics/page.tsx`）

## 11. Google Search Console 整合

- [x] 11.1 撰寫 Search Console 驗證 meta tag 注入的測試（設定驗證碼後 head 包含 meta tag、未設定時不包含）
- [x] 11.2 實作 Search Console 驗證 meta tag 注入（透過 Next.js `generateMetadata`）
- [x] 11.3 撰寫 Search Console API 服務層的單元測試（取得效能數據、依維度分組、API 錯誤處理）
- [x] 11.4 實作 Search Console API 服務層（`src/lib/search-console/index.ts`）
- [x] 11.5 撰寫 GET `/api/admin/search-console/performance` 的整合測試（含 dimension query 參數）
- [x] 11.6 實作搜尋效能 API route handler
- [x] 11.7 撰寫 `SearchPerformanceChart` 元件的 RTL 測試（趨勢圖渲染、期間切換、未整合提示）
- [x] 11.8 實作 `SearchPerformanceChart` 元件（`src/components/dashboard/SearchPerformanceChart.tsx`）

## 12. SEO 分析儀表板

- [x] 12.1 撰寫 GET `/api/admin/seo/dashboard` 的整合測試（概覽數據、缺少 meta 清單、改善建議、所有完善時的回應）
- [x] 12.2 實作 SEO 儀表板 API route handler
- [x] 12.3 撰寫 SEO 改善建議產生器的單元測試（各規則觸發條件、無建議時的回應）
- [x] 12.4 實作 SEO 改善建議產生函式（`src/lib/seo/suggestions.ts`）
- [x] 12.5 撰寫 `SeoOverviewCard` 元件的 RTL 測試（統計數字顯示、顏色對應）
- [x] 12.6 實作 `SeoOverviewCard` 元件（`src/components/dashboard/SeoOverviewCard.tsx`）
- [x] 12.7 撰寫 `MissingSeoList` 元件的 RTL 測試（清單渲染、快速編輯連結、全部完善時的訊息）
- [x] 12.8 實作 `MissingSeoList` 元件（`src/components/dashboard/MissingSeoList.tsx`）
- [x] 12.9 實作 SEO 儀表板頁面（`src/app/(admin)/admin/seo/page.tsx`）
- [x] 12.10 實作全站 SEO 設定頁面（`src/app/(admin)/admin/seo/settings/page.tsx`）

## 13. E2E 測試

- [x] 13.1 撰寫文章 SEO 設定流程的 Playwright E2E 測試（開啟文章編輯器 → 填寫 SEO 設定 → 預覽 → 儲存 → 驗證評分更新）
- [x] 13.2 撰寫 SEO 儀表板的 Playwright E2E 測試（存取儀表板 → 查看概覽 → 檢視缺少 SEO 清單 → 點擊快速編輯）
- [x] 13.3 撰寫 sitemap.xml 和 robots.txt 的 Playwright E2E 測試（請求路徑 → 驗證 XML/txt 格式正確）
- [x] 13.4 撰寫全站 SEO 設定的 Playwright E2E 測試（設定 GA4 ID、Search Console 驗證碼 → 驗證前台 head 包含對應標籤）
