## Why

基礎建設完成後，NovaScribe 需要核心的內容管理功能。部落格的本質就是內容，後台必須提供完整的文章生命週期管理（草稿→發佈→下架）、分類與標籤的組織架構、圖片媒體管理，以及文章版本歷史保護。這些功能構成部落格後台的核心價值，也是前台展示的資料來源。

**目標使用者**：部落格管理者（Momo），需要高效地撰寫、組織、管理部落格文章。

## What Changes

- 設計文章、分類、標籤、媒體、版本歷史的資料庫 schema
- 實作文章 CRUD 管理（建立、編輯、刪除、列表、搜尋）
- 實作文章狀態管理（草稿/已發佈/排程發佈/下架）
- 整合 Markdown 編輯器，支援即時預覽
- 實作文章預覽功能（模擬前台呈現效果）
- 實作文章版本歷史（自動儲存版本、版本比對、回溯）
- 實作分類管理（CRUD + 父子層級結構 + slug 自動生成）
- 實作標籤管理（CRUD + 文章多對多關聯）
- 實作圖片/媒體上傳與管理（上傳、列表、刪除、圖片壓縮/縮放）
- 實作文章批次操作（多選刪除、批次發佈、批次下架）
- 實作後台儀表板（文章統計、近期活動）
- 實作文章匯入/匯出功能（Markdown 格式匯出、備份）

## Capabilities

### New Capabilities

- `blog-post-management`：文章完整生命週期管理，包含 CRUD、搜尋（標題/內容/分類/標籤）、狀態切換（草稿/已發佈/排程發佈/下架）、Markdown 編輯器整合、即時預覽、批次操作（多選刪除/發佈/下架）
- `post-versioning`：文章版本歷史管理，每次儲存自動建立版本快照、版本清單瀏覽、版本間差異比對、一鍵回溯到指定版本
- `category-management`：分類的 CRUD 操作，支援無限層級的父子分類結構，slug 自動生成（中文轉拼音或自訂），分類下文章數量統計
- `tag-management`：標籤的 CRUD 操作，支援文章與標籤的多對多關聯，標籤使用次數統計，未使用標籤清理
- `media-management`：圖片與媒體檔案的上傳、列表、刪除、預覽，支援圖片自動壓縮與縮放，儲存方案支援本地或 S3 相容儲存
- `post-import-export`：文章匯出為 Markdown 格式（含 front matter）、批次匯出、資料備份，支援從 Markdown 檔案匯入文章
- `admin-dashboard`：後台首頁儀表板，顯示文章總數/草稿數/已發佈數統計、近期編輯活動時間線、快速操作捷徑

### Modified Capabilities

- `database-setup`：新增 posts、categories、tags、media、post_versions 等資料表的 migration

## Impact

- **資料庫**：新增 posts、categories、tags、post_tags（關聯表）、media、post_versions 資料表
- **API**：建立 `/api/admin/posts`、`/api/admin/categories`、`/api/admin/tags`、`/api/admin/media`、`/api/admin/dashboard` 等 route handlers
- **相依套件**：@uiw/react-md-editor 或 @bytemd/react（Markdown 編輯器）、sharp（圖片處理）、@aws-sdk/client-s3（可選，S3 儲存）、diff（版本比對）
- **儲存**：需要檔案儲存空間（本地 `public/uploads` 或 S3 bucket）
- **效能考量**：文章列表需分頁、媒體上傳需限制檔案大小、版本歷史需定期清理策略
