## Context

NovaScribe 是一個基於 Next.js App Router 的個人部落格系統。基礎架構（foundation-and-auth）已定義了專案結構、資料庫連線、認證機制和測試工具鏈。內容管理（content-management）已規劃了文章、分類、標籤等核心資料模型。

此 change 在現有基礎上，建構完整的 SEO 基礎設施和數據分析能力，讓每篇文章都能被搜尋引擎正確索引，並提供流量與搜尋效能的數據回饋。

**現狀**：
- 專案已有 User model、認證系統、後台佈局
- 內容管理已規劃 posts、categories、tags 等資料表
- 尚無任何 SEO meta 管理、sitemap、structured data、analytics 整合

**限制條件**：
- 個人部落格，單一管理者（Momo）
- SEO 設定需與文章編輯流程無縫整合
- GA4 和 Search Console 數據透過 Google API 取得，需處理 API 配額與認證
- 所有 SEO 相關的 HTML 輸出必須通過 SSR/SSG 生成，確保爬蟲可讀

## Goals / Non-Goals

**Goals：**
- 為每篇文章提供完整的 SEO meta 管理能力（meta title、description、OG tags、canonical URL）
- 自動生成符合 Google 規範的 sitemap.xml 和 robots.txt
- 自動注入 JSON-LD structured data（Article、BreadcrumbList、WebSite）
- 整合 GA4 追蹤碼並支援自訂事件追蹤
- 整合 Google Search Console 網站驗證與搜尋效能數據
- 提供 SEO 分析儀表板，讓管理者快速掌握 SEO 健康度
- 在文章編輯時提供即時 SEO 預覽和評分回饋

**Non-Goals：**
- 自動化 SEO 內容生成（AI 撰寫 meta description）— 屬未來功能
- 多語系 SEO（hreflang tags）— 個人部落格暫不需要
- 付費搜尋廣告整合（Google Ads）— 非自然搜尋範疇
- 社群媒體分析（Facebook Insights、Twitter Analytics）— 僅處理 OG/Twitter Card meta tags
- 即時搜尋排名追蹤 — 依賴 Search Console API 回傳數據，非即時系統

## Decisions

### 1. SEO Meta 資料儲存：獨立 `seo_metadata` 資料表

```prisma
model SeoMetadata {
  id              String   @id @default(cuid())
  postId          String   @unique
  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  metaTitle       String?  @map("meta_title") @db.VarChar(70)
  metaDescription String?  @map("meta_description") @db.VarChar(160)
  ogTitle         String?  @map("og_title") @db.VarChar(95)
  ogDescription   String?  @map("og_description") @db.VarChar(200)
  ogImage         String?  @map("og_image")
  twitterCard     String   @default("summary_large_image") @map("twitter_card")
  canonicalUrl    String?  @map("canonical_url")
  noIndex         Boolean  @default(false) @map("no_index")
  noFollow        Boolean  @default(false) @map("no_follow")
  focusKeyword    String?  @map("focus_keyword") @db.VarChar(100)
  seoScore        Int?     @map("seo_score")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("seo_metadata")
}
```

**理由**：
- 獨立資料表保持 posts 資料表簡潔，SEO 欄位眾多且未來可能持續擴充
- `onDelete: Cascade` 確保文章刪除時 SEO 資料一併清除
- 欄位長度限制符合 Google 建議（title ≤ 60-70 字元、description ≤ 155-160 字元）
- `focusKeyword` 用於 SEO 評分計算
- `seoScore` 快取評分結果，避免每次重算

**替代方案**：
- 直接在 posts 資料表新增欄位 → 欄位過多，違反單一職責原則
- 使用 JSON 欄位儲存 → 無法對個別欄位建立索引或設定約束

### 2. Sitemap 設定儲存：`sitemap_configs` 資料表

```prisma
model SitemapConfig {
  id          String   @id @default(cuid())
  path        String   @unique
  changefreq  String   @default("weekly")
  priority    Float    @default(0.5)
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("sitemap_configs")
}
```

