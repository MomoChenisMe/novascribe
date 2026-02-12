## 1. Prisma Client 初始化修正

- [x] 1.1 檢查 `src/lib/prisma.ts` 現有初始化方式
- [x] 1.2 添加 `DATABASE_URL` 檢查（若缺少則拋錯）
- [x] 1.3 使用 `new PrismaClient({ adapter })` 初始化（Prisma 7 使用 adapter）
- [x] 1.4 確認 import 路徑正確（`@/generated/prisma/client`）
- [x] 1.5 安裝 `@prisma/adapter-pg` 和 `pg`（Prisma 7 必要）

## 2. Prisma Client 生成與驗證

- [x] 2.1 執行 `npx prisma generate`
- [x] 2.2 確認 `src/generated/prisma` 內容完整
- [x] 2.3 重啟開發伺服器

## 3. 登入流程驗證

- [x] 3.1 訪問 `/login` 頁面，確認顯示正常（200）
- [x] 3.2 使用 admin 帳號登入（`admin@novascribe.local` / `changeme123`）
- [x] 3.3 確認不再跳轉 `/api/auth/error`（302 正常重導向）
- [x] 3.4 確認登入後可進入 `/admin`（登入成功）

## 4. API 連線驗證

- [x] 4.1 測試 `/api/auth/session` 回傳 200
- [x] 4.2 測試 `/api/auth/providers` 回傳 200
- [x] 4.3 測試 `/api/admin/comments/stats` 回傳 200（需登入），回應 `{"total":0,"pending":0,"approved":0,"spam":0,"deleted":0}`

## 5. 錯誤日誌檢查

- [x] 5.1 確認終端機無 PrismaClientInitializationError
- [x] 5.2 確認終端機無其他 Prisma 相關錯誤
