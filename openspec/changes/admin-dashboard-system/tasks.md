# 任務清單：後台管理系統實作

## 階段一：基礎建設 (P0)

- [x] **初始化資料庫與 Auth**
  - [x] 設計並執行 Prisma/Drizzle Schema 遷移。
  - [x] 配置 Auth.js 提供者 (Email/Password)。
  - [x] 實作 Middleware 權限阻斷邏輯。
  - [ ] **測試**: 撰寫認證單元測試，確保非管理者無法進入後台 API。

- [x] **後台介面佈局 (Layout)**
  - [x] 實作 Sidebar 與頂部導航。
  - [x] 實作響應式導航選單 (Mobile Sidebar)。
  - [x] 實作使用者設定選單 (登出、個人資訊)。

## 階段二：文章管理模組 (P0)

- [x] **文章 CRUD 邏輯**
  - [x] 實作文章列表 API (分頁、搜尋)。
  - [x] 實作 Tiptap Markdown 編輯器組件。
  - [x] 實作文章儲存與發布 Server Actions。
  - [x] **測試**: 使用 Vitest 測試文章建立邏輯，包含 Slug 自動生成驗證。

- [x] **版本控制**
  - [x] 實作儲存時自動建立 Snapshot。
  - [x] 實作版本列表與內容對比介面。

## 階段三：圖片與 SEO (P1)

- [x] **圖片上傳系統**
  - [x] 實作本地檔案儲存 API。
  - [x] 整合 OpenAI Vision API 生成 Alt Text。
  - [x] 實作圖片庫瀏覽介面。

- [x] **SEO 編輯器**
  - [x] 在編輯器側邊欄加入 SEO 欄位 (Meta Title, Description)。
  - [x] 實作 AI 摘要生成按鈕。

## 階段四：儀表板與熱圖 (P1)

- [x] **數據監控**
  - [x] 串接 GA4 Data API 並在儀表板顯示圖表。
  - [x] 實作內容健康度檢查演算法。

- [x] **互動熱圖**
  - [x] 實作前端匿名追蹤腳本 (Scroll & Click)。
  - [x] 實作後台熱圖視覺化層。
  - [ ] **測試**: 驗證追蹤事件是否正確存入資料庫且不包含敏感個資。

## 階段五：最後校驗 (P2)

- [x] **全系統驗證**
  - [x] 執行 OpenSpec /opsx:verify 確保實作符合規格。
  - [x] 進行 RWD 跨裝置測試 (手機、平板、桌機)。
  - [x] 執行 Lighthouse SEO 與效能檢測。