**理由**：
- 儲存各路徑類型（文章、分類、標籤）的預設 sitemap 設定
- 管理者可調整更新頻率和優先權
- `path` 使用 pattern 格式（如 `/posts/*`、`/categories/*`）

**替代方案**：
- 使用 next-sitemap 套件 → 過度依賴第三方，自建更靈活
- 靜態設定檔 → 無法在後台動態調整

### 3. SEO 全站設定：`site_settings` 資料表

```prisma
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_settings")
}
```

**理由**：
- 鍵值對設計適合儲存各類全站設定（site title、site description、GA4 measurement ID、Search Console verification code、robots.txt 內容等）
- 不需為每個設定建立獨立欄位，擴充性極高
- 設定項目示例：
  - `site_title`：網站標題
  - `site_description`：網站描述
  - `site_url`：網站 URL
  - `ga4_measurement_id`：GA4 追蹤碼
  - `google_site_verification`：Search Console 驗證碼
  - `robots_txt_custom_rules`：自訂 robots.txt 規則
  - `default_og_image`：預設 OG 圖片

**替代方案**：
- 環境變數 → GA4 ID 等固定值可用環境變數，但管理者需要在後台可調整的設定不適合
- 獨立的 settings model 帶明確欄位 → 每次新增設定項都需要 migration，不夠靈活

