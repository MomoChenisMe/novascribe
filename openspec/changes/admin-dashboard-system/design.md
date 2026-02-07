# 技術設計：後台管理系統 (Admin Dashboard System)

## 系統架構

NovaScribe 後台採用 Next.js 15+ App Router 架構，利用 Server Components 進行資料獲取，並結合 Client Components 處理互動式介面（如編輯器、圖表）。

### 核心組件
- **Framework**: Next.js 15.1+
- **UI Components**: Shadcn/UI + Tailwind CSS
- **State Management**: React Context / Nuqs (for URL state)
- **Forms**: React Hook Form + Zod
- **Editor**: Lexical 或 Tiptap (選定 Tiptap 因其對 Markdown 支援較佳)
- **Charts**: Recharts (用於儀表板與熱圖)
- **Icons**: Lucide React

## 資料庫設計 (PostgreSQL)

### Table: articles
- `id`: uuid (PK)
- `title`: varchar(255)
- `slug`: varchar(255) (Unique, Index)
- `content`: text (Markdown)
- `excerpt`: text
- `author_id`: uuid (FK -> users.id)
- `category_id`: uuid (FK -> categories.id)
- `tags`: text[] (Index)
- `status`: article_status (enum: draft, published, scheduled, archived)
- `published_at`: timestamp
- `scheduled_at`: timestamp
- `meta_title`: varchar(255)
- `meta_description`: text
- `og_image`: text
- `is_pinned`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

### Table: article_versions
- `id`: uuid (PK)
- `article_id`: uuid (FK)
- `version_number`: int
- `content`: text
- `metadata`: jsonb
- `created_at`: timestamp

### Table: images
- `id`: uuid (PK)
- `filename`: varchar(255)
- `path`: text
- `alt_text`: text
- `size`: bigint
- `dimensions`: jsonb (width, height)
- `created_at`: timestamp

### Table: heatmap_events
- `id`: uuid (PK)
- `article_id`: uuid (FK)
- `session_id`: varchar(255)
- `event_type`: varchar(50)
- `data`: jsonb
- `created_at`: timestamp

## API 路由設計 (Route Handlers)

採用 `/api/admin/*` 命名空間，並由 Middleware 進行權限校驗。

- `GET /api/admin/stats`: 聚合資料庫與 GA4 API 數據。
- `POST /api/admin/articles`: 支援 TDD 驗證的文章建立。
- `POST /api/admin/images/upload`: 處理本地檔案串流上傳與 AI 分析 (呼叫 OpenAI API)。

## 安全性實作

1. **身分驗證**: 整合 `Auth.js (NextAuth.js) v5`。
2. **權限管控**:
   - 使用 Middleware 阻斷未授權進入 `/admin`。
   - 在 Server Action/Route Handler 層級檢查角色權限。
3. **輸入驗證**: 所有的 API 輸入皆通過 Zod Schema 驗證。
4. **隱私**: 熱圖數據 Session ID 進行雜湊處理，不紀錄 IP。

## AI 整合路徑

- **Alt Text 生成**: 當圖片上傳完成後，觸發 Background Job (或 Edge Function) 調用 `gpt-4o-mini` 進行視覺分析。
- **SEO 建議**: 編輯器側邊欄提供按鈕，發送內容片段至 AI 獲取摘要。

## 效能優化

- **ISR**: 前端文章頁使用 Incremental Static Regeneration。
- **Optimistic Updates**: 文章狀態切換使用 React `useOptimistic` 提升體感速度。
- **Image Optimization**: 使用 `next/image` 並在後台預先生成不同尺寸的縮圖。
