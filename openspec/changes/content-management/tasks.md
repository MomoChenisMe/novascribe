## 1. 資料庫 Schema 與 Migration

- [ ] 1.1 撰寫 Prisma schema 測試：驗證 Post、PostVersion、Category、Tag、PostTag、Media model 的欄位定義和關聯正確
- [ ] 1.2 更新 `prisma/schema.prisma`：新增 PostStatus enum、Post、PostVersion、Category、Tag、PostTag、Media model
- [ ] 1.3 執行 `prisma migrate dev` 產生並套用 migration
- [ ] 1.4 撰寫 seed 腳本測試：驗證測試資料可正確建立
- [ ] 1.5 建立 seed 腳本：新增範例分類、標籤、文章資料

## 2. 共用工具函式

- [ ] 2.1 撰寫 slug 生成函式測試：中文轉拼音、英文轉換、特殊字元處理、slug 去重
- [ ] 2.2 實作 `src/lib/slug.ts`：slug 自動生成與去重函式
- [ ] 2.3 撰寫分頁工具函式測試：分頁參數驗證、offset 計算、回傳格式
- [ ] 2.4 實作 `src/lib/pagination.ts`：分頁查詢參數解析與回傳格式工具
- [ ] 2.5 撰寫驗證工具函式測試：文章、分類、標籤的輸入驗證
- [ ] 2.6 實作 `src/lib/validators.ts`：輸入資料驗證函式（使用 Zod）

## 3. 分類管理

- [ ] 3.1 撰寫分類 service 層測試：建立、更新、刪除、列表、樹狀結構、循環參照檢測
- [ ] 3.2 實作 `src/services/category.service.ts`：分類 CRUD 與樹狀結構邏輯
- [ ] 3.3 撰寫分類 API route handler 測試：POST/GET/PUT/DELETE 請求處理、認證、錯誤回應
- [ ] 3.4 實作 `/api/admin/categories` route handler（GET、POST）
- [ ] 3.5 實作 `/api/admin/categories/[id]` route handler（PUT、DELETE）
- [ ] 3.6 撰寫分類管理頁面元件測試：列表渲染、新增表單、編輯表單、刪除確認
- [ ] 3.7 實作分類管理頁面 `src/app/(admin)/admin/categories/page.tsx`

## 4. 標籤管理

- [ ] 4.1 撰寫標籤 service 層測試：建立、更新、刪除、列表、使用次數統計、清理未使用
- [ ] 4.2 實作 `src/services/tag.service.ts`：標籤 CRUD 與統計邏輯
- [ ] 4.3 撰寫標籤 API route handler 測試：POST/GET/PUT/DELETE 請求處理、搜尋、清理端點
- [ ] 4.4 實作 `/api/admin/tags` route handler（GET、POST）
- [ ] 4.5 實作 `/api/admin/tags/[id]` route handler（PUT、DELETE）
- [ ] 4.6 實作 `/api/admin/tags/unused` route handler（DELETE）
- [ ] 4.7 撰寫標籤管理頁面元件測試：列表渲染、新增、編輯、刪除、清理操作
- [ ] 4.8 實作標籤管理頁面 `src/app/(admin)/admin/tags/page.tsx`

## 5. 媒體管理

- [ ] 5.1 撰寫圖片處理工具測試：壓縮、縮圖生成、格式驗證、大小驗證
- [ ] 5.2 實作 `src/lib/image-processor.ts`：使用 sharp 進行圖片壓縮和縮圖生成
- [ ] 5.3 撰寫儲存策略測試：本地儲存、S3 儲存、模式切換
- [ ] 5.4 實作 `src/lib/storage.ts`：本地/S3 雙模式儲存策略（Strategy Pattern）
- [ ] 5.5 撰寫媒體 service 層測試：上傳流程、列表查詢、刪除（含實體檔案）
- [ ] 5.6 實作 `src/services/media.service.ts`：媒體上傳、列表、刪除邏輯
- [ ] 5.7 撰寫媒體 API route handler 測試：POST 上傳、GET 列表、DELETE 刪除
- [ ] 5.8 實作 `/api/admin/media` route handler（GET、POST）
- [ ] 5.9 實作 `/api/admin/media/[id]` route handler（DELETE）
- [ ] 5.10 撰寫媒體管理頁面元件測試：圖片網格、上傳區域、刪除確認、分頁
- [ ] 5.11 實作媒體管理頁面 `src/app/(admin)/admin/media/page.tsx`

## 6. 文章管理 - 核心 CRUD

- [ ] 6.1 撰寫文章 service 層測試：建立（含自動版本）、更新、刪除、取得單篇、列表查詢（分頁/篩選/搜尋/排序）
- [ ] 6.2 實作 `src/services/post.service.ts`：文章 CRUD 與查詢邏輯
- [ ] 6.3 撰寫文章狀態切換測試：有效狀態轉換、無效轉換、發佈時間設定、排程驗證
- [ ] 6.4 實作文章狀態切換邏輯（含狀態機驗證）
- [ ] 6.5 撰寫批次操作測試：批次刪除、批次發佈、批次下架、數量上限
- [ ] 6.6 實作文章批次操作邏輯
- [ ] 6.7 撰寫文章 API route handler 測試：所有端點的請求處理、認證、參數驗證、錯誤回應
- [ ] 6.8 實作 `/api/admin/posts` route handler（GET、POST）
- [ ] 6.9 實作 `/api/admin/posts/[id]` route handler（GET、PUT、DELETE）
- [ ] 6.10 實作 `/api/admin/posts/[id]/status` route handler（PATCH）
- [ ] 6.11 實作 `/api/admin/posts/batch` route handler（POST）

