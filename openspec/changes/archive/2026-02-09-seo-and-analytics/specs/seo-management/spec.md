## ADDED Requirements

### Requirement: 文章 SEO Meta 資料管理

系統 SHALL 為每篇文章提供獨立的 SEO meta 資料管理功能，包含 meta title、meta description、Open Graph tags、Twitter Card 設定、canonical URL 和 noindex/nofollow 設定。SEO 資料儲存在獨立的 `seo_metadata` 資料表中，與文章一對一關聯。

#### Scenario: 取得文章 SEO 設定

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者透過 API 取得指定文章的 SEO 設定（GET `/api/admin/seo/posts/[postId]`）
- **THEN** 系統回傳該文章的完整 SEO metadata（meta title、meta description、OG tags、Twitter Card、canonical URL、noindex、nofollow、focus keyword、SEO score）
- **THEN** 若該文章尚無 SEO 設定，回傳空值欄位（非 404）

#### Scenario: 更新文章 SEO 設定

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者提交文章 SEO 設定更新（PUT `/api/admin/seo/posts/[postId]`），包含 meta title、meta description 等欄位
- **THEN** 系統儲存 SEO metadata 到 `seo_metadata` 資料表
- **THEN** 若該文章尚無 SEO 記錄，系統自動建立新記錄
- **THEN** 系統自動重新計算 SEO 評分並更新 `seoScore` 欄位

#### Scenario: Meta Title 長度驗證

- **GIVEN** 管理者正在編輯文章 SEO 設定
- **WHEN** 管理者輸入的 meta title 超過 70 個字元
- **THEN** 系統回傳驗證錯誤，提示 meta title 不可超過 70 個字元

#### Scenario: Meta Description 長度驗證

- **GIVEN** 管理者正在編輯文章 SEO 設定
- **WHEN** 管理者輸入的 meta description 超過 160 個字元
- **THEN** 系統回傳驗證錯誤，提示 meta description 不可超過 160 個字元

#### Scenario: 未認證存取 SEO API

- **GIVEN** 使用者未登入
- **WHEN** 使用者嘗試存取 SEO 管理 API
- **THEN** 系統回傳 401 Unauthorized

### Requirement: SEO 預覽

系統 SHALL 提供 Google 搜尋結果預覽功能，讓管理者在編輯 SEO meta 時即時看到文章在 Google 搜尋結果中的呈現效果。

#### Scenario: 顯示 Google 搜尋結果預覽

- **GIVEN** 管理者正在編輯文章 SEO 設定
- **WHEN** 管理者輸入 meta title 和 meta description
- **THEN** 系統即時顯示模擬的 Google 搜尋結果，包含標題（藍色連結）、URL 路徑、描述文字
- **THEN** 預覽中 meta title 超過 60 字元的部分以省略號顯示
- **THEN** 預覽中 meta description 超過 155 字元的部分以省略號顯示

#### Scenario: 預覽使用預設值

- **GIVEN** 管理者尚未填寫 meta title 或 meta description
- **WHEN** 系統顯示 SEO 預覽
- **THEN** meta title 預設使用文章標題
- **THEN** meta description 預設使用文章內容前 160 個字元

### Requirement: SEO 評分

系統 SHALL 對每篇文章計算 SEO 完整度評分（0-100 分），基於多項 SEO 檢查項目的加權計算。

#### Scenario: 計算 SEO 評分

- **GIVEN** 管理者已設定文章的 SEO meta 資料
- **WHEN** 系統計算 SEO 評分（GET `/api/admin/seo/score/[postId]`）
- **THEN** 系統根據以下項目加權計算總分：meta title 存在且長度適當（15 分）、meta description 存在且長度適當（15 分）、focus keyword 已設定（10 分）、focus keyword 出現在標題（10 分）、focus keyword 出現在描述（10 分）、OG Image 已設定（10 分）、文章內容 ≥ 300 字（10 分）、使用子標題 H2/H3（10 分）、包含內部連結（5 分）、包含外部連結（5 分）
- **THEN** 回傳總分和各項目的通過/未通過狀態與改善建議

#### Scenario: 評分等級對應

- **GIVEN** 系統已計算出 SEO 評分
- **WHEN** 系統顯示評分結果
- **THEN** 80-100 分顯示為「優良」（綠色）
- **THEN** 60-79 分顯示為「尚可」（黃色）
- **THEN** 0-59 分顯示為「需改善」（紅色）

#### Scenario: 無 SEO 設定時的評分

- **GIVEN** 文章尚未設定任何 SEO meta 資料
- **WHEN** 系統計算 SEO 評分
- **THEN** 系統基於文章內容本身可評估的項目計算分數（文章長度、子標題、連結）
- **THEN** meta 相關項目得分為 0

### Requirement: OG 與 Twitter Card Meta Tags 輸出

系統 SHALL 在文章前台頁面的 `<head>` 中自動注入 Open Graph 和 Twitter Card meta tags。

#### Scenario: 文章頁面包含 OG Tags

- **GIVEN** 文章已發佈且設定了 SEO metadata
- **WHEN** 使用者或爬蟲存取文章前台頁面
- **THEN** 頁面 `<head>` 包含 `og:title`、`og:description`、`og:image`、`og:url`、`og:type` meta tags

#### Scenario: 文章頁面包含 Twitter Card Tags

- **GIVEN** 文章已發佈且設定了 SEO metadata
- **WHEN** 使用者或爬蟲存取文章前台頁面
- **THEN** 頁面 `<head>` 包含 `twitter:card`、`twitter:title`、`twitter:description`、`twitter:image` meta tags

#### Scenario: 未設定 OG 資料時使用預設值

- **GIVEN** 文章已發佈但未設定 OG 相關 meta
- **WHEN** 使用者或爬蟲存取文章前台頁面
- **THEN** `og:title` 使用文章標題
- **THEN** `og:description` 使用文章內容前 200 字元
- **THEN** `og:image` 使用全站預設 OG 圖片（若已設定）
