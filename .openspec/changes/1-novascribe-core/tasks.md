# 任務清單：NovaScribe 核心實作

## 第一階段：基礎架構建置
- [ ] 初始化 Next.js 16.1 (App Router) 專案並配置 Tailwind CSS <!-- id: 0 -->
- [ ] 建立 PostgreSQL 資料庫並配置 Prisma ORM <!-- id: 1 -->
- [ ] 啟用並配置 `pgvector` 擴充與向量運算邏輯 <!-- id: 2 -->
- [ ] 整合 Auth.js 並實作後台登入保護 (Middleware，暫不包含 MFA) <!-- id: 3 -->

## 第二階段：後台管理功能 (Dashboard)
- [ ] 實作文章 CRUD API 與分頁管理介面 <!-- id: 4 -->
- [ ] 整合 Markdown 編輯器與即時預覽功能 <!-- id: 5 -->
- [ ] 實作文章版本控制 (Snapshot) 與內容對比功能 <!-- id: 6 -->
- [ ] 實作本地圖片上傳功能並整合 AI 自動生成 Alt Text <!-- id: 7 -->

## 第三階段：前端讀者介面 (Reader)
- [ ] 實作首頁文章網格與分類導覽佈局 <!-- id: 8 -->
- [ ] 實作文章詳情頁 (SSG + ISR) 與 Markdown 高度渲染 <!-- id: 9 -->
- [ ] 實作文章目錄 (TOC) 自動生成與捲動監聽 <!-- id: 10 -->
- [ ] 實作基於 `pgvector` 的全域語義搜尋功能 <!-- id: 11 -->

## 第四階段：SEO、性能與 PWA
- [ ] 配置動態 `sitemap.xml` 與 `robots.txt` 生成 <!-- id: 12 -->
- [ ] 整合 JSON-LD 文章結構化數據與 Meta 標籤優化 <!-- id: 13 -->
- [ ] 配置 `next-pwa` 實作 Service Workers 離線閱讀支援 <!-- id: 14 -->
- [ ] 進行 Core Web Vitals 性能測試與優化 <!-- id: 15 -->

## 第五階段：AI 增強功能 (3.3)
- [ ] 實作 AI 自動摘要生成功能 <!-- id: 16 -->
- [ ] 實作智慧標籤與分類建議邏輯 <!-- id: 17 -->

## 第六階段：測試與部署
- [ ] 撰寫關鍵組件的 Unit Test (Jest) <!-- id: 18 -->
- [ ] 撰寫關鍵流程的 E2E Test (Playwright) <!-- id: 19 -->
- [ ] 部署至生產環境並驗證 ISR 與 PWA 功能 <!-- id: 20 -->