## 7. 文章版本歷史

- [ ] 7.1 撰寫版本 service 層測試：版本建立、列表查詢、內容取得、差異比對、回溯、版本上限清理
- [ ] 7.2 實作 `src/services/version.service.ts`：版本歷史完整邏輯
- [ ] 7.3 撰寫版本 API route handler 測試：版本列表、版本內容、回溯端點
- [ ] 7.4 實作 `/api/admin/posts/[id]/versions` route handler（GET）
- [ ] 7.5 實作 `/api/admin/posts/[id]/versions/[versionId]` route handler（GET）
- [ ] 7.6 實作 `/api/admin/posts/[id]/versions/[versionId]/restore` route handler（POST）

## 8. 文章管理 - 頁面元件

- [ ] 8.1 撰寫文章列表頁面元件測試：表格渲染、篩選控制項、搜尋輸入、排序、分頁、批次操作 UI
- [ ] 8.2 實作文章列表頁面 `src/app/(admin)/admin/posts/page.tsx`
- [ ] 8.3 撰寫 Markdown 編輯器元件測試：編輯器渲染、內容變更、預覽切換
- [ ] 8.4 實作 Markdown 編輯器元件 `src/components/admin/MarkdownEditor.tsx`（整合 ByteMD）
- [ ] 8.5 撰寫新增文章頁面元件測試：表單欄位、分類/標籤選擇、封面圖片上傳、表單提交
- [ ] 8.6 實作新增文章頁面 `src/app/(admin)/admin/posts/new/page.tsx`
- [ ] 8.7 撰寫編輯文章頁面元件測試：資料載入、表單預填、更新提交
- [ ] 8.8 實作編輯文章頁面 `src/app/(admin)/admin/posts/[id]/edit/page.tsx`
- [ ] 8.9 撰寫版本歷史頁面元件測試：版本列表、版本內容預覽、差異比對顯示、回溯按鈕
- [ ] 8.10 實作版本歷史頁面 `src/app/(admin)/admin/posts/[id]/versions/page.tsx`

## 9. 文章匯入/匯出

- [ ] 9.1 撰寫匯出 service 測試：單篇匯出 Markdown + front matter、批次匯出 ZIP
- [ ] 9.2 實作 `src/services/export.service.ts`：文章匯出邏輯
- [ ] 9.3 撰寫匯入 service 測試：Markdown 解析、front matter 解析、分類/標籤自動匹配/建立
- [ ] 9.4 實作 `src/services/import.service.ts`：文章匯入邏輯
- [ ] 9.5 撰寫匯入匯出 API route handler 測試：匯出端點、批次匯出端點、匯入端點
- [ ] 9.6 實作 `/api/admin/posts/export` route handler（POST）
- [ ] 9.7 實作 `/api/admin/posts/export/batch` route handler（POST）
- [ ] 9.8 實作 `/api/admin/posts/import` route handler（POST）

## 10. 後台儀表板

- [ ] 10.1 撰寫儀表板 service 測試：統計數據查詢、近期活動查詢
- [ ] 10.2 實作 `src/services/dashboard.service.ts`：統計數據與近期活動邏輯
- [ ] 10.3 撰寫儀表板 API route handler 測試：stats 端點、activity 端點
- [ ] 10.4 實作 `/api/admin/dashboard/stats` route handler（GET）
- [ ] 10.5 實作 `/api/admin/dashboard/activity` route handler（GET）
- [ ] 10.6 撰寫儀表板頁面元件測試：統計卡片渲染、活動時間線、快速操作捷徑導航
- [ ] 10.7 實作後台儀表板頁面 `src/app/(admin)/admin/page.tsx`

## 11. 排程發佈 Cron Job

- [ ] 11.1 撰寫排程發佈邏輯測試：查詢到期文章、批次更新狀態、無到期文章時的行為
- [ ] 11.2 實作 `/api/cron/publish-scheduled` route handler
- [ ] 11.3 設定 cron job 配置（Vercel cron 或系統 crontab）

## 12. E2E 測試

- [ ] 12.1 撰寫文章管理 E2E 測試：建立 → 編輯 → 發佈 → 下架完整流程
- [ ] 12.2 撰寫分類管理 E2E 測試：建立 → 編輯 → 刪除流程
- [ ] 12.3 撰寫標籤管理 E2E 測試：建立 → 編輯 → 刪除 → 清理流程
- [ ] 12.4 撰寫媒體管理 E2E 測試：上傳 → 瀏覽 → 刪除流程
- [ ] 12.5 撰寫版本歷史 E2E 測試：建立文章 → 多次編輯 → 查看版本 → 回溯流程
- [ ] 12.6 撰寫匯入匯出 E2E 測試：匯出 → 下載驗證 → 匯入流程
- [ ] 12.7 撰寫儀表板 E2E 測試：統計數據顯示、快速操作導航
