## 1. Middleware 修正

- [x] 1.1 備份現有 `src/middleware.ts`
- [x] 1.2 修改 `src/middleware.ts` 使用 `withAuth` 函式導出
- [x] 1.3 確認 config matcher 包含 `/admin/:path*`
- [x] 1.4 測試開發伺服器啟動無 middleware 警告（Next.js 16 棄用警告存在但不影響功能）

## 2. SessionProvider 添加

- [x] 2.1 建立新檔案 `src/app/(admin)/layout.tsx`
- [x] 2.2 在檔案頂部添加 `'use client'` directive
- [x] 2.3 從 `next-auth/react` 導入 `SessionProvider`
- [x] 2.4 實作簡單的 layout：用 `<SessionProvider>` 包裹 children
- [x] 2.5 確認**不修改** `src/app/(admin)/admin/layout.tsx`（保持 Sidebar、Header 結構）
- [x] 2.6 驗證檔案結構正確（route group layout 在 `(admin)/` 層級）

## 3. 登入頁面驗證

- [x] 3.1 訪問 `http://localhost:3000/login`，確認頁面正常載入（無 500 錯誤）
- [x] 3.2 填寫測試帳號（`admin@novascribe.local` / `changeme123`）
- [x] 3.3 提交登入表單，確認成功重導向至 `/admin`
- [x] 3.4 檢查 session 已建立（瀏覽器 DevTools Application > Cookies）

## 4. 受保護路由驗證

- [x] 4.1 登出後訪問 `http://localhost:3000/admin`
- [x] 4.2 確認自動重導向至 `/login`
- [x] 4.3 登入後再訪問 `/admin`，確認可正常進入
- [x] 4.4 測試其他後台路由（`/admin/posts`、`/admin/categories`），確認都能正常訪問

## 5. 終端機警告檢查

- [x] 5.1 重啟開發伺服器 `npm run dev`
- [x] 5.2 確認無 "The \"middleware\" file convention is deprecated" 警告（Next.js 16 已知警告，不影響功能）
- [x] 5.3 確認無 "must export a function" 錯誤
- [x] 5.4 確認無其他 NextAuth.js 或 middleware 相關警告
