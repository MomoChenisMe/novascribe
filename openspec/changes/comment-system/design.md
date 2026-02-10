## Context

NovaScribe 後台系統已完整建立（認證、內容管理、SEO 管理），前台公開頁面正在開發中（`public-frontend` change）。本設計為部落格新增自建評論系統，涵蓋評論資料模型、Anti-spam 機制、管理後台、前台顯示元件、Email 通知。

### 現有架構
- **Prisma Schema**：Post、Category、Tag、PostTag、PostVersion、SeoMetadata、Media、User、SiteSetting 等 models
- **後台路由**：`src/app/(admin)/admin/` — 已完成
- **API 路由**：`src/app/api/admin/` — 全部需 NextAuth 認證
- **前台路由**：`src/app/(public)/` — 正在開發（public-frontend change）
- **Service 層**：`post.service.ts`、`category.service.ts`、`tag.service.ts` — 完整 CRUD
- **資料庫**：PostgreSQL 18、Prisma 7

### 約束條件
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4（CSS-first 設定）
- NextAuth.js v4 驗證管理員身份
- 無 PostgreSQL 環境（測試全用 mock）
- 前台頁面使用 ISR 渲染策略

## Goals / Non-Goals

**Goals:**
- 建立完整的評論 CRUD 與狀態管理系統
- 支援 2 層巢狀回覆
- 評論內容支援基本 Markdown（粗體、斜體、程式碼、連結）
- 多層 Anti-spam 防禦（honeypot、rate limiting、內容過濾）
- 管理後台評論審核頁面（篩選、批次操作、回覆）
- 前台評論顯示元件（巢狀縮排、提交表單、Markdown 預覽、分頁）
- Email 通知（新評論通知管理員、回覆通知原評論者）

**Non-Goals:**
- OAuth 社交登入留言（不需要讀者登入，匿名留言即可）
- 按讚/踩功能
- 圖片上傳至評論（僅文字 + Markdown）
- 即時推播（WebSocket）通知
- AI 自動審核 spam（使用規則引擎即可）
- 評論匯入/匯出
- 富文本編輯器（使用純 Markdown textarea）

## Decisions

### 1. Comment Schema 設計

新增 `Comment` model 至 Prisma schema：

```prisma
enum CommentStatus {
  PENDING
  APPROVED
  SPAM
  DELETED
}

model Comment {
  id          String        @id @default(cuid())
  postId      String        @map("post_id")
  parentId    String?       @map("parent_id")
  authorName  String        @map("author_name") @db.VarChar(100)
  authorEmail String        @map("author_email") @db.VarChar(255)
  content     String        @db.Text
  status      CommentStatus @default(PENDING)
  ipAddress   String?       @map("ip_address") @db.VarChar(45)
  userAgent   String?       @map("user_agent") @db.VarChar(500)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  post        Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent      Comment?      @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Comment[]     @relation("CommentReplies")

  @@index([postId, status])
  @@index([status])
  @@index([createdAt])
  @@index([parentId])
  @@map("comments")
}
```

Post model 新增關聯：
```prisma
model Post {
  // ...existing fields
  comments    Comment[]
}
```

**替代方案**：Closure table 或 Materialized path（如 `path = "/1/5/12"`）實作巢狀。
**選擇理由**：只需 2 層巢狀，`parentId` 自連結最簡單，查詢效能足夠。Closure table 過於複雜。

### 2. 巢狀回覆策略

- 最多 2 層：頂層評論（parentId = null）→ 回覆（parentId = 頂層評論 ID）
- 若回覆一則回覆，自動歸入頂層評論下（parentId 設為頂層評論 ID），而非無限巢狀
- 查詢策略：先取頂層評論（分頁），再一次查詢所有 replies（`WHERE parentId IN (topLevelIds)`）

```typescript
// 查詢邏輯
const topLevelComments = await prisma.comment.findMany({
  where: { postId, parentId: null, status: 'APPROVED' },
  orderBy: { createdAt: 'asc' },
  take: limit,
  skip: offset,
})

const topLevelIds = topLevelComments.map(c => c.id)
const replies = await prisma.comment.findMany({
  where: { parentId: { in: topLevelIds }, status: 'APPROVED' },
  orderBy: { createdAt: 'asc' },
})
```

