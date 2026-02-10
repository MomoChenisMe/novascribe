## Context

NovaScribe 後台系統已完整建立（認證、內容管理、SEO 管理、GA4/GSC 整合），但缺少前台公開頁面。目前訪客只能看到空白首頁。本設計涵蓋前台頁面渲染、主題系統、Markdown 渲染、RSS Feed 和搜尋功能的技術架構。

### 現有架構
- **後台路由**：`src/app/(admin)/admin/` — 已完成
- **API 路由**：`src/app/api/admin/` — 全部需認證
- **Service 層**：`post.service.ts`、`category.service.ts`、`tag.service.ts` — 已有完整 CRUD
- **SEO 元件**：JSON-LD、MetaTags、AnalyticsProvider — 已建立待整合
- **資料庫**：Post、Category、Tag、SeoMetadata 等 models 已定義

### 約束條件
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4（CSS-first 設定，`@theme` 在 `globals.css`）
- 無 PostgreSQL 環境（測試全用 mock）
- 目標使用者涵蓋技術人員與一般讀者

## Goals / Non-Goals

**Goals:**
- 建立完整的前台公開頁面（首頁、文章、分類、標籤、搜尋、關於）
- 實作豐富風格主題系統（Dark mode、中文排版、響應式）
- 高品質 Markdown 渲染（Shiki 程式碼高亮、目錄導航）
- RSS 2.0 + Atom Feed 生成
- 前台頁面 SEO 最佳化（整合已建立的 SEO 元件）
- ISR 渲染策略確保效能與即時性平衡

**Non-Goals:**
- 評論系統（另一個 change `comment-system` 處理）
- 使用者註冊/登入（前台只有閱讀功能）
- 國際化（i18n）（目前只做繁體中文）
- 進階搜尋（全文索引如 Elasticsearch）（使用 Prisma 的 `contains` 即可）
- 自訂主題上傳/切換（固定一套主題 + Dark mode）

## Decisions

### 1. 前台路由結構

使用 Route Group `(public)` 與後台 `(admin)` 分離：

```
src/app/
├── (admin)/admin/...          # 已有
├── (public)/
│   ├── layout.tsx             # 前台 layout（Header/Footer/Analytics）
│   ├── page.tsx               # 首頁
│   ├── posts/
│   │   └── [slug]/page.tsx    # 文章頁
│   ├── categories/
│   │   ├── page.tsx           # 分類列表
│   │   └── [slug]/page.tsx    # 分類文章列表
│   ├── tags/
│   │   ├── page.tsx           # 標籤列表
│   │   └── [slug]/page.tsx    # 標籤文章列表
│   ├── search/page.tsx        # 搜尋頁
│   └── about/page.tsx         # 關於頁
├── feed/
│   ├── route.ts               # RSS 2.0 /feed.xml
│   ├── atom/route.ts          # Atom /feed/atom.xml
│   └── [category]/route.ts    # 分類 Feed
└── layout.tsx                 # 根 layout
```

**替代方案**：直接放在 `src/app/` 根目錄不用 Route Group。
**選擇理由**：Route Group 可以為前台設定獨立 layout（Header/Footer），不影響後台佈局。

### 2. 渲染策略：ISR

```typescript
// 文章頁
export const revalidate = 60 // 每 60 秒重驗證

// 首頁
export const revalidate = 300 // 每 5 分鐘重驗證

// 分類/標籤頁
export const revalidate = 300

// 關於頁
export const revalidate = 3600 // 每小時
```

**替代方案**：
- SSG（`generateStaticParams`）：建構時生成，更新慢
- SSR（無 cache）：每次請求都查 DB，效能差

**選擇理由**：ISR 平衡效能與即時性，部落格文章不需要即時更新，但也不能等到下次建構。

### 3. Markdown 渲染引擎

使用 `unified` 生態系：

```
markdown → remark-parse → remark-gfm → remark-rehype → rehype-shiki → rehype-slug → rehype-stringify → HTML
```

核心套件：
- `unified` + `remark-parse` + `remark-gfm` — Markdown 解析（支援 GFM）
- `remark-rehype` — Markdown AST → HTML AST
- `@shikijs/rehype` — Shiki 程式碼高亮（rehype 外掛）
- `rehype-slug` — 標題自動加 ID（目錄導航用）
- `rehype-stringify` — HTML AST → HTML 字串
- `reading-time` — 閱讀時間計算

**替代方案**：
- `react-markdown` + `react-syntax-highlighter`：runtime 渲染，效能差
- `next-mdx-remote`：MDX 導向，過於複雜
- `marked` + `highlight.js`：輕量但缺乏 AST 可操作性

