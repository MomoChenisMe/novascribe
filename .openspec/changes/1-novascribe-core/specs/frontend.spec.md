# 規格：前端讀者介面 (PRD 3.1)

## 1. 首頁 (Homepage)
- **文章列表**：支援網格/列表切換，實作分頁與無限滾動（可切換）。
- **優化**：使用 `next/image` 進行圖片延遲載入與 WebP 轉換。
- **導覽**：側邊欄分類導覽、熱門文章推薦區塊、標籤雲。
- **SEO**：包含 JSON-LD 麵包屑導航與網站搜尋框定義。

## 2. 文章詳情頁 (Article Details)
- **渲染**：整合 `react-markdown` 支援 GFM、代碼高亮（`rehype-highlight`）、數學公式（`remark-math`）。
- **目錄 (TOC)**：自動根據標題生成側邊或頂部導覽，支援捲動監聽（Scroll Spy）。
- **SEO 元數據**：動態注入 Meta Title, Description, Open Graph (OG) 以及文章結構化數據 (Schema.org Article)。
- **沉浸式閱讀模式**：一鍵排除側邊欄、導覽列，僅保留純粹內容與調整字體大小功能。

## 3. 搜尋功能 (Search)
- **介面**：全站全域搜尋框，支援即時回饋。
- **語義搜尋**：整合後端 `pgvector` 提供 AI 驅動的相似度搜尋，非單純關鍵字匹配。

## 4. 靜態頁面 (Static Pages)
- **關於我**：由 Markdown 驅動的個人介紹頁。
- **聯絡頁**：包含基本的聯絡資訊與表單（選配）。

## 5. PWA 與離線支持 (PWA & Offline)
- **Service Workers**：實作快取策略，確保讀者在斷網時仍能閱讀已造訪的文章。
- **安裝支援**：提供 A2HS (Add to Home Screen) 功能，模擬原生 App 體驗。

## 6. 技術指標
- **Core Web Vitals**：LCP < 2.5s, CLS < 0.1, FID < 100ms。
- **RWD**：完美適配手機 (Mobile-first)、平板與寬螢幕。
