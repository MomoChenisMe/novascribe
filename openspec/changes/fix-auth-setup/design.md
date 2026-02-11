## Context

NovaScribe 是使用 Next.js 16 App Router + NextAuth.js v4 建構的部落格系統。目前開發伺服器已成功啟動，但發現兩個認證相關問題導致後台無法正常運作：

1. `src/middleware.ts` 觸發 Next.js 16 警告，要求改用 `proxy` 或確保正確的函式導出
2. 後台登入頁面因缺少 `<SessionProvider>` 而無法使用 `useSession` hook

### 現有架構

- **認證機制**：NextAuth.js v4 + JWT session 策略
- **認證配置**：`src/lib/auth.ts` 定義 `authOptions`
- **Middleware**：`src/middleware.ts` 用於保護 `/admin/*` 路由
- **後台 Layout**：`src/app/(admin)/layout.tsx`
- **登入頁面**：`src/app/(admin)/login/page.tsx`（使用 `useSession` hook）

### 約束條件

- Next.js 16.1.6（App Router）
- NextAuth.js v4.24.13
- React 19.2.3
- 不可變更既有的認證流程（Credentials Provider + bcrypt）
- 不可引入新的外部依賴

## Goals / Non-Goals

**Goals:**
- 修正 middleware 導出問題，消除 Next.js 16 警告
- 在後台 layout 中添加 `<SessionProvider>`，確保所有後台頁面都能使用 NextAuth.js hooks
- 確保登入流程正常運作（顯示登入頁面、提交表單、session 建立、重導向）
- 確保受保護路由正常運作（未登入訪問 `/admin` 重導向至 `/login`）

**Non-Goals:**
- 重構認證機制（保持現有 Credentials Provider）
- 修改 `authOptions` 配置
- 添加 OAuth 登入（如 GitHub、Google）
- 修改前台路由或頁面

## Decisions

### 1. Middleware 導出修正

**問題**：`src/middleware.ts` 觸發警告，Next.js 16 要求導出函式（而非 config 物件）。

**檢查現況**：
```typescript
// src/middleware.ts 目前可能的狀態
export { default } from 'next-auth/middleware';
export const config = { matcher: ['/admin/:path*'] };
```

**決策**：改為明確的函式導出

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

**替代方案**：
- 使用 Next.js 16 的 `proxy.ts`（棄用，需大幅重構）
- 在 `next.config.js` 中配置 rewrites（過於複雜）

**選擇理由**：`withAuth` 是 NextAuth.js 官方推薦的 middleware 包裝函式，符合 Next.js 16 要求，且無需引入新依賴。

### 2. SessionProvider 添加位置

**問題**：後台頁面使用 `useSession` hook 但缺少 `<SessionProvider>` 包裹。

**決策**：**建立新的** `src/app/(admin)/layout.tsx` 包裹整個 route group

**重要發現**：
- 現有結構：`src/app/(admin)/admin/layout.tsx` 只包裹 `/admin/*` 路由
- 登入頁面在：`src/app/(admin)/login/page.tsx`（不在 `admin/` 內）
- 問題：login 頁面不在現有 layout 的包裹範圍內

**正確的路由結構**：
```
src/app/(admin)/
  ├── layout.tsx           ← 新建立，包裹整個 (admin) group
  ├── login/
  │   └── page.tsx         ← 受 (admin)/layout.tsx 包裹
  └── admin/
      ├── layout.tsx       ← 現有，包裹後台管理區域（Sidebar、Header）
      └── ...
```

