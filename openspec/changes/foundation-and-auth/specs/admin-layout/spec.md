## ADDED Requirements

### Requirement: 後台基礎佈局結構
系統 SHALL 提供後台管理介面的基礎佈局，包含側邊欄導覽和頂部列，作為所有後台頁面的共用框架。

#### Scenario: 佈局結構正確渲染
- **WHEN** 已認證使用者存取 `/admin` 下的任何頁面
- **THEN** 頁面 SHALL 顯示左側側邊欄、頂部列、右側主內容區三個區域

#### Scenario: 佈局不影響登入頁
- **WHEN** 使用者存取 `/login` 頁面
- **THEN** 登入頁 SHALL NOT 顯示後台佈局（側邊欄和頂部列）

### Requirement: 側邊欄導覽
系統 SHALL 提供可收合的側邊欄導覽選單，包含後台各功能模組的連結。

#### Scenario: 側邊欄顯示導覽項目
- **WHEN** 後台佈局載入
- **THEN** 側邊欄 SHALL 顯示以下導覽項目：儀表板、文章管理、分類管理、標籤管理、媒體管理、SEO 設定

#### Scenario: 當前頁面高亮
- **WHEN** 使用者位於某個後台頁面
- **THEN** 對應的側邊欄導覽項目 SHALL 以視覺高亮狀態標示

#### Scenario: 側邊欄收合
- **WHEN** 使用者點擊收合按鈕
- **THEN** 側邊欄 SHALL 收合為僅顯示圖示的窄版模式，主內容區自動擴展

#### Scenario: 側邊欄展開
- **WHEN** 使用者在收合狀態下點擊展開按鈕
- **THEN** 側邊欄 SHALL 展開為顯示圖示和文字的完整模式

### Requirement: 頂部列
系統 SHALL 提供頂部列，顯示使用者資訊和常用操作。

#### Scenario: 頂部列顯示使用者資訊
- **WHEN** 後台佈局載入
- **THEN** 頂部列 SHALL 顯示當前登入使用者的名稱或 email

#### Scenario: 頂部列登出按鈕
- **WHEN** 使用者點擊頂部列的登出按鈕
- **THEN** 系統 SHALL 執行登出流程

### Requirement: 響應式設計
後台佈局 SHALL 支援不同螢幕尺寸的響應式設計。

#### Scenario: 桌面版佈局
- **WHEN** 螢幕寬度 ≥ 1024px
- **THEN** SHALL 顯示固定側邊欄和主內容區並排的佈局

#### Scenario: 平板版佈局
- **WHEN** 螢幕寬度在 768px ~ 1023px 之間
- **THEN** 側邊欄 SHALL 預設收合為窄版模式

#### Scenario: 手機版佈局
- **WHEN** 螢幕寬度 < 768px
- **THEN** 側邊欄 SHALL 隱藏，以漢堡選單按鈕取代，點擊後以 overlay 方式顯示

#### Scenario: 手機版側邊欄關閉
- **WHEN** 使用者在手機版中點擊側邊欄以外的區域或選擇導覽項目
- **THEN** overlay 側邊欄 SHALL 自動關閉

### Requirement: 後台首頁
系統 SHALL 提供 `/admin` 首頁作為登入後的預設著陸頁面。

#### Scenario: 首頁正常顯示
- **WHEN** 已認證使用者存取 `/admin`
- **THEN** 頁面 SHALL 顯示歡迎訊息和基本的系統資訊（後續由 admin-dashboard capability 擴充）

#### Scenario: 登入後導向首頁
- **WHEN** 使用者登入成功且無指定回跳 URL
- **THEN** 系統 SHALL 重新導向至 `/admin`
