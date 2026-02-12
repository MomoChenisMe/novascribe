## Why

登入後台時出現 PrismaClientInitializationError，導致 NextAuth.js 登入流程失敗並跳轉至 `/api/auth/error`。錯誤訊息顯示 PrismaClient 需要有效的 PrismaClientOptions，但目前使用 `new PrismaClient()` 初始化時失敗。

需要修正 Prisma Client 初始化流程，確保認證相關 API 可以正常連線資料庫並完成登入。

## What Changes

- 修正 `src/lib/prisma.ts` 的 PrismaClient 初始化方式
- 確認 Prisma Client 指向正確的生成路徑（`src/generated/prisma`）
- 確保 `DATABASE_URL` 環境變數正確載入
- 驗證 NextAuth.js 登入流程可正常運作

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

- `database-setup`: 修正 Prisma Client 初始化流程
- `authentication`: 修正登入流程中的 Prisma 連線錯誤

## Impact

**影響範圍**：
- `src/lib/prisma.ts`（Prisma Client 初始化）
- `src/lib/auth.ts`（登入時依賴 Prisma）
- `/api/auth/*` API 路由（NextAuth.js）

**相依性**：
- Prisma Client 7.x
- NextAuth.js v4
- PostgreSQL 18

**SEO 影響**：
- 無（後台認證流程）

**目標使用者**：
- 部落格管理員（後台登入）
