## Context

NovaScribe 的基礎架構（Next.js App Router + PostgreSQL + Prisma + NextAuth.js）已在 `foundation-and-auth` change 中建立完成。目前系統具備：使用者認證、後台佈局框架、middleware 路由保護、測試工具鏈。

本 change 將在此基礎上建構核心內容管理功能，涵蓋文章完整生命週期管理、分類與標籤組織架構、媒體管理、版本歷史、匯入匯出，以及後台儀表板。這些功能構成部落格後台的核心價值。

**現狀**：基礎架構已就緒，`users` 資料表已建立，認證系統可用。

**限制條件**：
- 單一管理者架構，所有 API 端點預設需認證
- 文章支援 Markdown 格式撰寫
- 圖片儲存需支援本地與 S3 雙模式
- 須維持 TDD 開發流程，測試覆蓋率 ≥ 80%

## Goals / Non-Goals

**Goals：**
- 設計完整的內容管理資料庫 schema（posts、categories、tags、media、post_versions）
- 實作文章 CRUD 與狀態管理（草稿/已發佈/排程發佈/下架）
- 整合 Markdown 編輯器與即時預覽
- 實作文章版本歷史（自動快照、差異比對、一鍵回溯）
- 實作分類與標籤的管理功能
- 實作媒體上傳與管理（含圖片壓縮）
- 實作文章匯入/匯出功能
- 建立後台儀表板統計頁面

**Non-Goals：**
- 前台文章渲染與頁面展示（屬於後續 change）
- SEO meta tags 管理（屬於 seo-and-analytics change）
- 多使用者協作與權限分級
- 評論系統
- RSS feed 生成
- 全文搜尋引擎整合（初期使用資料庫 LIKE 查詢）

## Decisions

### 1. 資料庫 Schema 設計

```prisma
model Post {
  id            String        @id @default(cuid())
  title         String
  slug          String        @unique
  content       String        @db.Text
  excerpt       String?       @db.Text
  coverImage    String?
  status        PostStatus    @default(DRAFT)
  publishedAt   DateTime?
  scheduledAt   DateTime?
  authorId      String
  categoryId    String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  author        User          @relation(fields: [authorId], references: [id])
  category      Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags          PostTag[]
  versions      PostVersion[]

  @@index([status])
  @@index([publishedAt])
  @@index([slug])
  @@map("posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

model PostVersion {
  id        String   @id @default(cuid())
  postId    String
  title     String
  content   String   @db.Text
  version   Int
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, version])
  @@map("post_versions")
}

model Category {
  id        String     @id @default(cuid())
  name      String     @unique
  slug      String     @unique
  parentId  String?
  sortOrder Int        @default(0)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children  Category[] @relation("CategoryHierarchy")
  posts     Post[]

  @@index([parentId])
  @@index([slug])
  @@map("categories")
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  posts     PostTag[]

  @@index([slug])
  @@map("tags")
}

model PostTag {
  postId String
  tagId  String

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model Media {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  storageType  String   @default("local")  // "local" | "s3"
  width        Int?
  height       Int?
  createdAt    DateTime @default(now())

  @@index([mimeType])
  @@map("media")
}
```

**理由**：
- `Post` 使用 `slug` 作為 URL 識別碼，支援 SEO 友善的 URL 結構
- `PostStatus` 使用 enum 確保狀態值的型別安全
- `PostVersion` 使用遞增 `version` 編號，搭配 `postId` 索引以加速版本查詢
- `Category` 使用自關聯實作父子層級結構，`sortOrder` 支援自訂排序
- `PostTag` 多對多關聯表使用複合主鍵，避免重複關聯
- `Media` 記錄 `storageType` 以支援本地/S3 雙模式切換
- 所有資料表使用 `cuid()` 作為主鍵，與 `foundation-and-auth` 中的 `User` 一致

**替代方案**：
- 文章使用自增 ID → cuid 更安全且可避免 ID 猜測攻擊
- 標籤直接存在 Post 的 JSON 欄位 → 獨立資料表支援標籤統計和管理
- 版本歷史使用 JSON diff → 完整快照更簡單、回溯更可靠

### 2. API 端點設計

所有 API 端點位於 `/api/admin/` 路徑下，透過 middleware 強制認證。

#### 文章管理 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/posts` | GET | 取得文章列表（分頁、篩選、搜尋） |
| `/api/admin/posts` | POST | 建立新文章 |
| `/api/admin/posts/[id]` | GET | 取得單篇文章 |
| `/api/admin/posts/[id]` | PUT | 更新文章 |
| `/api/admin/posts/[id]` | DELETE | 刪除文章 |
| `/api/admin/posts/[id]/status` | PATCH | 切換文章狀態 |
| `/api/admin/posts/[id]/versions` | GET | 取得版本歷史列表 |
| `/api/admin/posts/[id]/versions/[versionId]` | GET | 取得特定版本內容 |
| `/api/admin/posts/[id]/versions/[versionId]/restore` | POST | 回溯到指定版本 |
| `/api/admin/posts/batch` | POST | 批次操作（刪除/發佈/下架） |

