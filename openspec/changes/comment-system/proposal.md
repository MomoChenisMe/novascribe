## Why

NovaScribe 目前已完成認證系統、內容管理、SEO 管理，並正在建構前台公開頁面。然而，部落格缺少與讀者互動的核心功能——評論系統。讀者無法在文章下方留言、討論或提問，作者也無法即時收到讀者回饋。

選擇**自建評論系統**而非第三方服務（如 Disqus、Giscus），原因是：
- 完全掌控資料，不依賴外部服務
- 無廣告注入、無追蹤問題
- 可客製化審核流程與 anti-spam 機制
- 資料存於自有 PostgreSQL，與部落格資料統一管理

目標使用者：
- **讀者**：在文章下方留言、回覆其他讀者
- **管理員**：審核評論、管理 spam、回覆讀者

## What Changes

### 評論資料模型
- 新增 `Comment` model（Prisma），支援巢狀回覆（parentId，最多 2 層）
- Comment 包含 authorName、authorEmail、Markdown 內容、狀態機（pending/approved/spam/deleted）
- Post model 新增 `comments` 關聯與評論數統計

### Anti-spam 與審核機制
- Honeypot 隱藏欄位偵測機器人
- IP-based rate limiting（每分鐘 3 則）
- 內容過濾（禁止詞清單、連結數量限制）
- 新評論預設 pending，管理員審核後顯示（可設定自動核准）

### 管理後台
- 評論列表頁面（篩選 pending/approved/spam/all）
- 批次操作（核准、標記 spam、刪除）
- 管理員回覆評論
- 評論統計（待審核數、今日新增數）

### 前台評論顯示
- 文章頁面評論區（巢狀縮排、Markdown 渲染）
- 提交表單（暱稱、Email、內容、Markdown 即時預覽）
- 分頁載入

### Email 通知
- 新評論通知管理員
- 回覆通知原評論者（可選）
- 使用 Nodemailer + SMTP

### API 端點
- `POST /api/posts/[postId]/comments` — 提交評論（公開）
- `GET /api/posts/[postId]/comments` — 取得已核准評論（公開）
- `GET /api/admin/comments` — 管理員評論列表
- `PUT /api/admin/comments/[id]` — 更新評論狀態
- `DELETE /api/admin/comments/[id]` — 刪除評論
- `POST /api/admin/comments/[id]/reply` — 管理員回覆
- `PUT /api/admin/comments/batch` — 批次操作

## Capabilities

### New Capabilities
- `comment-management`: 評論 CRUD、狀態管理、巢狀回覆（parentId + maxDepth=2）
- `comment-moderation`: Anti-spam 多層防禦（honeypot、rate limiting、內容過濾）、管理員審核機制、批次操作
- `comment-notification`: Email 通知系統（新評論通知管理員、回覆通知原評論者），使用 Nodemailer + SMTP
- `comment-display`: 前台評論顯示元件（巢狀縮排、Markdown 渲染、提交表單、即時預覽、分頁載入）

### Modified Capabilities
- `blog-post-management`: Post model 新增 `comments` 關聯、評論數統計欄位；刪除文章時級聯刪除評論

## Impact

### 新增檔案
- Prisma migration：`Comment` model 定義
- Service 層：`src/lib/services/comment.service.ts`
- API 路由：`src/app/api/posts/[postId]/comments/route.ts`、`src/app/api/admin/comments/` 目錄下 4 個路由
- 前台元件：`src/components/public/comment/` 目錄下 5+ 元件
- 管理後台頁面：`src/app/(admin)/admin/comments/page.tsx`
- Email 工具：`src/lib/email.ts`
- Anti-spam 工具：`src/lib/anti-spam.ts`
- Rate limiter：`src/lib/rate-limiter.ts`

### 修改檔案
- `prisma/schema.prisma` — 新增 Comment model、更新 Post model 關聯
- `src/app/(admin)/admin/` — Sidebar 新增「評論管理」連結

### 新增套件
- `nodemailer` — Email 發送
- `@types/nodemailer` — TypeScript 型別

### 資料庫影響
- 新增 `comments` 資料表
- `posts` 資料表新增 `comment_count` 欄位（選配，可透過 COUNT 查詢替代）
