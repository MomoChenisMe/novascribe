## Why

NovaScribe 開發伺服器啟動後發現兩個關鍵問題阻礙後台管理功能運作：

1. **Next.js 16 Middleware 棄用警告**：`src/middleware.ts` 使用舊的 middleware 慣例，Next.js 16 要求改用 `proxy` 或確保正確的函式導出。
2. **SessionProvider 缺失**：後台登入頁面（`/login`）因缺少 `<SessionProvider>` 包裹而無法使用 NextAuth.js `useSession` hook，導致 500 錯誤。

需要立即修復這兩個問題以確保後台管理系統（文章、分類、標籤、評論管理）可正常運作。

## What Changes

- 修正 `src/middleware.ts` 導出方式，確保符合 Next.js 16 規範
- 在後台 layout（`src/app/(admin)/layout.tsx`）中添加 `<SessionProvider>` 包裹所有後台頁面
- 驗證登入流程正常（`/login` 頁面可正常顯示並提交登入請求）
- 驗證受保護路由正常（未登入訪問 `/admin` 應重導向至 `/login`）

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

- `authentication`: 修正 SessionProvider 包裹問題，確保後台所有頁面都能正確使用 NextAuth.js session
- `project-setup`: 修正 middleware 導出問題，符合 Next.js 16 規範

## Impact

**影響範圍**：
- `src/middleware.ts`（修正導出）
- `src/app/(admin)/layout.tsx`（添加 SessionProvider）
- 所有後台頁面（`/admin/*`、`/login`）的認證功能

**相依性**：
- Next.js 16 App Router
- NextAuth.js v4
- React 19

**SEO 影響**：
- 無（後台頁面不應被搜尋引擎索引）

**目標使用者**：
- 部落格管理員（使用後台管理系統的使用者）