**實作位置**：
```tsx
// src/app/(admin)/layout.tsx（新檔案）
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

**替代方案**：
- 在 root layout（`src/app/layout.tsx`）添加 SessionProvider（影響前台）
- 在每個需要 session 的頁面單獨包裹（重複且易遺漏）
- 將 login 移到 `admin/` 內（破壞現有結構）

**選擇理由**：
- 只影響 `(admin)` route group，不干擾前台
- 所有 `/admin/*` 和 `/login` 路由自動繼承
- 符合 Next.js App Router 的 layout 巢狀結構
- 保持現有的 `admin/layout.tsx`（Sidebar、Header）不變

### 3. Client Component 標記

**問題**：`SessionProvider` 需要在 Client Component 中使用。

**決策**：在後台 layout 頂部添加 `'use client'` directive

**影響**：
- 後台 layout 及其所有子元件轉為 Client Component
- 對後台功能（互動性高）影響小
- Server Component 功能（如 async/await、直接資料庫查詢）在後台 layout 中不可用

**補償措施**：
- 資料獲取改用 API routes（`/api/admin/*`）
- 使用 `useEffect` + `fetch` 或 React Query 進行資料載入

### 4. 登入頁面改進（可選）

**問題**：登入頁面目前使用 `useSession`，但實際上只需要檢查是否已登入以重導向。

**決策**：保持現有實作，不做額外改動

**原因**：
- `useSession` 在 SessionProvider 包裹下已可正常運作
- 登入流程已完整（表單提交 → `signIn()` → 重導向）
- 避免過度改動增加風險

## Architecture

### 認證流程圖

```
使用者訪問 /admin
    ↓
Middleware 檢查 session (withAuth)
    ↓ (無 session)
重導向至 /login
    ↓
登入頁面載入 (包裹在 SessionProvider 中)
    ↓
使用者輸入帳號密碼 → signIn()
    ↓
NextAuth.js 驗證 (authOptions)
    ↓ (成功)
建立 JWT session
    ↓
重導向至 /admin
    ↓
Middleware 檢查 session (通過)
    ↓
後台頁面載入 (可使用 useSession)
```

### 檔案變更

**新增檔案**：
1. `src/app/(admin)/layout.tsx`：Route group layout，包裹 SessionProvider

**修改檔案**：
1. `src/middleware.ts`：改用 `withAuth` 函式導出

**保持不變**：
1. `src/app/(admin)/admin/layout.tsx`：現有的後台管理 layout（Sidebar、Header）

## Implementation Notes

### Middleware 修正

**修改前**：
```typescript
// src/middleware.ts
export { default } from 'next-auth/middleware';
export const config = { matcher: ['/admin/:path*'] };
```

**修改後**：
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

### SessionProvider 添加

**建立前**：
```
src/app/(admin)/
  ├── login/page.tsx     ← 無 SessionProvider 包裹
  └── admin/
      ├── layout.tsx     ← 現有 layout（Sidebar、Header）
      └── ...
```

**建立後**：
```
src/app/(admin)/
  ├── layout.tsx         ← 新建立，包裹 SessionProvider
  ├── login/page.tsx     ← 受新 layout 包裹
  └── admin/
      ├── layout.tsx     ← 保持不變
      └── ...
```

**新建立檔案**：
```tsx
// src/app/(admin)/layout.tsx（新檔案）
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

**重要**：
- 這是**新檔案**，不是修改現有的 `admin/layout.tsx`
- 保持 `admin/layout.tsx` 不變（Sidebar、Header 邏輯）
- 新 layout 只負責提供 SessionProvider

### 測試驗證

**手動測試**：
1. 啟動開發伺服器 `npm run dev`
2. 訪問 `http://localhost:3000/login`，確認頁面正常載入（無 500 錯誤）
3. 填寫帳號密碼（`admin@novascribe.local` / `changeme123`）並登入
4. 確認成功重導向至 `/admin`
5. 訪問 `http://localhost:3000/admin`（未登入狀態），確認重導向至 `/login`
6. 檢查終端機無 Next.js middleware 警告訊息

**自動化測試**（可選）：
- 撰寫 E2E 測試（Playwright）驗證登入流程
- 撰寫 middleware 測試驗證重導向邏輯

## Risks

**風險 1**：`'use client'` 轉換可能破壞現有 Server Component 功能
- **影響**：中
- **緩解**：後台 layout 目前未使用 async/await 或 Server Component 特性
- **備案**：若有問題，將 SessionProvider 下移至個別需要的頁面

**風險 2**：Middleware 修改可能影響路由保護
- **影響**：高
- **緩解**：`withAuth` 是 NextAuth.js 官方推薦方式，行為與現有一致
- **備案**：若有問題，回退至原始實作並改用 Next.js 16 `proxy.ts`

**風險 3**：登入流程中斷
- **影響**：高
- **緩解**：不修改 `authOptions` 和登入表單邏輯，只添加 SessionProvider 包裹
- **備案**：若有問題，檢查 SessionProvider 是否正確包裹，確認 NextAuth.js 版本相容性
