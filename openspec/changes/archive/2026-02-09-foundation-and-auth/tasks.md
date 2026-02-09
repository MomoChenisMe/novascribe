## 1. 專案初始化與開發工具設定

- [x] 1.1 撰寫專案初始化測試（驗證 Next.js App Router 結構、TypeScript 嚴格模式、`src/` 目錄結構）
- [x] 1.2 初始化 Next.js 專案（App Router + TypeScript + `src/` 目錄）
- [x] 1.3 撰寫 Tailwind CSS 整合測試（驗證樣式正確套用）
- [x] 1.4 設定 Tailwind CSS 並配置自訂設計 token（色彩主題、字型）
- [x] 1.5 設定 ESLint 規則並新增 `lint` script
- [x] 1.6 設定 Prettier 並新增 `format` script
- [x] 1.7 建立 `.editorconfig` 檔案
- [x] 1.8 設定 Jest + React Testing Library 並驗證測試可執行
- [x] 1.9 設定 Playwright 並驗證 E2E 測試可執行
- [x] 1.10 設定測試覆蓋率報告（`test:coverage` script，目標 80%）

## 2. 資料庫設定與 Users Schema

- [x] 2.1 撰寫 Prisma Client singleton 單元測試
- [x] 2.2 設定 Prisma ORM 並建立 `prisma/schema.prisma`（PostgreSQL 18 連線）
- [x] 2.3 實作 Prisma Client singleton（`src/lib/prisma.ts`）
- [x] 2.4 撰寫 Users 資料表結構驗證測試（欄位、索引、約束）
- [x] 2.5 定義 User model 並建立初始 migration（id、email、name、passwordHash、createdAt、updatedAt）
- [x] 2.6 撰寫 email 唯一性約束測試
- [x] 2.7 驗證 email 唯一性約束正常運作
- [x] 2.8 撰寫密碼雜湊工具函式測試（bcrypt 10+ rounds、明文不被記錄）
- [x] 2.9 實作密碼雜湊工具函式（`src/lib/password.ts`）
- [x] 2.10 撰寫種子資料腳本測試（建立管理者、upsert 可重複執行）
- [x] 2.11 實作種子資料腳本（`prisma/seed.ts`）

## 3. 認證系統

- [x] 3.1 撰寫 NextAuth.js 設定測試（Credentials Provider、JWT session 策略）
- [x] 3.2 設定 NextAuth.js（`src/lib/auth.ts` + `/api/auth/[...nextauth]/route.ts`）
- [x] 3.3 撰寫登入驗證邏輯單元測試（正確帳密→成功、錯誤密碼→失敗、不存在帳號→失敗、空白欄位→失敗）
- [x] 3.4 實作 authorize 函式（email/密碼驗證、bcrypt 比對）
- [x] 3.5 撰寫 JWT session 管理測試（token 包含 userId/email、24 小時過期、自動刷新）
- [x] 3.6 設定 JWT session 相關參數（過期時間、callback）
- [x] 3.7 撰寫登入速率限制測試（5 次失敗鎖定 15 分鐘、鎖定期滿恢復、HTTP 429 回應）
- [x] 3.8 實作登入速率限制機制（基於 IP 的 in-memory rate limiter）
- [x] 3.9 撰寫 middleware 路由保護測試（未認證→重新導向 `/login`、已認證→放行、API 401）
- [x] 3.10 實作 Next.js middleware 路由保護（`src/middleware.ts`，matcher: `/admin/:path*`）

## 4. 登入頁面

- [x] 4.1 撰寫登入頁面元件測試（表單渲染、欄位驗證、錯誤訊息顯示、載入狀態）
- [x] 4.2 實作登入頁面（`src/app/(admin)/login/page.tsx`，email/密碼表單）
- [x] 4.3 撰寫登入成功導向測試（登入後重新導向至 `/admin`）
- [x] 4.4 撰寫已登入使用者存取登入頁測試（自動導向 `/admin`）
- [x] 4.5 實作已登入使用者的登入頁重新導向邏輯
- [x] 4.6 撰寫登出功能測試（清除 session、導向登入頁）
- [x] 4.7 實作登出功能

## 5. 後台佈局

- [x] 5.1 撰寫後台佈局元件測試（三區域結構：側邊欄、頂部列、主內容區）
- [x] 5.2 實作後台佈局元件（`src/app/(admin)/admin/layout.tsx`）
- [x] 5.3 撰寫側邊欄元件測試（導覽項目渲染、當前頁面高亮、收合/展開）
- [x] 5.4 實作側邊欄元件（`src/components/admin/Sidebar.tsx`）
- [x] 5.5 撰寫頂部列元件測試（使用者資訊顯示、登出按鈕）
- [x] 5.6 實作頂部列元件（`src/components/admin/Header.tsx`）
- [x] 5.7 撰寫響應式佈局測試（桌面固定側邊欄、平板收合、手機漢堡選單）
- [x] 5.8 實作響應式佈局邏輯（Tailwind 斷點 + 狀態管理）
- [x] 5.9 撰寫後台首頁測試（歡迎訊息、系統資訊顯示）
- [x] 5.10 實作後台首頁（`src/app/(admin)/admin/page.tsx`）

## 6. E2E 測試與整合驗證

- [x] 6.1 撰寫登入流程 E2E 測試（成功登入→進入後台→登出→回到登入頁）
- [x] 6.2 撰寫未認證存取 E2E 測試（直接存取 `/admin`→重新導向登入頁）
- [x] 6.3 撰寫後台導覽 E2E 測試（側邊欄點擊→頁面切換→高亮更新）
- [x] 6.4 撰寫響應式 E2E 測試（不同視窗寬度下佈局正確切換）
- [x] 6.5 執行全部測試並確認覆蓋率 ≥ 80%
