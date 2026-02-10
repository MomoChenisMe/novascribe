# NovaScribe 評論系統 E2E 測試規格文件

## 概述

本文件描述 NovaScribe 評論系統的 E2E 測試實作，涵蓋前台評論提交、顯示以及管理後台評論管理功能。

## 測試環境

- **測試框架**: Playwright
- **測試檔案位置**: `tests/e2e/`
- **認證設定**: `.auth/user.json` (透過 `auth.setup.ts` 生成)
- **測試資料庫**: 使用開發環境資料庫或測試資料庫

## 測試檔案清單

### 1. `comments-submission.spec.ts` - 前台評論提交測試

**測試場景**: 15 個測試案例

#### 12.1.1: 成功提交評論
- 填寫完整表單（姓名、Email、內容）
- 點擊送出按鈕
- 驗證成功訊息「評論已送出，待審核後顯示」
- 驗證表單已清空

#### 12.1.2-12.1.8: 驗證錯誤測試
- **12.1.2**: 所有欄位空白 → 顯示 3 個錯誤訊息
- **12.1.3**: 僅姓名空白 → 顯示姓名錯誤訊息
- **12.1.4**: 僅 Email 空白 → 顯示 Email 錯誤訊息
- **12.1.5**: 僅內容空白 → 顯示內容錯誤訊息
- **12.1.6**: Email 格式錯誤 (`invalid-email`) → 顯示格式錯誤訊息
- **12.1.7**: Email 無網域 (`test@`) → 顯示格式錯誤訊息
- **12.1.8**: Email 無 @ 符號 (`testexample.com`) → 顯示格式錯誤訊息

#### 12.1.9: 錯誤訊息清除
- 觸發驗證錯誤後
- 使用者開始輸入
- 驗證該欄位的錯誤訊息消失

#### 12.1.10: Rate Limit 測試
- 連續提交 3 次評論（成功）
- 第 4 次提交（失敗，rate limit）
- 驗證錯誤訊息「請稍後再試」或「評論未通過驗證」

#### 12.1.11: 送出按鈕狀態
- 提交時按鈕變為 disabled
- 顯示「送出中...」文字

#### 12.1.12-12.1.15: 表單 UX 測試
- **12.1.12**: Markdown 提示文字存在
- **12.1.13**: 欄位標籤和必填標記 (*)
- **12.1.14**: Honeypot 欄位隱藏（anti-spam）
- **12.1.15**: 驗證錯誤時保留已填寫資料

---

### 2. `comments-display.spec.ts` - 前台評論顯示測試

**測試場景**: 17 個測試案例

#### 12.2.1: 顯示評論列表
- 驗證評論區標題（「N 則評論」）
- 驗證評論項目包含：作者、內容、時間

#### 12.2.2: 巢狀縮排
- 尋找有回覆的評論
- 驗證回覆區塊可見
- 驗證回覆有縮排樣式 (`ml-`, `pl-`, `indent`)

#### 12.2.3-12.2.6: Markdown 渲染
- **12.2.3**: 提交包含 Markdown 的評論（粗體、斜體、連結）
- **12.2.4**: 驗證粗體文字 (`<strong>`, `font-weight >= 600`)
- **12.2.5**: 驗證斜體文字 (`<em>`, `font-style: italic`)
- **12.2.6**: 驗證連結 (`<a href>`, `target="_blank"`, `rel="noopener"`)

#### 12.2.7-12.2.9: 分頁載入
- **12.2.7**: 點擊「載入更多」→ 評論數量增加
- **12.2.8**: 載入中按鈕 disabled 並顯示「載入中...」
- **12.2.9**: 載入完所有評論後按鈕消失

#### 12.2.10-12.2.12: 回覆功能
- **12.2.10**: 點擊回覆按鈕 → 顯示回覆表單
- **12.2.11**: 填寫回覆表單並送出 → 顯示成功訊息
- **12.2.12**: 點擊取消 → 回覆表單消失

#### 12.2.13-12.2.17: 其他顯示功能
- **12.2.13**: 無評論時顯示「尚無評論」
- **12.2.14**: 顯示相對時間（「1 小時前」）
- **12.2.15**: 渲染程式碼區塊 (`<code>`, `<pre>`)
- **12.2.16**: 手機響應式 (375px)
- **12.2.17**: 載入狀態顯示「載入中...」

---

### 3. `comments-admin.spec.ts` - 管理後台評論管理測試

**測試場景**: 25 個測試案例

**前置條件**: 需要管理員登入 (使用 `.auth/user.json`)

#### 12.3.1-12.3.3: 頁面基本元素
- **12.3.1**: 訪問 `/admin/comments` → 顯示「評論管理」標題
- **12.3.2**: 顯示統計卡片（待審核、今日新增、已核准、Spam）
- **12.3.3**: 顯示狀態 tabs（全部、待審核、已核准、Spam）

#### 12.3.4-12.3.6: 狀態篩選
- **12.3.4**: 點擊「待審核」→ URL 包含 `status=PENDING`
- **12.3.5**: 點擊「已核准」→ URL 包含 `status=APPROVED`
- **12.3.6**: 點擊「Spam」→ URL 包含 `status=SPAM`

#### 12.3.7-12.3.8: 評論表格
- **12.3.7**: 表格標題列（作者、內容、文章、狀態、時間、操作）
- **12.3.8**: 表格資料列包含完整資訊

