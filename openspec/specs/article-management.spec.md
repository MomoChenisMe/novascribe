# 規格:文章管理功能

## 概述
文章管理模組提供完整的 CRUD 操作、Markdown 編輯器、版本控制與發布管理功能。

## 功能需求

### FR-ARTICLE-001: 文章列表頁
**描述**: 顯示所有文章的列表,支援篩選與排序  
**優先級**: P0 (必須)

#### 顯示欄位
- 文章標題
- 作者
- 發布狀態 (草稿/已發布/排程)
- 分類與標籤
- 建立時間
- 最後修改時間
- 操作按鈕 (編輯/刪除/複製)

#### 篩選功能
- 依狀態篩選:全部/草稿/已發布/排程
- 依分類篩選
- 依標籤篩選
- 依時間範圍篩選

#### 排序功能
- 依建立時間排序 (預設:最新優先)
- 依最後修改時間排序
- 依標題字母排序

#### 搜尋功能
- 全文檢索:標題、內容、作者
- 支援模糊搜尋
- 即時搜尋 (Debounce 300ms)

#### 批次操作
- 多選文章
- 批次刪除
- 批次變更狀態
- 批次移動分類

#### 分頁
- 每頁顯示 20 筆
- 支援頁碼導航
- 支援跳頁輸入

---

### FR-ARTICLE-002: Markdown 編輯器
**描述**: 提供功能完整的 Markdown 編輯器,支援即時預覽  
**優先級**: P0 (必須)

#### 編輯器功能
1. **基礎編輯**
   - 語法高亮
   - 行號顯示
   - 自動縮排
   - 括號配對
   - 搜尋與取代 (Ctrl+F / Cmd+F)

2. **工具列**
   - 標題插入 (H1-H6)
   - 粗體、斜體、刪除線
   - 引用區塊
   - 程式碼區塊 (支援語言選擇)
   - 有序/無序列表
   - 連結插入
   - 圖片插入 (連結或上傳)
   - 表格插入
   - 分隔線

3. **即時預覽**
   - 分割視窗模式 (左編輯/右預覽)
   - 同步滾動
   - 預覽樣式與前端一致
   - 支援代碼高亮 (Prism.js)

4. **快捷鍵**
   - `Ctrl/Cmd + S`: 儲存草稿
   - `Ctrl/Cmd + Shift + P`: 發布
   - `Ctrl/Cmd + B`: 粗體
   - `Ctrl/Cmd + I`: 斜體
   - `Ctrl/Cmd + K`: 插入連結
   - `Tab`: 增加縮排
   - `Shift + Tab`: 減少縮排

#### 自動儲存
- 每 30 秒自動儲存草稿
- 顯示最後儲存時間
- 網路斷線時,儲存至 LocalStorage

#### 圖片上傳
- 支援拖拽上傳
- 支援貼上剪貼簿圖片
- 自動壓縮 (品質 80%, 最大寬度 1920px)
- 上傳進度顯示
- 成功後自動插入 Markdown 語法

---

### FR-ARTICLE-003: 文章元數據編輯
**描述**: 編輯文章的基本資訊與元數據  
**優先級**: P0 (必須)

#### 基本資訊
- **標題** (必填,最多 100 字元)
- **Slug** (URL 路徑,自動生成或手動編輯)
- **摘要** (選填,最多 200 字元)
- **作者** (預設為當前使用者)
- **發布時間** (可設定排程發布)

#### 分類與標籤
- **分類** (單選,必填)
  - 下拉選單選擇現有分類
  - 支援新增分類 (需 Admin 權限)
- **標籤** (多選,選填)
  - 輸入框支援自動完成
  - 支援新增標籤
  - AI 建議標籤 (基於文章內容)

#### SEO 設定
- **Meta Title** (選填,預設使用文章標題)
- **Meta Description** (選填,可使用 AI 生成)
- **Open Graph 圖片** (選填,可上傳或選擇現有圖片)
- **Canonical URL** (選填,用於避免重複內容)

