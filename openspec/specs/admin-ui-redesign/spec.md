## ADDED Requirements

### Requirement: 後台配色一致性

系統 MUST 確保後台 UI 使用與前台一致的 Modern Rose 配色方案。

#### Scenario: 使用品牌主色

- **WHEN** 後台顯示主要操作按鈕（新增文章、儲存）
- **THEN** 按鈕使用 Rose 600 背景色

#### Scenario: 側邊欄樣式

- **WHEN** 使用者進入後台
- **THEN** 側邊欄使用 Stone 50 或 White 背景，選單項目 Hover 顯示 Rose 600 文字

### Requirement: 後台佈局結構

系統 MUST 使用左側邊欄 + 右側內容區的標準佈局。

#### Scenario: 顯示側邊欄選單

- **WHEN** 使用者進入後台
- **THEN** 左側顯示固定寬度 (240px) 的側邊欄，包含「文章管理」、「分類管理」、「標籤管理」等選單

#### Scenario: 內容區顯示

- **WHEN** 使用者點擊「文章管理」
- **THEN** 右側內容區顯示文章列表表格

### Requirement: 表格樣式

系統 MUST 提供簡潔的表格樣式，用於顯示文章、分類、標籤列表。

#### Scenario: 顯示文章列表

- **WHEN** 使用者進入「文章管理」
- **THEN** 系統顯示含有標題、狀態、發佈日期、操作按鈕的表格

#### Scenario: Hover 效果

- **WHEN** 使用者將滑鼠移至表格列上方
- **THEN** 該列背景變為 Stone 50

### Requirement: 表單樣式

系統 MUST 提供統一的表單樣式，用於新增/編輯文章。

#### Scenario: 顯示文章編輯表單

- **WHEN** 使用者點擊「新增文章」
- **THEN** 系統顯示含有標題、內容、分類、標籤等輸入欄位的表單

#### Scenario: 錯誤訊息顯示

- **WHEN** 使用者提交表單但驗證失敗
- **THEN** 系統在錯誤欄位下方顯示 Red 600 錯誤訊息
