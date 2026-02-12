## 1. 資料模型與套件設定

- [x] 1.1 安裝評論系統相關套件（nodemailer、@types/nodemailer、marked、rehype-sanitize、unified、remark-parse、remark-rehype、rehype-stringify）
- [x] 1.2 新增 CommentStatus enum 和 Comment model 至 Prisma schema，更新 Post model 新增 comments 關聯
- [x] 1.3 產生 Prisma migration 並更新 Prisma Client

## 2. Anti-spam 機制

- [x] 2.1 撰寫 honeypot 檢查函式測試（有值時拒絕、空值時通過）
- [x] 2.2 實作 honeypot 檢查函式（`src/lib/anti-spam.ts`）
- [x] 2.3 撰寫 rate limiter 測試（同 IP 頻率限制、自動重置、不同 IP 獨立計數）
- [x] 2.4 實作 rate limiter（`src/lib/rate-limiter.ts`，記憶體 Map，每分鐘 3 則）
- [x] 2.5 撰寫內容過濾函式測試（禁止詞偵測、連結數量限制、長度限制）
- [x] 2.6 實作內容過濾函式（`src/lib/anti-spam.ts` 中 `filterContent`）
- [x] 2.7 撰寫 anti-spam 整合檢查測試（honeypot → rate limit → content filter 流程）
- [x] 2.8 實作 anti-spam 整合檢查函式（`checkAntiSpam`，依序呼叫各層防禦）

## 3. 評論 Service 層

- [x] 3.1 撰寫 createComment service 測試（建立頂層評論、建立回覆、回覆的回覆歸入頂層、非 PUBLISHED 文章拒絕、欄位驗證、Email 格式驗證）
- [x] 3.2 實作 createComment service（`src/lib/services/comment.service.ts`）
- [x] 3.3 撰寫 getApprovedComments service 測試（取得已核准評論、巢狀結構、分頁、排序、排除非 APPROVED）
- [x] 3.4 實作 getApprovedComments service
- [x] 3.5 撰寫 getAdminComments service 測試（全部評論列表、狀態篩選、分頁、排序）
- [x] 3.6 實作 getAdminComments service
- [x] 3.7 撰寫 updateCommentStatus service 測試（狀態轉換、不存在的評論回傳 404）
- [x] 3.8 實作 updateCommentStatus service
- [x] 3.9 撰寫 deleteComment service 測試（軟刪除、硬刪除、級聯刪除 replies）
- [x] 3.10 實作 deleteComment service
- [x] 3.11 撰寫 createAdminReply service 測試（管理員回覆自動 APPROVED、authorName 使用管理員名稱）
- [x] 3.12 實作 createAdminReply service
- [x] 3.13 撰寫 batchUpdateComments service 測試（批次核准、批次 spam、批次刪除、超過 50 則上限、混合狀態處理）
- [x] 3.14 實作 batchUpdateComments service
- [x] 3.15 撰寫 getCommentStats service 測試（待審核數、今日新增數、已核准總數、Spam 總數）
- [x] 3.16 實作 getCommentStats service

## 4. 評論 Markdown 渲染

- [x] 4.1 撰寫評論 Markdown 渲染函式測試（粗體、斜體、程式碼、連結、程式碼區塊）
- [x] 4.2 實作評論 Markdown 渲染函式（`src/lib/comment-markdown.ts`，限制格式：不支援標題、圖片、表格）
- [x] 4.3 撰寫 XSS sanitize 測試（過濾 script/iframe/onclick、保留白名單標籤）
- [x] 4.4 整合 rehype-sanitize 至評論 Markdown 渲染管線

## 5. Email 通知

- [x] 5.1 撰寫 Email transporter 初始化測試（SMTP 環境變數完整時初始化、未設定時停用）
- [x] 5.2 實作 Email 模組（`src/lib/email.ts`，Nodemailer transporter 初始化）
- [x] 5.3 撰寫新評論通知 Email 測試（信件格式、管理員收件、spam 不通知、honeypot 不通知）
- [x] 5.4 實作 sendNewCommentNotification 函式
- [x] 5.5 撰寫回覆通知 Email 測試（信件格式、原評論者收件、Email 無效時不發送）
- [x] 5.6 實作 sendReplyNotification 函式
- [x] 5.7 撰寫 Email HTML 模板測試（新評論模板、回覆模板、主旨格式）
- [x] 5.8 實作 Email HTML 模板（`src/lib/email-templates.ts`）

## 6. 公開 API 路由

- [x] 6.1 撰寫 POST `/api/posts/[postId]/comments` 測試（成功提交、anti-spam 攔截、honeypot、rate limit 429、欄位驗證 400、非 PUBLISHED 文章 404）
- [x] 6.2 實作 POST `/api/posts/[postId]/comments` route handler
- [x] 6.3 撰寫 GET `/api/posts/[postId]/comments` 測試（取得已核准評論、巢狀結構、分頁參數、空結果）
- [x] 6.4 實作 GET `/api/posts/[postId]/comments` route handler

## 7. 管理員 API 路由

