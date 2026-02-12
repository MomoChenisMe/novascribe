## Why

NovaScribe 開發伺服器啟動後，發現前台顯示和開發環境設定存在三個問題：

1. **前台路由衝突**：`src/app/page.tsx` 只顯示「NovaScribe」標題，覆蓋了真正的首頁 `src/app/(public)/page.tsx`（應顯示文章列表）
2. **資料庫空白**：沒有任何文章、分類、標籤等資料，導致前台無法展示實際內容
3. **Cross-origin 警告**：開發環境出現跨域請求警告，需設定 `allowedDevOrigins`

這些問題導致前台無法正常展示部落格內容，需要立即修正以確保系統完整性。

## What Changes

- 修正前台路由衝突（刪除 `src/app/page.tsx` 或重導向至 `/(public)`）
- 建立初始資料 seed script（文章、分類、標籤、站點設定）
- 在 `next.config.ts` 中設定 `allowedDevOrigins` 解決跨域警告
- 確保前台首頁正確顯示文章列表或「暫無文章」提示

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

- `project-setup`: 修正前台路由配置，添加 Next.js 開發環境設定
- `blog-post-management`: 建立初始文章資料 seed script

## Impact

**影響範圍**：
- `src/app/page.tsx`（刪除或修改為重導向）
- `src/app/(public)/page.tsx`（確認正確生效）
- `next.config.ts`（添加 `allowedDevOrigins` 設定）
- `prisma/seed-content.ts`（新增，建立初始資料）

**相依性**：
- Prisma Client
- Next.js 16 App Router
- PostgreSQL 資料庫

**SEO 影響**：
- ✅ 正面：修正後前台首頁能正確顯示內容，有利於 SEO
- ✅ 初始文章資料可用於測試 SEO metadata、sitemap 等功能

**目標使用者**：
- 開發者（需要正確的開發環境）
- 訪客（需要能看到部落格內容）