**文章列表查詢參數**：
- `page`：頁碼（預設 1）
- `limit`：每頁數量（預設 20，最大 100）
- `status`：狀態篩選（DRAFT / PUBLISHED / SCHEDULED / ARCHIVED）
- `categoryId`：分類篩選
- `tagId`：標籤篩選
- `search`：關鍵字搜尋（搜尋標題和內容）
- `sortBy`：排序欄位（createdAt / updatedAt / publishedAt / title）
- `sortOrder`：排序方向（asc / desc）

#### 分類管理 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/categories` | GET | 取得分類列表（含層級結構） |
| `/api/admin/categories` | POST | 建立分類 |
| `/api/admin/categories/[id]` | PUT | 更新分類 |
| `/api/admin/categories/[id]` | DELETE | 刪除分類 |

#### 標籤管理 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/tags` | GET | 取得標籤列表（含使用次數） |
| `/api/admin/tags` | POST | 建立標籤 |
| `/api/admin/tags/[id]` | PUT | 更新標籤 |
| `/api/admin/tags/[id]` | DELETE | 刪除標籤 |
| `/api/admin/tags/unused` | DELETE | 清理未使用標籤 |

#### 媒體管理 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/media` | GET | 取得媒體列表 |
| `/api/admin/media` | POST | 上傳媒體檔案 |
| `/api/admin/media/[id]` | DELETE | 刪除媒體檔案 |

#### 匯入匯出 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/posts/export` | POST | 匯出文章為 Markdown |
| `/api/admin/posts/export/batch` | POST | 批次匯出 |
| `/api/admin/posts/import` | POST | 從 Markdown 匯入文章 |

#### 儀表板 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/admin/dashboard/stats` | GET | 取得統計數據 |
| `/api/admin/dashboard/activity` | GET | 取得近期活動 |

**理由**：
- RESTful 風格，資源導向設計，URL 語意清晰
- 統一使用 `/api/admin/` 前綴，方便 middleware 統一認證
- 文章狀態切換使用獨立的 PATCH 端點，語意明確
- 批次操作使用 POST `/batch`，body 中攜帶操作類型與目標 ID 陣列

**替代方案**：
- GraphQL → 對個人部落格而言 REST 已足夠，GraphQL 增加不必要的複雜度
- tRPC → 雖然型別安全，但增加學習成本且鎖定 Next.js 生態

### 3. Markdown 編輯器選型：@bytemd/react

```typescript
// 使用 ByteMD 作為 Markdown 編輯器
import { Editor } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
```

**理由**：
- ByteMD 是字節跳動開源的 Markdown 編輯器，體積小、效能好
- 內建分割預覽模式（編輯 + 預覽並排顯示）
- 支援 GFM（GitHub Flavored Markdown）擴充
- 支援程式碼語法高亮
- Plugin 架構可擴充（如圖片上傳整合）

**替代方案**：
- @uiw/react-md-editor → 功能類似但社群較小
- Monaco Editor → 過重，適合 IDE 而非部落格編輯器
- 純 textarea + markdown-it → 開發成本高，使用者體驗差

### 4. 圖片處理策略

```typescript
// 圖片上傳流程
async function processImage(file: File) {
  // 1. 驗證檔案類型和大小（最大 10MB）
  // 2. 使用 sharp 壓縮和產生縮圖
  //    - 原圖：最大寬度 1920px，品質 85%
  //    - 縮圖：最大寬度 400px，品質 80%
  // 3. 依據設定儲存至本地或 S3
  // 4. 回傳媒體記錄（含 URL、尺寸資訊）
}
```

**理由**：
- sharp 是 Node.js 最高效能的圖片處理套件，支援 WebP/AVIF 轉換
- 限制最大上傳 10MB，避免伺服器資源被大檔案佔用
- 自動壓縮確保頁面載入效能
- 本地/S3 雙模式透過環境變數切換，部署彈性高

**儲存策略**：
- 本地模式：存放於 `public/uploads/YYYY/MM/` 目錄結構
- S3 模式：使用 `@aws-sdk/client-s3` 上傳至指定 bucket
- 環境變數 `STORAGE_TYPE=local|s3` 控制模式切換

### 5. 版本歷史策略

