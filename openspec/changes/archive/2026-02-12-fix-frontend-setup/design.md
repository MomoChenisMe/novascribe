## Context

NovaScribe 是使用 Next.js 16 App Router 建構的部落格系統。開發伺服器已成功啟動，認證系統運作正常，但前台顯示和開發環境設定存在問題需要修正。

### 現有架構

- **前台路由**：
  - `src/app/page.tsx`：根路由（目前只顯示標題）
  - `src/app/(public)/page.tsx`：公開首頁（文章列表，但被覆蓋）
  - Route group `(public)` 包含所有前台頁面
  
- **資料模型**：
  - Post、Category、Tag、PostTag 已定義在 Prisma schema
  - 資料庫已建立但無資料
  
- **Next.js 配置**：
  - `next.config.ts` 存在但可能缺少開發環境設定

### 約束條件

- Next.js 16.1.6（App Router）
- Prisma 7.3.0 + PostgreSQL 18
- 不可變更既有的路由結構（保持 route group）
- 不可引入新的外部依賴

## Goals / Non-Goals

**Goals:**
- 修正前台路由衝突，確保 `(public)` route group 的首頁正確顯示
- 建立初始資料（1-3 篇測試文章、2-3 個分類、5-10 個標籤、基本站點設定）
- 解決 Cross-origin 警告，設定 `allowedDevOrigins`
- 確保前台首頁能正確載入並顯示文章列表或「暫無文章」提示

**Non-Goals:**
- 重新設計首頁 UI（保持現有實作）
- 建立大量文章資料（只需少量測試資料）
- 修改 Prisma schema（保持現有結構）
- 處理生產環境的跨域問題（只處理開發環境）

## Decisions

### 1. 前台路由衝突修正

**問題**：Next.js App Router 中，`src/app/page.tsx` 優先於 `src/app/(public)/page.tsx`，導致 route group 的首頁無法生效。

**檢查現況**：
```typescript
// src/app/page.tsx（目前）
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">NovaScribe</h1>
    </main>
  );
}
```

**決策 1：刪除 `src/app/page.tsx`**（建議）

讓 `src/app/(public)/page.tsx` 自動成為根路由。

**優點**：
- ✅ 最簡單直接
- ✅ 符合 Next.js route group 慣例
- ✅ 無需額外的重導向邏輯

**缺點**：
- ⚠️ 刪除檔案（但此檔案只是 placeholder）

**決策 2：修改為重導向**（替代方案）

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/');
}
```

**優點**：
- ✅ 保留檔案（明確的重導向邏輯）

**缺點**：
- ⚠️ 會導致 redirect loop（`/` → `/` 無限循環）
- ❌ 不可行

**最終決策**：**刪除 `src/app/page.tsx`**

讓 route group 的 page 自然生效。

### 2. 初始資料建立策略

**問題**：資料庫是空的，無法測試和展示部落格功能。

**決策**：建立獨立的 seed script `prisma/seed-content.ts`

**資料內容**：
- **文章**：2-3 篇（包含不同狀態：PUBLISHED、DRAFT）
- **分類**：2-3 個（技術、生活、隨筆）
- **標籤**：5-10 個（JavaScript、TypeScript、React、Next.js 等）
- **站點設定**：基本設定（站點名稱、描述、自動核准評論等）

**實作方式**：
```typescript
// prisma/seed-content.ts
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function seedContent() {
  // 1. 建立分類
  const categoryTech = await prisma.category.upsert({
    where: { slug: 'tech' },
    create: {
      name: '技術',
      slug: 'tech',
      description: '技術文章',
    },
    update: {},
  });

  // 2. 建立標籤
  const tagJS = await prisma.tag.upsert({
    where: { slug: 'javascript' },
    create: {
      name: 'JavaScript',
      slug: 'javascript',
    },
    update: {},
  });

  // 3. 建立文章（含 slug、content、publishedAt）
  const post = await prisma.post.upsert({
    where: { slug: 'welcome-to-novascribe' },
    create: {
      title: '歡迎來到 NovaScribe',
      slug: 'welcome-to-novascribe',
      excerpt: 'NovaScribe 個人部落格系統正式上線！',
      content: '# 歡迎\n\n這是第一篇文章...',
      status: 'PUBLISHED',
      categoryId: categoryTech.id,
      publishedAt: new Date(),
    },
    update: {},
  });

  // 4. 關聯標籤
  await prisma.postTag.create({
    data: {
      postId: post.id,
      tagId: tagJS.id,
    },
  });

  // 5. 建立站點設定
  await prisma.siteSetting.upsert({
    where: { key: 'site_name' },
    create: {
      key: 'site_name',
      value: 'NovaScribe',
      type: 'STRING',
    },
    update: {},
  });
}

seedContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**執行方式**：
```bash
npx tsx prisma/seed-content.ts
```

**替代方案**：
- 在既有的 `prisma/seed.ts` 中添加內容資料（但會混合 user 和 content seed）

**選擇理由**：
- 分離關注點（user seed vs content seed）
- 可獨立執行、重複執行（upsert 確保冪等性）

### 3. Cross-origin 設定

**問題**：開發環境出現警告：
```
Cross origin request detected from 172.238.20.117 to /_next/* resource.
```

**決策**：在 `next.config.ts` 中添加 `allowedDevOrigins`

**實作**：
```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 開發環境允許的來源
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '172.238.20.117', // VPS 內網 IP
  ],
  
  // ... 其他設定
};

export default nextConfig;
```

