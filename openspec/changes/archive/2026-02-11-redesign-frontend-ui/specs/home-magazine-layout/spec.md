## ADDED Requirements

### Requirement: Hero Section

系統 MUST 在首頁頂部顯示 Hero Section，展示最新或精選文章。

#### Scenario: 顯示最新文章

- **WHEN** 使用者進入首頁
- **THEN** 系統在 Hero Section 顯示最新已發佈文章的大圖、標題、摘要與「閱讀更多」按鈕

#### Scenario: 響應式佈局

- **WHEN** 使用者在桌面裝置瀏覽
- **THEN** 系統顯示左圖右文佈局 (50/50 比例)

#### Scenario: 行動裝置佈局

- **WHEN** 使用者在行動裝置瀏覽
- **THEN** 系統顯示上圖下文垂直佈局

### Requirement: Featured Grid

系統 MUST 在 Hero Section 下方顯示卡片網格，展示其他文章。

#### Scenario: 顯示文章卡片

- **WHEN** 使用者向下捲動首頁
- **THEN** 系統以 3 欄網格 (桌面) 或 1 欄 (行動) 顯示文章卡片

#### Scenario: 卡片內容

- **WHEN** 系統渲染文章卡片
- **THEN** 卡片包含縮圖 (16:9)、標題、摘要、分類標籤、發佈日期

#### Scenario: Hover 效果

- **WHEN** 使用者將滑鼠移至卡片上方
- **THEN** 卡片陰影增強並向上移動

### Requirement: Newsletter 訂閱區塊

系統 MUST 在首頁底部顯示 Newsletter 訂閱表單。

#### Scenario: 顯示訂閱表單

- **WHEN** 使用者捲動至首頁底部
- **THEN** 系統顯示 Rose 50 背景的訂閱區塊，包含標題、說明與 Email 輸入框

#### Scenario: 提交訂閱

- **WHEN** 使用者輸入 Email 並點擊「訂閱」按鈕
- **THEN** 系統顯示成功訊息 (暫不實作後端整合)

### Requirement: 分頁導航

系統 MUST 在文章列表下方顯示分頁導航。

#### Scenario: 顯示分頁按鈕

- **WHEN** 首頁文章超過 10 篇
- **THEN** 系統顯示分頁按鈕 (上一頁、1, 2, 3, ..., 下一頁)

#### Scenario: 點擊分頁

- **WHEN** 使用者點擊「第 2 頁」按鈕
- **THEN** 系統導航至 `/?page=2` 並顯示第 2 頁文章

### Requirement: 效能優化

系統 MUST 確保首頁 Lighthouse Performance Score 達 90 以上。

#### Scenario: 圖片 Lazy Load

- **WHEN** 使用者進入首頁
- **THEN** 系統僅載入首屏可見的文章縮圖，其餘使用 Lazy Load

#### Scenario: 字體優化

- **WHEN** 首頁載入字體
- **THEN** 系統使用 `next/font/google` 自動優化，設定 `font-display: swap`