### 4. Sitemap 生成策略：Next.js App Router 原生 `sitemap.ts`

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: `${siteUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...posts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

**理由**：
- Next.js App Router 原生支援 `sitemap.ts`，會自動在 `/sitemap.xml` 路徑提供
- 每次請求動態生成，確保包含最新發佈的文章
- 無需額外套件或 cron job
- 可搭配 ISR（Incremental Static Regeneration）快取以降低資料庫負載

**替代方案**：
- next-sitemap 套件 → 主要設計給 Pages Router，與 App Router 整合不夠原生
- 靜態生成 + webhook 觸發重建 → 架構過於複雜

### 5. Robots.txt 生成：Next.js App Router 原生 `robots.ts`

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const customRules = await getSettingValue('robots_txt_custom_rules');
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
      // 解析自訂規則
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

**理由**：Next.js 原生支援 `robots.ts`，與 sitemap 同樣享有框架級整合。管理者可透過 `site_settings` 自訂規則。

### 6. Structured Data 注入：共用 JSON-LD 元件

```typescript
// src/components/seo/JsonLd.tsx
export function ArticleJsonLd({ post, author }: ArticleJsonLdProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    // ...
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

支援的 schema 類型：
- **Article**：每篇文章頁面
- **BreadcrumbList**：麵包屑導覽
- **WebSite**：首頁，含 SearchAction
- **Person**：作者資訊

**理由**：
- React 元件方式可在 Server Component 中直接使用
- JSON-LD 是 Google 推薦的 structured data 格式
- 每種 schema 類型獨立元件，可組合使用

**替代方案**：
- next-seo 套件 → 目前對 App Router 支援有限
- Microdata 格式 → Google 偏好 JSON-LD，且 JSON-LD 不影響 HTML 結構

### 7. GA4 整合：@next/third-parties

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.GA4_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
```

自訂事件追蹤透過 client component：

```typescript
// src/lib/analytics.ts
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
```

追蹤事件清單：
- `page_view`（自動）
- `article_read`：文章閱讀（含閱讀時間）
- `scroll_depth`：捲動深度（25%、50%、75%、100%）
- `outbound_click`：外部連結點擊

**理由**：
- `@next/third-parties` 是 Next.js 官方套件，最佳化了第三方 script 載入效能
- 自訂事件透過 `gtag` 全域函式，與 GA4 原生整合
- Client component 處理瀏覽器端事件追蹤

**替代方案**：
- 手動注入 `<script>` → 效能較差，且需自行處理 hydration
- react-ga4 套件 → 額外依賴，且 @next/third-parties 已足夠

### 8. Google Search Console 整合

**網站驗證**：透過 HTML meta tag 方式

```typescript
// src/app/layout.tsx metadata
export async function generateMetadata() {
  const verificationCode = await getSettingValue('google_site_verification');
  return {
    verification: { google: verificationCode },
  };
}
```

**搜尋效能數據**：透過 Google Search Console API（googleapis）

```typescript
// src/lib/search-console.ts
import { google } from 'googleapis';

export async function getSearchPerformance(siteUrl: string, options: SearchQueryOptions) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  // 查詢搜尋效能數據
}
```

**理由**：
- HTML meta tag 驗證最簡單，透過 Next.js metadata API 原生支援
- Service Account 認證適合後端伺服器端 API 呼叫，不需要 OAuth 使用者授權流程
- 搜尋效能數據快取在資料庫中（每日同步一次），避免頻繁 API 呼叫

**替代方案**：
- 檔案驗證（google-site-verification.html）→ 靜態檔案管理較麻煩
- OAuth 2.0 使用者授權 → 需要管理者手動授權，不適合自動化場景

### 9. SEO 評分演算法

SEO 評分基於以下權重計算（滿分 100）：

| 檢查項目 | 權重 | 說明 |
|---------|------|------|
| Meta Title 存在且長度適當 | 15 | 30-60 字元 |
| Meta Description 存在且長度適當 | 15 | 120-160 字元 |
| Focus Keyword 設定 | 10 | 已填寫焦點關鍵字 |
| Focus Keyword 出現在標題 | 10 | 標題包含關鍵字 |
| Focus Keyword 出現在描述 | 10 | 描述包含關鍵字 |
| OG Image 設定 | 10 | 已設定社群分享圖片 |
| 文章內容長度 | 10 | ≥ 300 字 |
| 標題使用（H2/H3） | 10 | 內容有使用子標題 |
| 內部連結 | 5 | 包含站內連結 |
| 外部連結 | 5 | 包含外部參考連結 |

**理由**：參考 Yoast SEO 的評分模式，簡化為適合個人部落格的檢查項目。評分結果快取在 `seo_metadata.seoScore`，在儲存 SEO 設定時重新計算。

### 10. API 端點設計

| 端點 | 方法 | 說明 | 認證 |
|------|------|------|------|
| `/api/admin/seo/posts/[postId]` | GET | 取得文章 SEO 設定 | 需認證 |
| `/api/admin/seo/posts/[postId]` | PUT | 更新文章 SEO 設定 | 需認證 |
| `/api/admin/seo/score/[postId]` | GET | 計算並回傳文章 SEO 評分 | 需認證 |
| `/api/admin/seo/settings` | GET | 取得全站 SEO 設定 | 需認證 |
| `/api/admin/seo/settings` | PUT | 更新全站 SEO 設定 | 需認證 |
| `/api/admin/seo/dashboard` | GET | 取得 SEO 儀表板數據 | 需認證 |
| `/api/admin/seo/sitemap-config` | GET | 取得 sitemap 設定 | 需認證 |
| `/api/admin/seo/sitemap-config` | PUT | 更新 sitemap 設定 | 需認證 |
| `/api/admin/analytics/overview` | GET | 取得 GA4 流量概覽 | 需認證 |
| `/api/admin/analytics/events` | GET | 取得自訂事件數據 | 需認證 |
| `/api/admin/search-console/performance` | GET | 取得搜尋效能數據 | 需認證 |
| `/sitemap.xml` | GET | 動態生成 sitemap | 公開 |
| `/robots.txt` | GET | 動態生成 robots.txt | 公開 |

### 11. 前端元件架構

```
src/
├── app/
│   ├── (admin)/admin/
│   │   ├── seo/
│   │   │   ├── page.tsx              # SEO 儀表板
│   │   │   └── settings/
│   │   │       └── page.tsx          # 全站 SEO 設定
│   │   └── analytics/
│   │       └── page.tsx              # 流量分析儀表板
│   ├── sitemap.ts                    # 動態 sitemap 生成
│   └── robots.ts                     # 動態 robots.txt 生成
├── components/
│   ├── seo/
│   │   ├── SeoMetaForm.tsx           # SEO meta 編輯表單
│   │   ├── SeoPreview.tsx            # Google 搜尋結果預覽
│   │   ├── SeoScoreIndicator.tsx     # SEO 評分指示器
│   │   ├── ArticleJsonLd.tsx         # Article structured data
│   │   ├── BreadcrumbJsonLd.tsx      # BreadcrumbList structured data
│   │   ├── WebSiteJsonLd.tsx         # WebSite structured data
│   │   └── MetaTags.tsx              # OG/Twitter meta tags 元件
│   ├── analytics/
│   │   ├── AnalyticsProvider.tsx      # GA4 事件追蹤 provider
│   │   ├── ScrollTracker.tsx          # 捲動深度追蹤
│   │   ├── ReadTimeTracker.tsx        # 閱讀時間追蹤
│   │   └── OutboundLinkTracker.tsx    # 外部連結追蹤
│   └── dashboard/
│       ├── SeoOverviewCard.tsx        # SEO 概覽卡片
│       ├── MissingSeoList.tsx         # 缺少 SEO 資料清單
│       ├── SearchPerformanceChart.tsx # 搜尋效能趨勢圖
│       └── TrafficOverviewChart.tsx   # 流量概覽圖表
```

## Risks / Trade-offs

- **[Google API 配額限制]** Search Console API 和 GA4 Data API 有每日請求配額 → 實作每日同步機制，將數據快取在本地資料庫，避免即時 API 呼叫
- **[Service Account 設定複雜度]** Google Cloud 專案設定、Service Account 建立、API 啟用流程繁瑣 → 提供詳細的設定文件，且 Search Console / GA4 整合設為可選功能
- **[SEO 評分主觀性]** SEO 評分演算法無法涵蓋所有排名因素 → 明確定位為「SEO 完整度檢查」而非排名預測，並在 UI 上清楚說明
- **[Sitemap 效能]** 文章數量增長後，動態生成 sitemap 可能影響效能 → 使用 ISR 快取（revalidate: 3600），文章變更時觸發重新驗證
- **[GA4 數據延遲]** GA4 數據有 24-48 小時延遲 → 在儀表板明確標示數據更新時間
- **[第三方服務依賴]** GA4 和 Search Console 為可選整合，若未設定不應影響核心 SEO 功能 → 所有第三方整合做 graceful degradation，未設定時顯示設定引導

## Migration Plan

1. 建立資料庫 migration：新增 `seo_metadata`、`sitemap_configs`、`site_settings` 資料表
2. 實作 SEO meta CRUD API 和文章編輯器 SEO 區塊
3. 實作 sitemap.ts 和 robots.ts 動態生成
4. 實作 JSON-LD structured data 元件
5. 整合 GA4 追蹤碼和自訂事件
6. 實作 Search Console 驗證和數據同步
7. 建立 SEO 儀表板和流量分析儀表板
8. 為所有既有文章生成預設 SEO metadata（migration script）

**Rollback**：所有 SEO 功能為加法型變更，可透過 Prisma migration rollback 移除資料表。GA4 script 移除不影響既有功能。

## Open Questions

- Search Console 數據同步頻率？— 暫定每日一次（凌晨自動同步），可透過後台手動觸發
- GA4 Data API vs GA4 Measurement Protocol？— 使用 Data API（後端讀取報表數據），Measurement Protocol 用於伺服器端事件（暫不需要）
- 是否需要支援多 sitemap 檔案（sitemap index）？— 初期單一 sitemap 檔案，文章超過 50,000 篇時再考慮分割
- OG Image 是否支援自動生成？— 初期手動上傳，未來可考慮使用 `@vercel/og` 自動生成