**選擇理由**：`unified` 生態系是 Markdown 處理的業界標準，外掛豐富，Shiki 作為 rehype 外掛零 runtime JS，完美配合 ISR。

### 4. 主題系統設計

使用 Tailwind CSS v4 的 CSS 變數 + `@theme` 配合 `data-theme` 屬性切換 Dark mode：

```css
/* globals.css */
@theme {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-accent: #f59e0b;
  --color-card: #ffffff;
  --color-border: #e5e7eb;
  --color-code-bg: #f8f9fa;
  /* ... */
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
  --color-primary: #60a5fa;
  --color-card: #1e293b;
  --color-border: #334155;
  --color-code-bg: #1e293b;
  /* ... */
}
```

中文排版：
```css
.prose-cjk {
  font-feature-settings: "palt";
  line-height: 1.8;
  letter-spacing: 0.02em;
  word-break: break-all;
  overflow-wrap: break-word;
}

.prose-cjk p {
  text-indent: 0;
  margin-bottom: 1.5em;
}
```

Dark mode 切換邏輯：
- 預設跟隨系統（`prefers-color-scheme`）
- 使用者手動切換後存入 `localStorage`
- 防閃爍：`<script>` 在 `<head>` 中同步設定 `data-theme`

**替代方案**：Tailwind `dark:` class 搭配 `class` 策略。
**選擇理由**：CSS 變數方式更靈活，可以統一管理顏色值，未來擴充主題更方便。

### 5. 前台公開 API

新增不需認證的 API 端點（供前台 SSR/ISR 使用，也可供 client-side 搜尋）：

```
GET /api/posts                    # 文章列表（分頁、篩選）
GET /api/posts/[slug]             # 單篇文章（含 SEO、分類、標籤）
GET /api/categories               # 分類列表（含文章數）
GET /api/categories/[slug]        # 分類詳情（含文章列表）
GET /api/tags                     # 標籤列表（含文章數）
GET /api/tags/[slug]              # 標籤詳情（含文章列表）
GET /api/search?q=keyword         # 搜尋
```

限制：
- 只返回 `PUBLISHED` 狀態的文章
- 不暴露 `authorId`、`passwordHash` 等敏感欄位
- Rate limiting（IP-based，100 req/min）

**替代方案**：直接在 Server Component 中呼叫 service 層，不建 API。
**選擇理由**：前台頁面用 Server Component 直接呼叫 service 層（效能最佳），搜尋頁面用 client-side API（互動需求）。因此只需 `/api/search` 一個公開 API，其餘頁面直接在 Server Component 中查詢。

**修正**：實際設計為 —
- 文章、分類、標籤頁面：Server Component 直接呼叫 service 層（不經 API）
- 搜尋頁面：client-side 透過 `/api/search` 查詢

### 6. 搜尋功能

使用 Prisma 的 `contains` 模式搜尋（title + content）：

```typescript
// src/lib/search.ts
export async function searchPosts(query: string, page: number = 1) {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    skip: (page - 1) * 10,
    include: { category: true, tags: { include: { tag: true } } },
  })
}
```

**替代方案**：PostgreSQL full-text search（`to_tsvector` / `to_tsquery`）。
**選擇理由**：個人部落格文章量不大（< 1000 篇），`contains` 足夠。未來文章量增長時可升級為 full-text search。

### 7. RSS Feed 生成

使用 `feed` 套件生成 RSS 2.0 + Atom：

```typescript
// src/app/feed/route.ts
import { Feed } from 'feed'

export async function GET() {
  const feed = new Feed({
    title: 'NovaScribe',
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'zh-Hant',
    copyright: `© ${new Date().getFullYear()} NovaScribe`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      atom: `${siteUrl}/feed/atom.xml`,
    },
  })

  const posts = await getPublishedPosts()
  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/posts/${post.slug}`,
      link: `${siteUrl}/posts/${post.slug}`,
      description: post.excerpt,
      content: post.content, // 全文
      date: post.publishedAt,
      category: post.category ? [{ name: post.category.name }] : [],
    })
  })

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
```

Feed 路由設定 ISR `revalidate = 3600`（每小時重新生成）。

### 8. 前台元件架構

```
src/components/public/
├── layout/
│   ├── Header.tsx              # 頂部導航（Logo、導航連結、搜尋、Dark mode 切換）
│   ├── Footer.tsx              # 底部（版權、RSS 連結、社交連結）
│   ├── Sidebar.tsx             # 側邊欄（分類列表、標籤雲、熱門文章）
│   └── ThemeToggle.tsx         # Dark mode 切換按鈕
├── article/
│   ├── ArticleCard.tsx         # 文章卡片（首頁列表用）
│   ├── ArticleContent.tsx      # 文章內容（Markdown 渲染結果）
│   ├── ArticleHeader.tsx       # 文章標題區（標題、作者、日期、閱讀時間、分類）
│   ├── ArticleToc.tsx          # 目錄導航（Table of Contents，sticky sidebar）
│   ├── RelatedPosts.tsx        # 相關文章推薦
│   └── ShareButtons.tsx        # 社交分享按鈕
├── common/
│   ├── Pagination.tsx          # 分頁元件
│   ├── TagCloud.tsx            # 標籤雲
│   ├── CategoryList.tsx        # 分類列表
│   ├── SearchBar.tsx           # 搜尋輸入框
│   └── Breadcrumb.tsx          # 麵包屑導航
└── home/
    ├── HeroSection.tsx         # 首頁 Hero 區域
    ├── FeaturedPosts.tsx       # 精選文章
    └── RecentPosts.tsx         # 最新文章