#### 進階設定
- **允許評論** (預設開啟)
- **置頂文章** (顯示在首頁頂部)
- **精選文章** (顯示在側邊欄)
- **密碼保護** (設定密碼,僅授權讀者可閱讀)

---

### FR-ARTICLE-004: 發布管理
**描述**: 管理文章的發布狀態與排程  
**優先級**: P0 (必須)

#### 發布狀態
1. **草稿 (Draft)**
   - 僅創作者可見
   - 不出現在前端
   - 可隨時編輯

2. **已發布 (Published)**
   - 公開可見
   - 顯示在前端文章列表
   - 編輯後需重新發布

3. **排程發布 (Scheduled)**
   - 設定未來發布時間
   - 到達時間自動轉為已發布
   - 可提前取消排程

4. **已下架 (Archived)**
   - 不再顯示在前端
   - 保留在後台,可重新發布
   - URL 返回 410 Gone

#### 發布操作
- **儲存草稿**: 儲存但不發布
- **立即發布**: 立即公開文章
- **排程發布**: 設定未來發布時間
- **取消發布**: 將已發布文章轉為草稿
- **下架**: 將文章移至下架狀態

#### 排程機制
- 使用 Cron Job 檢查排程文章 (每分鐘執行)
- 到達發布時間自動變更狀態
- 發送通知給作者

---

### FR-ARTICLE-005: 版本控制與回溯
**描述**: 類似 Git 的文章修改歷史追蹤與回溯功能  
**優先級**: P1 (高)

#### 版本記錄
- 每次「儲存」或「發布」時建立版本快照
- 記錄內容:
  - 完整文章內容 (Markdown)
  - 元數據 (標題、分類、標籤、SEO)
  - 作者與時間戳記
  - 版本號 (自動遞增)

#### 版本比對
- 顯示版本歷史列表
- 選擇兩個版本進行 Diff 比對
- 以紅綠色標註新增/刪除/修改內容
- 支援並排顯示

#### 回溯功能
- 選擇任一歷史版本
- 預覽該版本內容
- 一鍵還原至該版本
- 還原後建立新版本 (不覆蓋歷史)

#### 版本管理
- 最多保留 50 個版本
- 超過 50 個時,自動刪除最舊版本
- 重要版本可標記為「不刪除」
- Admin 可手動清理版本

---

### FR-ARTICLE-006: 文章刪除
**描述**: 安全刪除文章,支援軟刪除與永久刪除  
**優先級**: P0 (必須)

#### 軟刪除
- 點擊「刪除」時,文章移至「垃圾桶」
- 保留 30 天後自動永久刪除
- 期間內可隨時還原

#### 永久刪除
- 從垃圾桶中「永久刪除」
- 刪除所有關聯數據:
  - 文章內容
  - 版本歷史
  - 相關圖片 (可選)
  - 評論 (如有)
- 不可還原,需二次確認

#### 批次刪除
- 支援多選批次刪除
- 批次刪除時,全部移至垃圾桶
- 需確認對話框

---

## 非功能需求

### NFR-ARTICLE-001: 效能
- 文章列表載入時間 < 1 秒 (100 筆文章)
- 編輯器開啟時間 < 500ms
- 自動儲存不影響編輯流暢度
- 預覽渲染時間 < 200ms

### NFR-ARTICLE-002: 可用性
- 編輯器支援鍵盤導航
- 工具列圖示直觀易懂
- 錯誤訊息清晰且提供解決方案
- 支援復原 (Undo) 與重做 (Redo)

### NFR-ARTICLE-003: 資料完整性
- 自動儲存失敗時,提示使用者
- 發布前驗證必填欄位
- Slug 重複時自動加上編號
- 圖片上傳失敗時不中斷編輯流程

---

## 資料模型