- 每次文章儲存（POST/PUT）自動建立版本快照
- 版本號從 1 開始遞增
- 版本記錄包含完整的 `title` 和 `content`（完整快照，非 diff）
- 版本比對使用 `diff` 套件產生差異標記
- 回溯操作：將指定版本的內容覆寫到當前文章，並建立一個新版本
- 版本保留策略：預設保留最近 50 個版本，超過時自動刪除最舊的版本

**理由**：
- 完整快照比 diff 更簡單可靠，回溯時不需要重建狀態
- 回溯後建立新版本，確保歷史可追溯
- 50 版本上限避免資料庫無限增長

### 6. Slug 自動生成策略

```typescript
// 分類和文章的 slug 生成
function generateSlug(text: string): string {
  // 1. 中文：使用 pinyin 套件轉拼音
  // 2. 英文：直接 lowercase + 連字號分隔
  // 3. 去除特殊字元
  // 4. 若 slug 已存在，自動加上 -2, -3 等後綴
}
```

**理由**：
- slug 用於 SEO 友善的 URL（如 `/posts/my-first-blog`）
- 中文轉拼音讓 URL 可讀（如 `我的文章` → `wo-de-wen-zhang`）
- 自動去重避免 slug 衝突
- 使用者可手動覆寫 slug

### 7. 後台頁面路由結構

```
src/app/(admin)/admin/
├── page.tsx                     # 儀表板
├── posts/
│   ├── page.tsx                 # 文章列表
│   ├── new/page.tsx             # 新增文章
│   └── [id]/
│       ├── edit/page.tsx        # 編輯文章
│       └── versions/page.tsx    # 版本歷史
├── categories/
│   └── page.tsx                 # 分類管理
├── tags/
│   └── page.tsx                 # 標籤管理
└── media/
    └── page.tsx                 # 媒體管理
```

**理由**：與 Next.js App Router 的檔案系統路由慣例一致，每個功能模組一個目錄。

### 8. 排程發佈實作

排程發佈使用以下策略：
- 文章設定 `scheduledAt` 時間與 `SCHEDULED` 狀態
- 使用 Next.js API Route 搭配外部 cron job（如 Vercel Cron 或系統 crontab）定時檢查
- Cron 端點：`/api/cron/publish-scheduled`，每分鐘執行一次
- 查詢所有 `status = SCHEDULED AND scheduledAt <= NOW()` 的文章，批次更新為 `PUBLISHED`

**替代方案**：
- 即時 setTimeout → 伺服器重啟後排程遺失
- 訊息佇列（Bull/BullMQ）→ 對個人部落格過於複雜

## Risks / Trade-offs

- **[文章搜尋效能]** 使用 PostgreSQL `ILIKE` 做全文搜尋，文章數量超過萬篇後效能可能下降 → 初期可接受，後續可引入 PostgreSQL Full-Text Search 或 Elasticsearch
- **[版本歷史儲存]** 每個版本儲存完整內容，儲存空間增長較快 → 設定 50 版本上限，並可定期清理。對個人部落格而言儲存量可控
- **[圖片處理耗時]** sharp 壓縮大圖片可能需要數秒 → 上傳時顯示進度條，考慮後續加入背景處理佇列
- **[S3 依賴]** S3 模式需要額外的 AWS 設定和費用 → 預設使用本地儲存，S3 為可選模式
- **[排程發佈精度]** Cron job 每分鐘執行一次，發佈時間最多延遲 60 秒 → 對部落格發佈來說可接受
- **[Slug 中文轉拼音]** 同音字可能產生相同 slug → 自動加後綴去重機制解決
- **[大量批次操作]** 批次操作多篇文章可能超時 → 限制單次批次操作數量（最多 50 篇）

## Migration Plan

1. 建立 Prisma migration：新增 posts、categories、tags、post_tags、media、post_versions 資料表和 PostStatus enum
2. 安裝相依套件：@bytemd/react、sharp、@aws-sdk/client-s3（可選）、diff、pinyin-pro
3. 實作資料存取層（service/repository functions）
4. 實作 API route handlers
5. 建立後台頁面元件
6. 整合 Markdown 編輯器
7. 實作媒體上傳功能
8. 實作版本歷史功能
9. 實作匯入匯出功能
10. 建立儀表板頁面

**Rollback**：透過 Prisma migration rollback 還原資料庫變更。前端頁面和 API routes 刪除對應檔案即可。

## Open Questions

- ByteMD 是否支援圖片直接拖拽上傳整合？需實際測試其 plugin API
- 排程發佈的 cron job 在不同部署環境（Vercel / Docker / VPS）的最佳實作方式？
- 是否需要支援文章共同作者（co-author）？— 初期不需要，保持單一管理者架構
- 媒體檔案是否需要支援影片上傳？— 初期只支援圖片，影片建議使用外部服務（YouTube/Vimeo）嵌入
