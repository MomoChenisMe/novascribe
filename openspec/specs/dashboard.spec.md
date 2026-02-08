# 規格：儀表板與統計功能

## 概述
後台儀表板是創作者登入後的首頁,提供系統概覽、閱讀統計與內容健康度監控。

## 功能需求

### FR-DASH-001: 儀表板首頁
**描述**: 創作者登入後台,顯示系統儀表板  
**優先級**: P0 (必須)

#### 顯示元素
1. **快速統計卡片**
   - 總文章數
   - 本週訪客數 (來自 GA API)
   - 本月頁面瀏覽量 (來自 GA API)
   - 草稿文章數

2. **最近文章列表**
   - 顯示最新 5 篇文章
   - 每筆顯示:標題、發布狀態、建立時間
   - 點擊可直接跳轉編輯

3. **熱門文章排行**
   - 顯示本週瀏覽量前 5 名文章
   - 每筆顯示:標題、瀏覽量、跳出率
   - 數據來源:GA API

4. **內容健康度總覽**
   - 顯示內容健康度評分 (0-100)
   - 列出需要改進的文章 (評分 < 60)
   - 快速修復建議

#### 互動行為
- 點擊統計卡片可跳轉至詳細頁面
- 支援時間範圍篩選 (今日/本週/本月/本年)
- 自動刷新:每 5 分鐘更新一次 GA 數據

#### 權限
- Admin: 完整檢視權限
- Editor: 可檢視,但無法訪問系統設定
- Viewer: 唯讀權限

---

### FR-DASH-002: Google Analytics 整合
**描述**: 整合 GA4 API,取得閱讀統計數據  
**優先級**: P1 (高)

#### 技術需求
- 使用 Google Analytics Data API (GA4)
- OAuth 2.0 驗證流程
- 支援多個 GA Property 切換

#### 資料欄位
- `activeUsers`: 活躍使用者數
- `screenPageViews`: 頁面瀏覽量
- `bounceRate`: 跳出率
- `averageSessionDuration`: 平均停留時間
- `eventCount`: 事件次數

#### 快取策略
- 統計數據快取 5 分鐘
- 使用 Redis 或 Next.js Cache
- 支援手動刷新

#### 錯誤處理
- GA API 無法連線時,顯示「數據暫時無法取得」
- OAuth Token 過期時,提示重新授權
- 記錄錯誤至系統 Log

---

### FR-DASH-003: 內容健康度檢查
**描述**: 自動分析文章品質,產生健康度評分  
**優先級**: P1 (高)

#### 評分維度
1. **SEO 基礎** (30%)
   - Meta Title 是否存在且長度適中 (50-60字元)
   - Meta Description 是否存在且長度適中 (150-160字元)
   - 是否有 Open Graph 圖片

2. **內容結構** (30%)
   - 標題階層是否正確 (H1 → H2 → H3)
   - 是否有目錄結構
   - 段落長度是否適中

3. **關鍵字優化** (20%)
   - 關鍵字密度是否合理 (1-3%)
   - 關鍵字是否出現在標題與首段
   - 是否有關鍵字堆砌

4. **連結完整性** (20%)
   - 內部連結數量 (建議至少 2-3 個)
   - 外部連結是否有效
   - 是否有斷鏈 (404)

#### 評分規則
- 總分 0-100
- 80-100: 優秀 (綠色)
- 60-79: 良好 (黃色)
- 0-59: 需改進 (紅色)

#### 改進建議
- 根據扣分項目,提供具體改進建議
- 支援一鍵優化 (AI 自動填補 Meta Description)

---

### FR-DASH-004: 系統狀態監控
**描述**: 顯示系統運行狀態與資源使用情況  
**優先級**: P2 (中)

#### 監控項目
- 資料庫連線狀態
- 圖片儲存空間使用率
- API 回應時間
- 近期錯誤 Log

#### 警示機制
- 儲存空間使用率 > 80% 時,顯示警告
- 資料庫連線失敗時,顯示錯誤
- API 回應時間 > 2s 時,提示效能問題

