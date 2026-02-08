# 規格:權限管理與社群互動熱圖

## 第一部分:權限管理功能

### 概述
權限管理模組使用 Auth.js 提供身份驗證與角色授權,確保後台安全性。

### FR-AUTH-001: 身份驗證
**描述**: 使用 Auth.js 實現登入與 Session 管理  
**優先級**: P0 (必須)

#### 認證方式
1. **電子郵件 + 密碼**
   - 最小密碼長度:8 字元
   - 必須包含:大小寫字母、數字
   - 支援忘記密碼流程 (發送重設連結)

2. **OAuth 登入** (選填)
   - Google OAuth
   - GitHub OAuth
   - 僅限已授權的帳號

#### 登入流程
1. 訪問 `/admin/login`
2. 輸入電子郵件與密碼
3. 驗證成功後,建立 Session (有效期 7 天)
4. 重定向至儀表板

#### Session 管理
- 使用 JWT Token 儲存 Session
- Token 包含:userId, role, email
- 閒置 30 分鐘自動登出
- 支援「記住我」功能 (延長至 30 天)

#### 安全措施
- 密碼使用 bcrypt 雜湊 (Salt Rounds: 12)
- 登入失敗 5 次,帳號鎖定 15 分鐘
- 支援 2FA (Two-Factor Authentication, 選填功能)

---

### FR-AUTH-002: 角色與權限
**描述**: 定義不同角色及其權限範圍  
**優先級**: P0 (必須)

#### 角色定義
1. **Admin (管理員)**
   - 完整權限
   - 管理使用者與角色
   - 修改網站設定
   - 刪除任何文章
   - 查看所有統計數據

2. **Editor (編輯)**
   - 建立、編輯、發布文章
   - 管理自己的文章
   - 上傳與管理圖片
   - 查看基本統計數據
   - 無法訪問系統設定

3. **Viewer (觀察者)**
   - 唯讀權限
   - 查看文章與統計
   - 無法建立或編輯內容

#### 權限控制
- 使用 RBAC (Role-Based Access Control)
- 每個 API 端點檢查權限
- 前端根據角色顯示/隱藏功能

#### 權限矩陣
| 功能 | Admin | Editor | Viewer |
|------|-------|--------|--------|
| 檢視儀表板 | ✅ | ✅ | ✅ |
| 建立文章 | ✅ | ✅ | ❌ |
| 編輯自己的文章 | ✅ | ✅ | ❌ |
| 編輯他人的文章 | ✅ | ❌ | ❌ |
| 刪除文章 | ✅ | ❌ | ❌ |
| 上傳圖片 | ✅ | ✅ | ❌ |
| 管理圖片 | ✅ | ✅ (自己上傳的) | ❌ |
| SEO 設定 (全域) | ✅ | ❌ | ❌ |
| SEO 設定 (文章) | ✅ | ✅ | ❌ |
| 查看 GA 統計 | ✅ | ✅ | ✅ |
| 管理使用者 | ✅ | ❌ | ❌ |
| 系統設定 | ✅ | ❌ | ❌ |

---

### FR-AUTH-003: 使用者管理
**描述**: Admin 可管理所有使用者帳號  
**優先級**: P1 (高)

#### 使用者列表
- 顯示所有使用者
- 每筆顯示:姓名、Email、角色、狀態、最後登入時間
- 支援搜尋與篩選 (依角色、狀態)

#### 使用者操作
- **新增使用者**:輸入 Email、姓名、角色,系統發送邀請信
- **編輯使用者**:修改姓名、角色
- **停用使用者**:停用後無法登入,但資料保留
- **重設密碼**:發送重設密碼連結至 Email
- **刪除使用者**:永久刪除 (需二次確認)

#### 邀請機制
- Admin 輸入 Email 與角色
- 系統發送邀請信 (包含設定密碼連結)
- 邀請連結 24 小時內有效
- 使用者設定密碼後,帳號啟用

---

### FR-AUTH-004: 審計日誌
**描述**: 記錄所有重要操作,供審計追蹤  
**優先級**: P2 (中)

#### 記錄項目
- 使用者登入/登出
- 文章建立/編輯/刪除
- 圖片上傳/刪除
- 系統設定變更
- 使用者管理操作

#### 日誌欄位
- 時間戳記
- 使用者 ID 與姓名
- 操作類型 (login, create_article, delete_image 等)
- 影響的資源 ID
- IP 位址
- User-Agent

#### 日誌查詢
- 依時間範圍篩選
- 依使用者篩選
- 依操作類型篩選
- 支援匯出 CSV

---

## 第二部分:社群互動熱圖功能

### 概述
社群互動熱圖匿名追蹤讀者閱讀深度與停留點,以視覺化方式呈現,幫助創作者優化內容。

### FR-HEATMAP-001: 讀者行為追蹤
**描述**: 匿名記錄讀者在文章頁面的互動行為  
**優先級**: P1 (高)

