# 設計：NovaScribe 核心架構與技術設計

## 1. 系統架構
NovaScribe 採用 Next.js 16.1 (App Router) 架構，實現前後端分離但程式碼庫統一的開發模式。

### 後端與 API
- **資料庫**：PostgreSQL (搭配 Prisma ORM) 存儲核心數據。
- **向量搜尋**：啟用 `pgvector` 擴充，將文章內容轉化為 Embedding 向量存儲，以實現語義搜尋。
- **身分驗證**：Auth.js (NextAuth) 保護 `/dashboard` 路徑，支援 GitHub/Google 登入。
- **圖片存儲**：初始使用本地 `public/uploads`，透過抽象接口準備未來遷移至 Cloudflare R2。

### 前端表現層
- **渲染策略**：優先使用 SSG (靜態生成) 並搭配 ISR (增量更新) 確保文章加載速度。
- **UI 組件**：Tailwind CSS 加上 Shadcn UI 提供現代化美感與 A11y 支持。
- **PWA**：使用 `next-pwa` 配置 Service Workers 緩存關鍵資源與 API 回應。

## 2. 資料模型 (Data Model)
- `Post`: 標題、內容 (Markdown)、Slug、SEO 元數據、狀態、發布時間。
- `PostVersion`: 文章內容快照、Diff、作者 ID、時間戳。
- `Category` / `Tag`: 多對多關聯文章。
- `Media`: 圖片路徑、AI 生成的 Alt 描述、尺寸資訊。
- `Embedding`: 關聯 `Post` 的向量數據。

## 3. 關鍵工作流
1. **創作流**：管理員在 Dashboard 撰寫 Markdown -> 自動保存版本 -> 儲存至 DB。
2. **AI 自動化**：發布時觸發 AI 生成摘要與標籤 -> 生成 Embedding -> 更新向量索引。
3. **讀者流**：使用者訪問 Slug -> ISR 檢查快取 -> 渲染 HTML -> 更新 PWA 本地快取。
4. **搜尋流**：輸入查詢 -> 向量化 -> `pgvector` 計算餘弦相似度 -> 返回精準結果。