```

### 9. 資料庫新增

無需新增 model。前台所需資料全部來自現有 models（Post、Category、Tag、SeoMetadata）。

需新增公開查詢 service：

```typescript
// src/lib/services/public-post.service.ts
export async function getPublishedPosts(options: {
  page?: number
  limit?: number
  categorySlug?: string
  tagSlug?: string
}) { ... }

export async function getPostBySlug(slug: string) { ... }
export async function getRelatedPosts(postId: string, limit?: number) { ... }
```

### 10. SEO 整合策略

每個前台頁面都使用 `generateMetadata` 動態生成 meta tags：

```typescript
// src/app/(public)/posts/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  const seo = post?.seoMetadata

  return {
    title: seo?.metaTitle || post?.title,
    description: seo?.metaDescription || post?.excerpt,
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || post?.title,
      description: seo?.ogDescription || seo?.metaDescription,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'article',
      publishedTime: post?.publishedAt?.toISOString(),
    },
    twitter: {
      card: seo?.twitterCard || 'summary_large_image',
    },
    alternates: {
      canonical: seo?.canonicalUrl,
    },
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
  }
}
```

同時在文章頁面嵌入 JSON-LD：
- `ArticleJsonLd` — 文章結構化資料
- `BreadcrumbJsonLd` — 麵包屑
- `WebSiteJsonLd` — 網站資訊（首頁）

前台 layout 包含：
- `AnalyticsProvider` — GA4 追蹤
- RSS Auto-discovery `<link>` 標籤

### 11. ISR 快取管理策略

為確保後台文章更新後前台能即時反映，需在後台 CRUD 操作後主動清除 ISR 快取：

```typescript
// src/lib/services/post.service.ts（後台 service）
import { revalidatePath } from 'next/cache'

export async function createPost(data: CreatePostInput) {
  const post = await prisma.post.create({ data })
  
  // 清除首頁快取
  revalidatePath('/')
  // 清除文章頁快取
  revalidatePath(`/posts/${post.slug}`)
  // 清除分類頁快取（如果有分類）
  if (post.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: post.categoryId } })
    if (category) revalidatePath(`/categories/${category.slug}`)
  }
  
  return post
}
```

需清除快取的操作：
- `createPost` → 清除首頁、分類頁
- `updatePost` → 清除文章頁、首頁、舊/新分類頁
- `deletePost` → 清除首頁、分類頁、文章頁（返回 404）
- `updatePostStatus` → 清除文章頁、首頁、分類頁（PUBLISHED ↔ 其他狀態切換）

**替代方案**：使用 webhook 或 cron 定期清除。
**選擇理由**：`revalidatePath()` 精準清除特定路徑，即時性最佳。

## Risks / Trade-offs

### 風險

- **[ISR 快取不一致]** → 文章更新後最多 60 秒才反映。Mitigation：使用 `revalidatePath()` 在後台更新文章時主動清除快取
- **[Shiki bundle size]** → Shiki 支援大量語言，初始 bundle 可能偏大。Mitigation：只載入常用語言（TypeScript、JavaScript、Python、Shell、CSS、HTML、JSON、SQL）
- **[搜尋效能]** → Prisma `contains` 在大量文章時效能下降。Mitigation：文章量 < 1000 篇可接受，未來可升級 PostgreSQL full-text search
- **[Dark mode 閃爍]** → SSR 時不知道使用者偏好。Mitigation：在 `<head>` 注入同步 script 讀取 `localStorage` 防閃爍

### Trade-offs

- **全文 RSS vs 摘要**：全文增加 Feed 大小但提供更好的讀者體驗
- **Server Component 直接查詢 vs API**：效能更好但前後端耦合度高。接受此 trade-off 因為前後端同一專案
- **固定主題 vs 可切換主題**：降低複雜度但限制客製化。個人部落格不需要多主題

## Open Questions

- 無（brainstorming 階段已釐清主要決策）
