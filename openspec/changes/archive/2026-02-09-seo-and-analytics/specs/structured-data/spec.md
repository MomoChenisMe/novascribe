## ADDED Requirements

### Requirement: Article Structured Data

系統 SHALL 在每篇文章頁面自動注入 Article 類型的 JSON-LD structured data，符合 Google 的 Rich Results 規範。

#### Scenario: 文章頁面包含 Article JSON-LD

- **GIVEN** 文章已發佈
- **WHEN** 使用者或爬蟲存取文章前台頁面
- **THEN** 頁面包含 `<script type="application/ld+json">` 標籤
- **THEN** JSON-LD 內容包含 `@type: "Article"`、`headline`、`datePublished`、`dateModified`、`author`、`description`、`image`（若有）
- **THEN** JSON-LD 通過 Google Rich Results Test 驗證

#### Scenario: 文章無圖片時的 Article JSON-LD

- **GIVEN** 文章已發佈但未設定任何圖片
- **WHEN** 系統生成 Article JSON-LD
- **THEN** JSON-LD 不包含 `image` 欄位（而非空值）
- **THEN** 其餘欄位正常輸出

### Requirement: BreadcrumbList Structured Data

系統 SHALL 在文章頁面和分類頁面注入 BreadcrumbList 類型的 JSON-LD structured data，提供導覽路徑資訊。

#### Scenario: 文章頁面包含 BreadcrumbList JSON-LD

- **GIVEN** 文章已發佈且屬於某個分類
- **WHEN** 使用者或爬蟲存取文章前台頁面
- **THEN** 頁面包含 BreadcrumbList JSON-LD
- **THEN** 麵包屑路徑為：首頁 → 分類 → 文章標題

#### Scenario: 文章無分類時的 BreadcrumbList

- **GIVEN** 文章已發佈但未設定分類
- **WHEN** 系統生成 BreadcrumbList JSON-LD
- **THEN** 麵包屑路徑為：首頁 → 文章標題

#### Scenario: 子分類文章的 BreadcrumbList

- **GIVEN** 文章屬於子分類（父分類 → 子分類）
- **WHEN** 系統生成 BreadcrumbList JSON-LD
- **THEN** 麵包屑路徑為：首頁 → 父分類 → 子分類 → 文章標題

### Requirement: WebSite Structured Data

系統 SHALL 在首頁注入 WebSite 類型的 JSON-LD structured data，包含 SearchAction 讓 Google 顯示站內搜尋框。

#### Scenario: 首頁包含 WebSite JSON-LD

- **GIVEN** 網站已設定 site title 和 site URL
- **WHEN** 使用者或爬蟲存取首頁
- **THEN** 頁面包含 WebSite JSON-LD
- **THEN** JSON-LD 包含 `@type: "WebSite"`、`name`（網站標題）、`url`（網站 URL）
- **THEN** JSON-LD 包含 `potentialAction` 的 SearchAction（站內搜尋）

#### Scenario: 未設定網站標題時的 WebSite JSON-LD

- **GIVEN** 網站尚未在 site_settings 中設定 site_title
- **WHEN** 系統生成 WebSite JSON-LD
- **THEN** 使用預設值 "NovaScribe" 作為網站標題

### Requirement: Person Structured Data

系統 SHALL 在文章頁面的 Article JSON-LD 中包含 Person 類型的作者資訊。

#### Scenario: Article JSON-LD 包含作者資訊

- **GIVEN** 文章已發佈
- **WHEN** 系統生成 Article JSON-LD
- **THEN** `author` 欄位包含 `@type: "Person"` 和作者名稱
- **THEN** 作者名稱取自文章作者的 User.name，若未設定則使用 email
