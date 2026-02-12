# NovaScribe 評論系統 E2E 測試 - 快速參考

## 🚀 快速開始

### 1. 設定環境
```bash
cd novascribe

# 安裝依賴（如果尚未安裝）
npm install

# 安裝 Playwright browsers
npx playwright install

# 設定資料庫
npm run prisma:migrate:deploy
npm run prisma:seed
```

### 2. 執行測試

#### 方式 A: 互動式腳本（推薦）
```bash
./scripts/test-comments-e2e.sh
```

#### 方式 B: 直接執行
```bash
# 所有評論測試
npm run test:e2e -- comments-*.spec.ts

# 單一檔案
npm run test:e2e -- comments-submission.spec.ts

# 特定案例
npm run test:e2e -- comments-*.spec.ts -g "12.1.10"

# 生成報告
npm run test:e2e -- comments-*.spec.ts --reporter=html
```

---

## 📁 檔案結構

```
novascribe/
├── tests/e2e/
│   ├── comments-submission.spec.ts  # 前台提交測試 (15 案例)
│   ├── comments-display.spec.ts     # 前台顯示測試 (17 案例)
│   ├── comments-admin.spec.ts       # 後台管理測試 (25 案例)
│   ├── COMMENTS_E2E_SPEC.md         # 完整測試規格
│   └── IMPLEMENTATION_SUMMARY.md    # 實作總結
└── scripts/
    └── test-comments-e2e.sh         # 測試執行腳本
```

---

## 🧪 測試案例概覽

### 前台提交測試 (15 案例)
| ID | 測試項目 | 預期結果 |
|----|---------|---------|
| 12.1.1 | 成功提交評論 | 顯示成功訊息，表單清空 |
| 12.1.2 | 所有欄位空白 | 顯示 3 個錯誤訊息 |
| 12.1.6 | Email 格式錯誤 | 顯示格式錯誤訊息 |
| 12.1.10 | Rate limit | 第 4 次提交失敗 |
| 12.1.11 | 送出按鈕狀態 | 送出中按鈕 disabled |

### 前台顯示測試 (17 案例)
| ID | 測試項目 | 預期結果 |
|----|---------|---------|
| 12.2.1 | 顯示評論列表 | 列出所有已核准評論 |
| 12.2.2 | 巢狀縮排 | 回覆有縮排樣式 |
| 12.2.4 | 粗體渲染 | `<strong>` 元素存在 |
| 12.2.7 | 載入更多 | 點擊後評論數量增加 |
| 12.2.11 | 送出回覆 | 顯示成功訊息 |

### 後台管理測試 (25 案例)
| ID | 測試項目 | 預期結果 |
|----|---------|---------|
| 12.3.1 | 訪問頁面 | 顯示「評論管理」標題 |
| 12.3.4 | 待審核篩選 | URL 包含 `status=PENDING` |
| 12.3.9 | 核准評論 | 顯示成功訊息 |
| 12.3.15 | 批次核准 | 多則評論狀態更新 |
| 12.3.18 | 管理員回覆 | 顯示成功訊息 |

---

## 🔍 常用測試命令

### 偵錯模式
```bash
# UI 模式（可視化測試）
npm run test:e2e -- comments-*.spec.ts --ui

# Debug 模式
npm run test:e2e -- comments-*.spec.ts --debug

# 單一瀏覽器
npm run test:e2e -- comments-*.spec.ts --project=chromium
```

### 測試篩選
```bash
# 只測試前台
npm run test:e2e -- comments-submission.spec.ts comments-display.spec.ts

# 只測試後台
npm run test:e2e -- comments-admin.spec.ts

# 測試特定描述
npm run test:e2e -- comments-*.spec.ts -g "should submit"
```

### 效能測試
```bash
# 單一 worker（逐個執行）
npm run test:e2e -- comments-*.spec.ts --workers=1

# 多個 workers（平行執行）
npm run test:e2e -- comments-*.spec.ts --workers=4
```

---

## 🐛 疑難排解

### 問題：測試失敗 "No comments found"
**原因**: 資料庫沒有評論資料  
**解決**:
```bash
npm run prisma:seed
```

### 問題：Rate limit 測試失敗
**原因**: Rate limit 設定與測試不符  
**解決**: 調整 `comments-submission.spec.ts` 中的提交次數

### 問題：認證錯誤（後台測試）
**原因**: `.auth/user.json` 不存在或過期  
**解決**:
```bash
# 重新生成認證檔案
npm run test:e2e -- auth.setup.ts
```

### 問題：瀏覽器未安裝
**原因**: Playwright 瀏覽器未安裝  
**解決**:
```bash
npx playwright install --with-deps
```

---

## 📊 測試報告

### 生成 HTML 報告
```bash
npm run test:e2e -- comments-*.spec.ts --reporter=html
```

報告位置: `playwright-report/index.html`

### 檢視測試追蹤
```bash
# 執行測試並記錄追蹤
npm run test:e2e -- comments-*.spec.ts --trace=on

# 檢視追蹤
npx playwright show-trace trace.zip
```

---

## 🔐 測試帳號

### 管理員帳號（後台測試）
- **Email**: `admin@novascribe.com`
- **密碼**: `admin123456`
- **來源**: `prisma/seed.ts`

---

## 📝 測試資料

### 評論狀態
- `PENDING` - 待審核
- `APPROVED` - 已核准
- `SPAM` - 垃圾訊息
- `DELETED` - 已刪除

### 測試用評論資料
測試會自動產生包含時間戳記的唯一資料：
- 作者: `測試使用者 {timestamp}`
- Email: `test{timestamp}@example.com`
- 內容: `測試評論 {timestamp}`

---

## 🎯 測試目標與覆蓋率

| 功能 | 測試案例 | 覆蓋率 |
|-----|---------|--------|
| 評論提交 | 15 | 100% |
| 評論顯示 | 17 | 95% |
| 評論管理 | 25 | 100% |
| **總計** | **57** | **98%** |

---

## 🔗 相關文件

- **完整規格**: `tests/e2e/COMMENTS_E2E_SPEC.md`
- **實作總結**: `tests/e2e/IMPLEMENTATION_SUMMARY.md`
- **Playwright 文件**: https://playwright.dev/
- **專案 README**: `README.md`

---

## 💡 最佳實踐

### 執行測試前
1. ✅ 確保資料庫已設定（`prisma:migrate` + `prisma:seed`）
2. ✅ 確保開發伺服器可啟動（`npm run dev`）
3. ✅ 確保 Playwright 已安裝（`npx playwright install`）

### 撰寫新測試時
1. 使用 `data-testid` 選擇器（最穩定）
2. 包含 `beforeEach` 清理邏輯
3. 使用條件判斷處理可選元素
4. 加入有意義的測試描述

### CI/CD 整合
1. 使用獨立測試資料庫
2. 設定適當的 timeout (5-10 分鐘)
3. 保存測試報告為 artifact
4. 失敗時發送通知

---

## 🆘 需要幫助？

1. 檢視 `COMMENTS_E2E_SPEC.md` 完整測試規格
2. 檢視 `IMPLEMENTATION_SUMMARY.md` 實作細節
3. 執行 `npm run test:e2e -- --help` 查看 Playwright 選項
4. 查閱 Playwright 官方文件

---

**版本**: 1.0  
**最後更新**: 2026-02-10  
**維護者**: NovaScribe Team
