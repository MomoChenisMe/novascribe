## Context

NovaScribe 使用 Prisma 7 並將 Prisma Client 輸出路徑設定為 `src/generated/prisma`。`src/lib/prisma.ts` 目前使用 `new PrismaClient()` 初始化，但在登入流程中出現 PrismaClientInitializationError，表示 Prisma Client 無法正確初始化。

### 現有架構

- **Prisma schema**：`prisma/schema.prisma`
- **Prisma Client 輸出**：`generator client { output = "../src/generated/prisma" }`
- **Prisma Client 使用位置**：`src/lib/prisma.ts`
- **認證流程**：`src/lib/auth.ts` → `src/app/api/auth/[...nextauth]/route.ts`

### 問題症狀

- 登入後顯示「帳號密碼錯誤」
- 轉址至 `/api/auth/error`
- 錯誤：`PrismaClientInitializationError`（constructor 需要有效 options）

## Goals / Non-Goals

**Goals:**
- 修正 Prisma Client 初始化錯誤
- 確保 NextAuth.js 登入流程可正常使用 Prisma
- 確保所有 API 路由可以正確連線資料庫

**Non-Goals:**
- 修改 Prisma schema
- 重構認證邏輯
- 更換資料庫或 ORM

## Decisions

### 1. Prisma Client 初始化修正

**問題**：Prisma Client 無法正確初始化，可能原因：
1. 生成的 Prisma Client 不符合預期（ESM/CJS 問題）
2. Prisma Client 未正確載入環境變數
3. Prisma Client output 路徑導致 import 錯誤

**決策**：
- 明確指定 Prisma Client 初始化 options：
  ```ts
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })
  ```
- 若 `DATABASE_URL` 不存在，拋出明確錯誤

**替代方案**：
- 使用預設 `new PrismaClient()`（目前失敗）
- 修改 Prisma Client output 回預設 `node_modules/.prisma/client`

**選擇理由**：
- 確保資料庫連線字串正確載入
- 明確指定 options，避免 Prisma 版本差異造成初始化失敗

### 2. Prisma Client import 路徑確認

**問題**：`src/lib/prisma.ts` 使用 `@/generated/prisma/client` import，但該路徑可能對應到 TS 檔案而非 JS。

**決策**：
- 使用相對路徑 import：`import { PrismaClient } from '@/generated/prisma/client'`
- 確保 prisma generate 後檔案存在

**若仍有問題**：
- 改用 `@prisma/client`（預設輸出）
- 或調整 Prisma generator output 回預設路徑

### 3. 環境變數載入

**問題**：`DATABASE_URL` 可能未正確載入（Prisma config 依賴 `.env`）

**決策**：
- 在 `src/lib/prisma.ts` 初始化時加入檢查
- 若無 `DATABASE_URL`，拋出 `Error("DATABASE_URL is missing")`

## Implementation Notes

### 修改 `src/lib/prisma.ts`

**修改前**：
```ts
import { PrismaClient } from '@/generated/prisma/client';

function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}
```

**修改後**：
```ts
import { PrismaClient } from '@/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing');
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  });
}
```

### 測試驗證

1. 重啟開發伺服器
2. 訪問 `/login`
3. 使用 admin 帳號登入
4. 確認不再跳轉 `/api/auth/error`
5. 確認 API 回應正常

## Risks

**風險 1**：指定 `datasourceUrl` 可能與 Prisma config 衝突
- **緩解**：使用相同的 `DATABASE_URL`，應該與 Prisma config 一致

**風險 2**：Prisma Client output 路徑問題
- **緩解**：若 `@/generated/prisma/client` 無法使用，改用 `@prisma/client`
- **備案**：將 Prisma generator output 改回預設