- [x] 7.1 撰寫 GET `/api/admin/comments` 測試（需認證、狀態篩選、分頁、未認證 401）
- [x] 7.2 實作 GET `/api/admin/comments` route handler
- [x] 7.3 撰寫 PUT `/api/admin/comments/[id]` 測試（更新狀態、需認證、不存在 404）
- [x] 7.4 實作 PUT `/api/admin/comments/[id]` route handler
- [x] 7.5 撰寫 DELETE `/api/admin/comments/[id]` 測試（刪除評論、需認證、不存在 404）
- [x] 7.6 實作 DELETE `/api/admin/comments/[id]` route handler
- [x] 7.7 撰寫 POST `/api/admin/comments/[id]/reply` 測試（管理員回覆、自動 APPROVED、需認證、觸發通知）
- [x] 7.8 實作 POST `/api/admin/comments/[id]/reply` route handler
- [x] 7.9 撰寫 PUT `/api/admin/comments/batch` 測試（批次操作、超過上限 400、需認證）
- [x] 7.10 實作 PUT `/api/admin/comments/batch` route handler

## 8. 自動核准設定

- [x] 8.1 撰寫自動核准邏輯測試（SiteSetting comment_auto_approve 為 true 時自動核准、為 false 時 PENDING）
- [x] 8.2 實作自動核准邏輯（createComment 中讀取 SiteSetting 決定初始狀態）

## 9. 前台評論元件

- [x] 9.1 撰寫 CommentSection 元件測試（載入評論、loading 狀態、錯誤狀態、評論數標題）
- [x] 9.2 實作 CommentSection 元件（`src/components/public/comment/CommentSection.tsx`）
- [x] 9.3 撰寫 CommentList 元件測試（頂層評論列表、巢狀 replies 縮排、空列表提示）
- [x] 9.4 實作 CommentList 元件（`src/components/public/comment/CommentList.tsx`）
- [x] 9.5 撰寫 CommentItem 元件測試（頭像、作者暱稱、相對時間、Markdown 內容、回覆按鈕）
- [x] 9.6 實作 CommentItem 元件（`src/components/public/comment/CommentItem.tsx`）
- [x] 9.7 撰寫 CommentForm 元件測試（欄位渲染、client-side 驗證、honeypot 隱藏欄位、提交成功/失敗、loading 狀態）
- [x] 9.8 實作 CommentForm 元件（`src/components/public/comment/CommentForm.tsx`）
- [x] 9.9 撰寫 CommentMarkdownPreview 元件測試（編輯/預覽 tab 切換、Markdown 渲染、空內容提示）
- [x] 9.10 實作 CommentMarkdownPreview 元件（`src/components/public/comment/CommentMarkdownPreview.tsx`）
- [x] 9.11 撰寫回覆功能測試（點擊回覆展開 inline 表單、取消收合、提交回覆帶 parentId）
- [x] 9.12 實作回覆功能（CommentItem + inline CommentForm 整合）
- [x] 9.13 撰寫分頁載入測試（初始 10 則、載入更多按鈕、全部載入後隱藏按鈕）
- [x] 9.14 實作分頁載入功能（CommentSection 中 loadMore 邏輯）

## 10. 管理後台頁面

- [x] 10.1 撰寫評論管理頁面測試（評論列表表格、狀態篩選 tabs、統計卡片、分頁）
- [x] 10.2 實作評論管理頁面（`src/app/(admin)/admin/comments/page.tsx`）
- [x] 10.3 撰寫批次操作 UI 測試（checkbox 勾選、批次按鈕、確認對話框、操作結果提示）
- [x] 10.4 實作批次操作 UI
- [x] 10.5 撰寫單則操作 UI 測試（核准、標記 spam、刪除按鈕、狀態即時更新）
- [x] 10.6 實作單則操作 UI
- [x] 10.7 撰寫管理員回覆 UI 測試（展開回覆表單、提交回覆、回覆顯示在列表中）
- [x] 10.8 實作管理員回覆 UI
- [x] 10.9 更新後台 Sidebar 新增「評論管理」導航連結（含待審核數 badge）

## 11. 文章頁面整合

- [x] 11.1 撰寫文章詳情頁評論區整合測試（CommentSection 渲染、postId 傳遞）
- [x] 11.2 整合 CommentSection 至文章詳情頁（`src/app/(public)/posts/[slug]/page.tsx`）
- [x] 11.3 撰寫文章卡片評論數顯示測試（評論數 badge、0 則評論處理）
- [x] 11.4 整合評論數至文章卡片元件（ArticleCard 顯示已核准評論數）

## 12. E2E 測試

- [x] 12.1 撰寫前台評論提交 E2E 測試（表單填寫、提交成功、驗證錯誤、rate limit）
- [x] 12.2 撰寫前台評論顯示 E2E 測試（巢狀縮排、Markdown 渲染、分頁載入、回覆功能）
- [x] 12.3 撰寫管理後台評論管理 E2E 測試（列表篩選、狀態更新、批次操作、管理員回覆）