### Article
```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown
  excerpt: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt: Date | null;
  scheduledAt: Date | null;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  allowComments: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### ArticleVersion
```typescript
interface ArticleVersion {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  metadata: Record<string, any>;
  authorId: string;
  isProtected: boolean; // 標記為不刪除
  createdAt: Date;
}
```

---

## API 端點

### GET /api/admin/articles
取得文章列表

**Query Params**:
- `page`: 頁碼 (預設 1)
- `limit`: 每頁筆數 (預設 20)
- `status`: 狀態篩選
- `category`: 分類篩選
- `tag`: 標籤篩選
- `search`: 搜尋關鍵字
- `sort`: 排序欄位 (createdAt|updatedAt|title)
- `order`: 排序方向 (asc|desc)

**回應**:
```json
{
  "articles": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### GET /api/admin/articles/:id
取得單篇文章詳細資訊

### POST /api/admin/articles
建立新文章

**Body**:
```json
{
  "title": "文章標題",
  "content": "Markdown 內容",
  "categoryId": "uuid",
  "tags": ["tag1", "tag2"],
  "status": "draft"
}
```

### PUT /api/admin/articles/:id
更新文章

### DELETE /api/admin/articles/:id
軟刪除文章 (移至垃圾桶)

### DELETE /api/admin/articles/:id/permanent
永久刪除文章

### POST /api/admin/articles/:id/restore
從垃圾桶還原文章

### POST /api/admin/articles/:id/publish
發布文章

### GET /api/admin/articles/:id/versions
取得文章版本歷史

### POST /api/admin/articles/:id/versions/:versionId/restore
還原至指定版本

---

## 測試案例

### TC-ARTICLE-001: 建立新文章
1. 點擊「新增文章」按鈕
2. 輸入標題與內容
3. 選擇分類與標籤
4. 點擊「儲存草稿」
5. **預期**: 文章建立成功,狀態為草稿
6. **預期**: 自動產生 Slug

### TC-ARTICLE-002: Markdown 編輯器
1. 開啟編輯器
2. 輸入 Markdown 語法:標題、列表、程式碼
3. **預期**: 語法高亮正常
4. **預期**: 即時預覽正確渲染
5. **預期**: 同步滾動運作正常

### TC-ARTICLE-003: 圖片上傳
1. 拖拽圖片至編輯器
2. **預期**: 顯示上傳進度
3. **預期**: 上傳成功後自動插入 Markdown 語法
4. **預期**: 預覽顯示圖片

### TC-ARTICLE-004: 自動儲存
1. 開啟編輯器並輸入內容
2. 等待 30 秒
3. **預期**: 顯示「草稿已儲存」提示
4. **預期**: 刷新頁面後內容保留

### TC-ARTICLE-005: 發布文章
1. 編輯文章內容
2. 點擊「發布」按鈕
3. **預期**: 狀態變更為已發布
4. **預期**: 前端可見該文章

### TC-ARTICLE-006: 版本回溯
1. 編輯文章並儲存多次
2. 開啟版本歷史
3. **預期**: 顯示所有版本
4. 選擇舊版本還原
5. **預期**: 內容還原至該版本
6. **預期**: 建立新版本記錄

### TC-ARTICLE-007: 軟刪除與還原
1. 刪除一篇文章
2. **預期**: 文章移至垃圾桶
3. 從垃圾桶還原
4. **預期**: 文章回到原狀態

---

## 驗收標準

- [ ] 文章列表正確顯示所有文章
- [ ] 篩選與排序功能正常
- [ ] Markdown 編輯器支援所有基礎語法
- [ ] 即時預覽與同步滾動正常
- [ ] 圖片上傳成功且路徑正確
- [ ] 自動儲存運作正常
- [ ] 發布、排程、下架功能正常
- [ ] 版本控制記錄所有變更
- [ ] 版本比對與回溯功能正常
- [ ] 軟刪除與還原功能正常
- [ ] 所有 API 端點正確回應
- [ ] 所有測試案例通過