**替代方案**：
- 忽略警告（不影響功能，但日誌會很煩）
- 使用 `experimental.allowedDevOrigins`（可能在未來版本棄用）

**選擇理由**：
- 官方推薦的解決方案
- 明確允許內網 IP，避免未來版本阻擋請求

### 4. 前台首頁改進（可選）

**問題**：`src/app/(public)/page.tsx` 目前只顯示「首頁內容稍後實作」。

**決策**：保持現有實作，不做額外改動

**原因**：
- 前台首頁已有完整的 metadata 和結構
- 文章列表功能已在 design 中規劃（`public-frontend` change 應該已實作）
- 避免過度改動增加風險

**補充**：若發現首頁確實缺少文章列表，可在 tasks 中添加簡單的實作。

## Architecture

### 檔案結構變更

**刪除**：
- `src/app/page.tsx`（根路由 placeholder）

**新增**：
- `prisma/seed-content.ts`（初始資料 seed script）

**修改**：
- `next.config.ts`（添加 `allowedDevOrigins`）

### 路由結構（修正後）

```
/                        → src/app/(public)/page.tsx（首頁）
/posts                   → src/app/(public)/posts/page.tsx
/posts/[slug]            → src/app/(public)/posts/[slug]/page.tsx
/categories              → src/app/(public)/categories/page.tsx
/categories/[slug]       → src/app/(public)/categories/[slug]/page.tsx
/tags                    → src/app/(public)/tags/page.tsx
/tags/[slug]             → src/app/(public)/tags/[slug]/page.tsx
/about                   → src/app/(public)/about/page.tsx
/search                  → src/app/(public)/search/page.tsx

/login                   → src/app/(admin)/login/page.tsx
/admin                   → src/app/(admin)/admin/page.tsx
/admin/posts             → src/app/(admin)/admin/posts/page.tsx
...
```

### 初始資料結構

**分類**（2-3 個）：
- 技術（tech）
- 生活（life）
- 隨筆（random）

**標籤**（5-10 個）：
- JavaScript
- TypeScript
- React
- Next.js
- Node.js
- Prisma
- PostgreSQL
- TDD
- 前端開發
- 後端開發

**文章**（2-3 篇）：
1. **歡迎來到 NovaScribe**（PUBLISHED）
   - 分類：技術
   - 標籤：Next.js、React
   - 內容：介紹 NovaScribe 系統
   
2. **NovaScribe 功能介紹**（PUBLISHED）
   - 分類：技術
   - 標籤：TypeScript、Prisma、PostgreSQL
   - 內容：介紹技術棧和功能
   
3. **開發日誌 - 初始設定**（DRAFT）
   - 分類：隨筆
   - 標籤：開發日誌
   - 內容：記錄初始設定過程

**站點設定**：
- `site_name`: NovaScribe
- `site_description`: 個人技術部落格，分享程式開發與實作經驗
- `comment_auto_approve`: false（評論需審核）

## Implementation Notes

### 1. 刪除根路由 placeholder

**Before**：
```
src/app/page.tsx（存在，顯示標題）
src/app/(public)/page.tsx（被覆蓋）
```

**After**：
```
src/app/page.tsx（已刪除）
src/app/(public)/page.tsx（生效，成為根路由）
```

### 2. 建立 seed-content.ts

需要處理的資料表：
- `categories`
- `tags`
- `posts`
- `post_tags`（關聯表）
- `site_settings`

使用 `upsert` 確保可重複執行：
```typescript
await prisma.category.upsert({
  where: { slug: 'tech' },
  create: { /* ... */ },
  update: {}, // 空物件，不更新
});
```

### 3. Next.js 設定更新

檢查 `next.config.ts` 是否存在，若不存在則建立：
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '172.238.20.117',
  ],
};

export default nextConfig;
```

若已存在，則添加 `allowedDevOrigins` 欄位。

### 4. 測試驗證

**手動測試**：
1. 刪除 `src/app/page.tsx` 後，訪問 `http://localhost:3000`
2. 確認顯示文章列表（或「暫無文章」提示）
3. 執行 `npx tsx prisma/seed-content.ts`
4. 重新整理首頁，確認顯示 2-3 篇文章
5. 檢查終端機無 cross-origin 警告

**資料驗證**：
```sql
SELECT COUNT(*) FROM posts;      -- 應該有 2-3 則
SELECT COUNT(*) FROM categories; -- 應該有 2-3 個
SELECT COUNT(*) FROM tags;       -- 應該有 5-10 個
```

## Risks

**風險 1**：刪除 `src/app/page.tsx` 可能破壞路由
- **影響**：中
- **緩解**：`(public)` route group 的 page 會自動生效（Next.js 設計如此）
- **備案**：若有問題，恢復檔案並改用 middleware 重導向

**風險 2**：seed script 可能與既有資料衝突
- **影響**：低
- **緩解**：使用 `upsert` 而非 `create`，確保冪等性
- **備案**：若有問題，手動刪除資料並重新執行

**風險 3**：`allowedDevOrigins` 設定錯誤可能阻擋請求
- **影響**：低
- **緩解**：只在開發環境生效，不影響生產環境
- **備案**：若有問題，移除此設定（警告會回來但不影響功能）

**風險 4**：前台首頁可能缺少文章列表實作
- **影響**：中
- **緩解**：檢查 `src/app/(public)/page.tsx` 實作，若缺少則簡單補上
- **備案**：若 `public-frontend` change 已實作，無需額外處理
