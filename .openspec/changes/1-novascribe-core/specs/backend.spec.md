# 規格：後台管理介面 (PRD 3.2 & 3.3)

## 1. 儀表板 (Dashboard)
- **數據統計**：串接 Google Analytics Data API，顯示近 30 天造訪、熱門文章趨勢。
- **內容健康度**：自動掃描失效連結、缺失 Meta 描述或圖片 Alt 標籤的文章並彙整。
- **驗收標準 (AC)**：
    - 登入後首頁需在 2 秒內顯示數據概覽。
    - 健康檢查報告需列出所有「待修復」文章連結。

## 2. 文章管理 (Content Management)
- **編輯器**：支援 Markdown 的全屏編輯器，具備實時預覽、拖拽上傳圖片功能。
- **狀態管理**：草稿、已發布、排程發布（未來擴充）。
- **版本控制**：實作類似 Git 的內容版本快照，支援查看差異（Diff）與一鍵回溯（Restore）。
- **驗收標準 (AC)**：
    - 編輯器需支援常用快速鍵（如 Ctrl+S 儲存）。
    - 版本回溯後，編輯器應立即載入該版本內容。

## 3. 圖片與多媒體管理 (Media Management)
- **上傳流**：支援上傳至本地 `public/uploads`，預留 R2/S3 擴充接口。
- **AI 助手**：上傳時自動調用 AI (OpenAI/Gemini) 生成精準的圖片 Alt Text 與 Caption，提升 Accessibility。
- **驗收標準 (AC)**：
    - 圖片上傳上限為 5MB，支援 WebP 自動轉換。
    - AI 生成的 Alt Text 需可由人工手動編輯微調。

## 4. SEO 與網站設定 (SEO & Settings)
- **全局設定**：管理 GA 追蹤碼、GSC 驗證碼、網站名稱與 Favicon。
- **文章層級**：每篇文章可獨立自定義 URL Slug、Canonical URL 與 OG 圖片。
- **自動化**：自動生成 `sitemap.xml` 與 `robots.txt`。
- **驗收標準 (AC)**：
    - 修改 SEO 設定後，應觸發 ISR 重新驗證受影響的頁面。
    - Sitemap 應符合 Google Search Console 標準格式。

## 5. 創新與 AI 功能 (AI Features)
- **自動摘要**：根據文章內容自動生成摘要 (Summary) 用於 Meta Description。
- **智慧標籤**：AI 分析內容後自動建議分類與標籤。
- **語音朗讀 (TTS)**：串接 OpenAI/ElevenLabs 為文章生成語音版本（選配）。
- **驗收標準 (AC)**：
    - 自動摘要長度需控制在 150-160 字元內。
    - 智慧標籤建議應允許使用者一鍵採納或拒絕。

## 6. 資料庫與安全性 (Database & Security)
- **PostgreSQL**：定義 User, Post, Category, Tag, PostVersion 等 Schema。
- **向量擴充**：啟用 `pgvector` 存儲文章 Embedding 以支援語義搜尋。
- **認證**：使用 Auth.js (NextAuth) 進行後台保護，目前暫不要求多因子認證 (MFA)。
- **非功能性需求 (NFR)**：
    - **安全性**：後台所有 API 需經過 Session 校驗，防止 CSRF 攻擊。
    - **可用性**：資料庫需定期備份，支援災難恢復。