#### 追蹤項目
1. **滾動深度 (Scroll Depth)**
   - 記錄讀者滾動到頁面的百分比 (0-100%)
   - 每滾動 10% 觸發一次記錄
   - 分段統計:0-25%, 25-50%, 50-75%, 75-100%

2. **停留熱點 (Dwell Points)**
   - 記錄讀者停留超過 3 秒的段落
   - 使用 Intersection Observer 偵測可見區域
   - 記錄段落 ID 與停留秒數

3. **點擊事件**
   - 記錄連結點擊 (內部連結/外部連結)
   - 記錄圖片點擊 (放大查看)
   - 記錄複製文字事件

4. **退出點 (Exit Points)**
   - 記錄讀者離開頁面時的滾動位置
   - 統計最常見的退出點

#### 隱私保護
- 完全匿名,不記錄個人識別資訊
- 僅記錄 Session ID (隨機生成,不可逆)
- 資料保留 90 天後自動清理
- 符合 GDPR 與 CCPA 規範
- 前端顯示 Cookie 同意橫幅

#### 資料收集機制
- 使用輕量級 JavaScript 追蹤腳本
- 事件批次發送,減少請求次數
- 失敗時使用 LocalStorage 暫存,下次重試

---

### FR-HEATMAP-002: 熱圖視覺化
**描述**: 在後台以視覺化方式呈現讀者行為數據  
**優先級**: P1 (高)

#### 熱圖類型
1. **滾動深度熱圖**
   - 橫條圖顯示各深度區間的讀者比例
   - 顏色區分:紅 (高) → 黃 (中) → 綠 (低)
   - 顯示平均滾動深度百分比

2. **停留熱點熱圖**
   - 在文章預覽上疊加顏色遮罩
   - 顏色深度代表停留時間長短
   - 點擊熱點可查看詳細統計

3. **點擊熱圖**
   - 在文章預覽上標註點擊熱點
   - 顯示點擊次數
   - 區分內部連結/外部連結/圖片

4. **退出點熱圖**
   - 標註最常見的退出段落
   - 顯示退出比例

#### 互動功能
- 切換熱圖類型 (下拉選單)
- 調整時間範圍 (本週/本月/全部)
- 匯出報告 (PDF / PNG)

---

### FR-HEATMAP-003: 數據報告
**描述**: 提供詳細的數據報告與洞察建議  
**優先級**: P2 (中)

#### 報告內容
1. **閱讀完成率**
   - 統計滾動至 100% 的讀者比例
   - 與平均值比較

2. **平均停留時間**
   - 整篇文章的平均停留時間
   - 各段落的平均停留時間

3. **熱門段落**
   - 停留時間最長的前 5 個段落
   - 點擊次數最多的連結

4. **冷門段落**
   - 快速略過的段落
   - 建議優化或刪除

5. **AI 洞察建議**
   - 基於數據分析,AI 提供內容優化建議
   - 範例:「段落 3 退出率高,建議精簡或增加吸引力」

#### 報告匯出
- 支援 PDF 匯出
- 包含圖表與數據表格
- 可分享給團隊成員

---

### FR-HEATMAP-004: A/B 測試支援
**描述**: 支援同一篇文章的 A/B 版本測試  
**優先級**: P3 (低,未來迭代)

#### 測試機制
- 建立文章的 A/B 版本 (不同標題/內文/圖片)
- 隨機分配讀者至版本 A 或 B
- 分別追蹤兩個版本的熱圖數據

#### 結果比較
- 並排顯示 A/B 版本熱圖
- 統計指標比較 (完成率、停留時間、點擊率)
- 建議採用表現較佳的版本

---

## 非功能需求

### NFR-AUTH-001: 安全性
- 密碼雜湊使用 bcrypt (Salt Rounds: 12)
- Session Token 使用 JWT,包含過期時間
- 所有敏感操作記錄審計日誌
- 支援 HTTPS 連線
- 定期安全掃描與漏洞修補

### NFR-AUTH-002: 效能
- 登入驗證時間 < 500ms
- Session 驗證時間 < 50ms
- 權限檢查不影響 API 回應時間

### NFR-HEATMAP-001: 效能
- 追蹤腳本大小 < 10KB (Gzipped)
- 不影響頁面載入速度 (異步載入)
- 事件發送批次化,減少請求次數
- 熱圖渲染時間 < 2 秒

### NFR-HEATMAP-002: 隱私合規
- 符合 GDPR 規範 (匿名追蹤,資料可刪除)
- 符合 CCPA 規範 (提供退出機制)
- 顯示 Cookie 同意橫幅
- 提供隱私政策連結

---