---

## 非功能需求

### NFR-DASH-001: 效能
- 儀表板初始載入時間 < 2 秒
- GA API 資料取得時間 < 3 秒
- 支援骨架屏 (Skeleton Screen) 改善感知載入速度

### NFR-DASH-002: 響應式設計
- 支援 1920x1080 以上桌機解析度
- 支援 1024x768 平板橫向解析度
- 統計卡片使用 Grid Layout,自動適配

### NFR-DASH-003: 無障礙性
- 符合 WCAG 2.1 AA 標準
- 支援鍵盤導航
- 圖表提供替代文字描述

---

## 資料模型

### DashboardStats
```typescript
interface DashboardStats {
  totalArticles: number;
  weeklyVisitors: number;
  monthlyPageViews: number;
  draftArticles: number;
  contentHealthScore: number;
  lastUpdated: Date;
}
```

### ContentHealthReport
```typescript
interface ContentHealthReport {
  articleId: string;
  score: number;
  seoScore: number;
  structureScore: number;
  keywordScore: number;
  linkScore: number;
  suggestions: string[];
  lastChecked: Date;
}
```

---

## API 端點

### GET /api/admin/dashboard/stats
取得儀表板統計數據

**權限**: Admin, Editor, Viewer

**回應**:
```json
{
  "totalArticles": 42,
  "weeklyVisitors": 1250,
  "monthlyPageViews": 5430,
  "draftArticles": 3,
  "contentHealthScore": 78,
  "lastUpdated": "2026-02-07T05:50:00Z"
}
```

### GET /api/admin/dashboard/recent-articles
取得最近文章列表

**Query Params**:
- `limit`: 數量限制 (預設 5)

**回應**:
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "文章標題",
      "status": "published",
      "createdAt": "2026-02-06T10:00:00Z"
    }
  ]
}
```

### GET /api/admin/dashboard/top-articles
取得熱門文章排行

**Query Params**:
- `period`: 時間範圍 (today|week|month|year)
- `limit`: 數量限制 (預設 5)

**回應**:
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "文章標題",
      "pageViews": 320,
      "bounceRate": 0.45
    }
  ]
}
```

### GET /api/admin/dashboard/health-check
取得內容健康度報告

**回應**:
```json
{
  "averageScore": 78,
  "needsImprovement": [
    {
      "articleId": "uuid",
      "title": "文章標題",
      "score": 55,
      "suggestions": ["新增 Meta Description", "優化關鍵字密度"]
    }
  ]
}
```

---

## 測試案例

### TC-DASH-001: 儀表板載入
1. 使用 Admin 帳號登入
2. 導航至儀表板
3. **預期**: 顯示所有統計卡片,且數據正確
4. **預期**: 最近文章列表顯示最新 5 筆
5. **預期**: 熱門文章排行顯示本週前 5 名

### TC-DASH-002: GA API 整合
1. 前置條件:已完成 GA OAuth 授權
2. 訪問儀表板
3. **預期**: 週訪客數與月瀏覽量正確顯示
4. **預期**: 數據每 5 分鐘自動更新

### TC-DASH-003: 內容健康度檢查
1. 建立一篇缺少 Meta Description 的文章
2. 等待健康度檢查執行
3. **預期**: 該文章評分 < 80
4. **預期**: 建議列表中顯示「新增 Meta Description」

### TC-DASH-004: 權限控制
1. 使用 Viewer 帳號登入
2. 訪問儀表板
3. **預期**: 可檢視統計數據
4. 嘗試訪問系統設定
5. **預期**: 顯示「權限不足」錯誤

---

## 驗收標準

- [ ] 儀表板顯示所有必要統計卡片
- [ ] GA API 整合成功,數據正確顯示
- [ ] 內容健康度評分演算法正確
- [ ] 改進建議具體且可執行
- [ ] 權限控制正常運作
- [ ] 載入時間符合效能需求
- [ ] 響應式設計在平板與桌機上正常顯示
- [ ] 所有測試案例通過
