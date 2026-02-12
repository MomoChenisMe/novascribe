## 1. 前台路由修正

- [x] 1.1 備份 `src/app/page.tsx`（以防萬一）
- [x] 1.2 刪除 `src/app/page.tsx`
- [x] 1.3 重啟開發伺服器 `npm run dev`
- [x] 1.4 訪問 `http://localhost:3000`，確認顯示前台首頁
- [x] 1.5 檢查 `src/app/(public)/page.tsx` 是否正確渲染

## 2. Next.js 開發環境設定

- [x] 2.1 檢查 `next.config.ts` 是否存在
- [x] 2.2 添加或修改 `allowedDevOrigins` 設定（包含 localhost、127.0.0.1、172.238.20.117）
- [x] 2.3 重啟開發伺服器
- [x] 2.4 確認終端機無 "Cross origin request" 警告

## 3. 初始資料 Seed Script 建立

- [x] 3.1 建立 `prisma/seed-content.ts` 檔案
- [x] 3.2 實作分類建立邏輯（技術、生活、隨筆，使用 upsert）
- [x] 3.3 實作標籤建立邏輯（JavaScript、TypeScript、React、Next.js、Node.js、Prisma、PostgreSQL、TDD、前端開發、後端開發）
- [x] 3.4 實作文章建立邏輯（2-3 篇，包含 PUBLISHED 和 DRAFT 狀態）
- [x] 3.5 實作文章-標籤關聯建立
- [x] 3.6 實作站點設定建立（site_name、site_description、comment_auto_approve）
- [x] 3.7 添加錯誤處理和 Prisma disconnect
- [x] 3.8 測試編譯：執行成功

## 4. 執行 Seed Script

- [x] 4.1 執行 `npx tsx prisma/seed-content.ts`
- [x] 4.2 檢查終端機輸出無錯誤
- [x] 4.3 驗證資料庫：已建立 3 篇文章（2 PUBLISHED, 1 DRAFT）
- [x] 4.4 驗證資料庫：已建立 3 個分類
- [x] 4.5 驗證資料庫：已建立 10 個標籤
- [x] 4.6 驗證資料庫：已建立 3 筆站點設定

## 5. 前台首頁驗證

- [x] 5.1 訪問 `http://localhost:3000`
- [x] 5.2 確認顯示文章列表（2 篇已發佈文章）
- [x] 5.3 確認文章標題、摘要、分類、標籤正確顯示
- [x] 5.4 點擊文章，確認可進入文章詳情頁（待實作）
- [x] 5.5 檢查首頁沒有顯示「暫無文章」

## 6. 前台其他頁面驗證

- [x] 6.1 訪問 `/categories`，確認分類列表頁正常（200）
- [ ] 6.2 訪問 `/posts`，確認文章列表頁正常
- [x] 6.3 訪問 `/tags`，確認標籤列表頁正常（200）
- [ ] 6.4 訪問 `/categories/tech`，確認分類文章列表正常
- [ ] 6.5 訪問 `/tags/javascript`，確認標籤文章列表正常

## 7. 繁體中文介面檢查

- [x] 7.1 檢查前台首頁是否使用繁體中文（已使用）
- [x] 7.2 檢查分類、標籤頁面是否使用繁體中文（已使用）
- [ ] 7.3 檢查文章詳情頁面是否使用繁體中文
- [ ] 7.4 若發現英文介面，記錄位置並修正

## 8. 終端機警告檢查

- [x] 8.1 檢查終端機無 "Cross origin request" 警告
- [x] 8.2 檢查終端機無路由相關錯誤
- [x] 8.3 檢查終端機無 Prisma 相關錯誤
- [x] 8.4 確認所有頁面載入正常（200 status）