## 資料模型

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  password: string; // bcrypt 雜湊
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string; // login, create_article, delete_image 等
  resourceType: string; // article, image, user 等
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### HeatmapEvent
```typescript
interface HeatmapEvent {
  id: string;
  articleId: string;
  sessionId: string; // 匿名 Session
  eventType: 'scroll' | 'dwell' | 'click' | 'exit';
  eventData: {
    scrollDepth?: number; // 0-100
    paragraphId?: string;
    dwellSeconds?: number;
    linkUrl?: string;
    exitDepth?: number;
  };
  createdAt: Date;
}
```

### HeatmapSummary
```typescript
interface HeatmapSummary {
  articleId: string;
  totalViews: number;
  avgScrollDepth: number;
  completionRate: number; // 滾動至 100% 的比例
  avgDwellTime: number; // 秒
  topParagraphs: Array<{
    paragraphId: string;
    dwellTime: number;
  }>;
  topClicks: Array<{
    linkUrl: string;
    clicks: number;
  }>;
  exitPoints: Array<{
    depth: number;
    count: number;
  }>;
  lastUpdated: Date;
}
```

---

## API 端點

### 權限管理 API

#### POST /api/auth/login
使用者登入

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**回應**:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "name": "使用者名稱",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
使用者登出

#### GET /api/admin/users
取得使用者列表 (Admin only)

#### POST /api/admin/users
建立新使用者 (Admin only)

#### PUT /api/admin/users/:id
更新使用者資訊 (Admin only)

#### DELETE /api/admin/users/:id
刪除使用者 (Admin only)

#### GET /api/admin/audit-logs
取得審計日誌 (Admin only)

---

### 熱圖 API

#### POST /api/public/heatmap/track
追蹤讀者行為事件

**Body**:
```json
{
  "articleId": "uuid",
  "sessionId": "random_session_id",
  "eventType": "scroll",
  "eventData": {
    "scrollDepth": 50
  }
}
```

#### GET /api/admin/heatmap/:articleId/summary
取得文章熱圖摘要

**回應**:
```json
{
  "totalViews": 1250,
  "avgScrollDepth": 68.5,
  "completionRate": 0.42,
  "avgDwellTime": 125,
  "topParagraphs": [...]
}
```

#### GET /api/admin/heatmap/:articleId/events
取得原始事件數據 (用於渲染熱圖)

**Query Params**:
- `period`: 時間範圍 (week|month|all)
- `eventType`: 事件類型篩選

---

## 測試案例

### TC-AUTH-001: 登入流程
1. 訪問 `/admin/login`
2. 輸入正確的 Email 與密碼
3. **預期**: 登入成功,重定向至儀表板
4. **預期**: Session Token 已設定

### TC-AUTH-002: 權限控制
1. 使用 Editor 帳號登入
2. 嘗試訪問 `/admin/users` (使用者管理)
3. **預期**: 顯示「權限不足」錯誤

### TC-AUTH-003: 使用者管理
1. 使用 Admin 帳號登入
2. 進入使用者管理頁面
3. 點擊「新增使用者」
4. 輸入 Email 與角色,點擊「發送邀請」
5. **預期**: 系統發送邀請信
6. **預期**: 使用者列表顯示新使用者 (狀態:Pending)

### TC-HEATMAP-001: 行為追蹤
1. 訪問任一文章頁面
2. 滾動至 50% 位置
3. **預期**: 後台記錄滾動事件
4. 停留在某段落超過 3 秒
5. **預期**: 後台記錄停留事件

### TC-HEATMAP-002: 熱圖顯示
1. 使用 Admin 帳號登入
2. 選擇一篇有數據的文章
3. 開啟熱圖頁面
4. **預期**: 顯示滾動深度熱圖
5. 切換至停留熱點熱圖
6. **預期**: 文章預覽上疊加顏色遮罩

### TC-HEATMAP-003: 數據報告
1. 開啟某篇文章的熱圖報告
2. **預期**: 顯示完成率、停留時間等指標
3. **預期**: 列出熱門段落與冷門段落
4. 點擊「匯出 PDF」
5. **預期**: 下載包含圖表的 PDF 報告

---

## 驗收標準

### 權限管理
- [ ] 使用者可使用 Email + 密碼登入
- [ ] Session 管理正常,閒置 30 分鐘自動登出
- [ ] 三種角色權限正確運作
- [ ] Admin 可管理所有使用者
- [ ] 邀請機制正常運作
- [ ] 審計日誌記錄所有重要操作
- [ ] 密碼安全儲存 (bcrypt)

### 社群互動熱圖
- [ ] 追蹤腳本正常運作,不影響頁面載入
- [ ] 滾動深度、停留熱點、點擊事件正確記錄
- [ ] 熱圖視覺化正確呈現
- [ ] 數據報告提供有價值的洞察
- [ ] 符合隱私規範,資料匿名處理
- [ ] Cookie 同意橫幅正常顯示
- [ ] 所有 API 端點正確回應
- [ ] 所有測試案例通過