**選擇理由**：2 層限制避免 UI 過度縮排，降低查詢複雜度。兩次查詢（頂層 + replies）效能優於遞迴查詢。

### 3. Anti-spam 多層防禦

依序套用以下防禦，全部通過才允許提交：

**Layer 1 — Honeypot 欄位**
```typescript
// 表單中加入隱藏欄位 name="website"
// CSS: display: none; 或 position: absolute; left: -9999px;
// 若此欄位有值 → 靜默拒絕（回傳 200 假裝成功，不儲存）
```

**Layer 2 — Rate Limiting**
```typescript
// 記憶體 Map（key: IP, value: { count, resetAt }）
// 限制：同 IP 每分鐘最多 3 則評論
// 超過 → 回傳 429 Too Many Requests
```

使用記憶體 Map 而非 Redis，原因是個人部落格流量低，記憶體足夠。每分鐘自動清理過期記錄。

**Layer 3 — 內容過濾**
```typescript
// 1. 禁止詞清單（可設定，存於 SiteSetting 或環境變數）
// 2. 連結數量限制（超過 3 個連結 → 自動標記為 spam）
// 3. 內容最小長度（至少 2 字）
// 4. 內容最大長度（最多 5000 字）
```

**Layer 4 — 狀態預設 pending**
- 新評論預設 `PENDING`，需管理員審核
- 可透過 `SiteSetting` 設定 `comment_auto_approve = true` 啟用自動核准

**替代方案**：reCAPTCHA、Akismet API。
**選擇理由**：個人部落格流量不高，多層規則引擎足夠。不引入外部服務（reCAPTCHA 有隱私疑慮，Akismet 需付費）。

### 4. Email 通知架構

使用 Nodemailer + SMTP：

```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendNewCommentNotification(comment: Comment, post: Post) { ... }
export async function sendReplyNotification(reply: Comment, parentComment: Comment, post: Post) { ... }
```

通知時機：
1. **新評論 → 通知管理員**：非同步發送（不阻塞 API 回應）
2. **管理員回覆 → 通知原評論者**：回覆評論時觸發（僅限 authorEmail 有值且已核准的評論）

信件內容使用 HTML 模板，包含文章標題、評論摘要、管理連結。

**替代方案**：SendGrid API、AWS SES。
**選擇理由**：Nodemailer + SMTP 最通用，無需綁定特定雲端服務。個人部落格發信量極低。

### 5. 前台評論元件設計

```
src/components/public/comment/
├── CommentSection.tsx        # 評論區容器（載入評論、表單、分頁）
├── CommentList.tsx           # 評論列表（巢狀顯示）
├── CommentItem.tsx           # 單則評論（頭像、作者、時間、內容、回覆按鈕）
├── CommentForm.tsx           # 提交表單（暱稱、Email、Markdown textarea、預覽、honeypot）
└── CommentMarkdownPreview.tsx # Markdown 即時預覽
```

互動流程：
1. `CommentSection` 用 `useEffect` 從 API 載入已核准評論（client-side fetch）
2. 頂層評論分頁載入（預設 10 則），replies 隨頂層評論一起載入
3. 點擊「回覆」展開 inline `CommentForm`
4. 提交後表單清空，顯示「評論已送出，待審核後顯示」提示
5. Markdown 預覽使用輕量 client-side 解析器

**Client-side Markdown 解析器選擇**：

使用 `unified` 生態系（與前台文章渲染統一）：
```typescript
// src/lib/comment-markdown-client.ts（client-side bundle）
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

export async function parseCommentMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: ['p', 'strong', 'em', 'code', 'pre', 'a'],
      attributes: { a: ['href'] },
    })
    .use(rehypeStringify)
    .process(markdown)
  
  return String(result)
}
```

**替代方案**：`marked`（更輕量，5KB vs unified 的 ~20KB）。
**選擇理由**：與前台文章渲染使用同一套 unified 生態系，確保 Markdown 解析行為一致。雖然 bundle 稍大，但 tree-shaking 後影響有限，且可共享前台已載入的 unified 套件。