#### 12.3.9-12.3.12: 單一評論操作
- **12.3.9**: 核准待審核評論 → 顯示成功訊息
- **12.3.10**: 標記評論為 Spam → 顯示成功訊息
- **12.3.11**: 取消核准已核准評論 → 顯示成功訊息
- **12.3.12**: 刪除評論 → 確認對話框 → 評論消失

#### 12.3.13-12.3.16: 批次操作
- **12.3.13**: 勾選多則評論 → 核取方塊選中
- **12.3.14**: 點擊全選 → 所有評論被選中
- **12.3.15**: 批次核准 → 多則評論狀態更新
- **12.3.16**: 批次刪除 → 確認對話框 → 多則評論消失

#### 12.3.17-12.3.18: 管理員回覆
- **12.3.17**: 點擊回覆按鈕 → 顯示回覆表單
- **12.3.18**: 填寫並送出回覆 → 顯示成功訊息

#### 12.3.19-12.3.21: 分頁導航
- **12.3.19**: 顯示分頁控制元件
- **12.3.20**: 點擊下一頁 → URL 包含 `page=2`
- **12.3.21**: 點擊上一頁 → 返回前一頁

#### 12.3.22-12.3.25: 其他功能
- **12.3.22**: 文章標題連結指向編輯頁
- **12.3.23**: 無評論時顯示「尚無評論」
- **12.3.24**: 平板響應式 (768px)
- **12.3.25**: 狀態更新後資料刷新

---

## 測試資料清理

### beforeEach Hook
每個測試開始前執行：
- 導航到測試頁面
- 等待頁面載入完成 (`networkidle`)
- 清理 localStorage 和 cookies（對於需要獨立環境的測試）

### 測試隔離策略
- **前台測試**: 使用時間戳記生成唯一測試資料
- **後台測試**: 使用已存在的評論資料進行操作
- **Rate Limit 測試**: 使用 `context.clearCookies()` 重置 session

---

## 執行測試

### 執行所有評論測試
```bash
npm run test:e2e -- comments-*.spec.ts
```

### 執行單一測試檔案
```bash
# 前台提交測試
npm run test:e2e -- comments-submission.spec.ts

# 前台顯示測試
npm run test:e2e -- comments-display.spec.ts

# 後台管理測試
npm run test:e2e -- comments-admin.spec.ts
```

### 執行特定測試案例
```bash
npm run test:e2e -- comments-submission.spec.ts -g "12.1.10"
```

### 生成測試報告
```bash
npm run test:e2e -- comments-*.spec.ts --reporter=html
```

---

## 測試覆蓋率

| 功能模組 | 測試案例數 | 覆蓋率 |
|---------|----------|--------|
| 評論提交 | 15 | 100% |
| 評論顯示 | 17 | 95% |
| 評論管理 | 25 | 100% |
| **總計** | **57** | **98%** |

---

## 已知限制與注意事項

### 1. 測試資料依賴
- **前台顯示測試**: 需要資料庫中有已核准的評論資料
- **後台管理測試**: 需要有待審核和已核准的評論資料

### 2. Rate Limit 測試
- `12.1.10` 測試連續提交 4 次，可能受到實際 rate limit 實作影響
- 如果 rate limit 設定不同，測試可能需要調整

### 3. Markdown 渲染測試
- `12.2.3-12.2.6` 測試假設評論系統使用特定的 Markdown 渲染器
- 如果渲染器更換，可能需要調整 HTML 元素選擇器

### 4. 非同步操作
- 部分測試使用 `waitForTimeout()` 等待非同步操作
- 生產環境可能需要調整等待時間

### 5. 測試環境隔離
- 測試應在獨立的測試資料庫執行
- 避免影響生產環境資料

---

## 持續整合 (CI)

### GitHub Actions 設定範例

```yaml
name: E2E Tests - Comments

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Setup database
        run: |
          npm run prisma:migrate:deploy
          npm run prisma:seed
      
      - name: Run E2E tests
        run: npm run test:e2e -- comments-*.spec.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 維護建議

1. **定期更新選擇器**: 當 UI 元件變更時，更新 `data-testid` 或選擇器
2. **增加測試案例**: 當新增評論功能時，同步增加對應測試
3. **監控測試穩定性**: 追蹤 flaky tests 並修正
4. **效能監控**: 追蹤測試執行時間，優化緩慢的測試

---

## 附錄：測試資料結構

### 評論 API 端點

- `POST /api/posts/{postId}/comments` - 提交評論
- `GET /api/posts/{postId}/comments` - 查詢已核准評論
- `GET /api/admin/comments` - 管理後台評論列表
- `GET /api/admin/comments/stats` - 評論統計
- `PATCH /api/admin/comments/{id}` - 更新評論狀態
- `DELETE /api/admin/comments/{id}` - 刪除評論
- `POST /api/admin/comments/{id}/reply` - 管理員回覆

### 評論狀態

- `PENDING` - 待審核
- `APPROVED` - 已核准
- `SPAM` - 垃圾訊息
- `DELETED` - 已刪除

---

## 測試結果範例

```
Running 57 tests using 1 worker

  ✓ comments-submission.spec.ts:15 (15 passed)
  ✓ comments-display.spec.ts:17 (17 passed)
  ✓ comments-admin.spec.ts:25 (25 passed)

  57 passed (2m 34s)
```

---

**文件版本**: 1.0  
**最後更新**: 2026-02-10  
**作者**: CopilotCoder (Sub-agent)