Markdown 支援範圍（評論用，限制格式）：
- 粗體（`**bold**`）、斜體（`*italic*`）
- 行內程式碼（`` `code` ``）、程式碼區塊（``` ``` ```）
- 連結（`[text](url)`）
- 不支援：標題（h1-h6）、圖片、表格、HTML

**替代方案**：SSR 渲染評論（Server Component）。
**選擇理由**：評論區需要互動（提交、回覆、分頁載入），適合 client-side 渲染。ISR 頁面 + client-side 評論區是常見模式。

### 6. 管理後台頁面設計

```
src/app/(admin)/admin/comments/
└── page.tsx                    # 評論管理主頁面
```

功能：
- **評論列表表格**：作者、內容摘要（前 100 字）、文章標題、狀態、時間
- **篩選 Tabs**：全部 / 待審核 / 已核准 / Spam（每個 tab 顯示數量 badge）
- **批次操作**：checkbox 勾選多則 → 核准 / 標記 spam / 刪除
- **單則操作**：核准、標記 spam、刪除、回覆
- **管理員回覆**：展開 inline 回覆表單，回覆自動核准
- **評論統計**：頁面頂部顯示待審核數、今日新增數、總評論數

API 呼叫：
- `GET /api/admin/comments?status=pending&page=1` — 列表
- `PUT /api/admin/comments/[id]` — 更新狀態
- `DELETE /api/admin/comments/[id]` — 刪除
- `POST /api/admin/comments/[id]/reply` — 管理員回覆
- `PUT /api/admin/comments/batch` — 批次操作 `{ action: 'approve' | 'spam' | 'delete', ids: string[] }`

### 7. 評論 Service 層

```typescript
// src/lib/services/comment.service.ts

// 公開 API 用
export async function createComment(data: CreateCommentInput): Promise<Comment>
export async function getApprovedComments(postId: string, options: PaginationOptions): Promise<PaginatedResult<CommentWithReplies>>

// 管理 API 用
export async function getAdminComments(options: AdminCommentFilters): Promise<PaginatedResult<Comment>>
export async function updateCommentStatus(id: string, status: CommentStatus): Promise<Comment>
export async function deleteComment(id: string): Promise<void>
export async function createAdminReply(commentId: string, content: string, adminUser: User): Promise<Comment>
export async function batchUpdateComments(ids: string[], action: BatchAction): Promise<BatchResult>
export async function getCommentStats(): Promise<CommentStats>
```

### 8. Markdown 安全性

評論內容使用 Markdown，但需防止 XSS：

- Server-side：儲存原始 Markdown，顯示時渲染為 HTML
- 渲染管線套用 `rehype-sanitize`（白名單制，只允許安全標籤）
- 前台預覽：client-side 使用相同的 sanitize 規則
- 禁止 `<script>`、`<iframe>`、`<style>`、`onclick` 等

## Risks / Trade-offs

### 風險

- **[記憶體 Rate Limiter 重啟後遺失]** → 伺服器重啟後 rate limit 計數重置。Mitigation：個人部落格流量低，重啟頻率低，可接受。未來可升級為 Redis。
- **[Email 發送失敗]** → SMTP 連線問題可能導致通知失敗。Mitigation：非同步發送 + try-catch，不影響評論提交。記錄 error log。
- **[Honeypot 對進階機器人無效]** → 進階機器人可能忽略隱藏欄位。Mitigation：多層防禦，honeypot 只是第一道，還有 rate limiting + 內容過濾 + 人工審核。
- **[評論 Markdown XSS]** → 使用者提交的 Markdown 可能包含惡意內容。Mitigation：`rehype-sanitize` 白名單制，只允許安全標籤。

### Trade-offs

- **匿名留言 vs 需登入**：匿名降低留言門檻但增加 spam 風險。接受此 trade-off，用 anti-spam 機制補償。
- **預設 pending vs 自動核准**：預設 pending 確保品質但增加管理負擔。提供 `SiteSetting` 讓管理員選擇。
- **記憶體 Rate Limiter vs Redis**：簡單但不持久。個人部落格可接受。
- **2 層巢狀 vs 無限巢狀**：限制互動深度但 UI 更乾淨、查詢更簡單。
- **Client-side 評論區 vs SSR**：首次載入多一次 API 請求，但支援互動。SEO 不需索引評論內容。

## Open Questions

- 無（brainstorming 階段已釐清主要決策）
