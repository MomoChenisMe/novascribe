## ADDED Requirements

### Requirement: RSS 2.0 Feed 生成

系統 SHALL 在 `/feed.xml` 路由提供 RSS 2.0 格式的 Feed，包含所有已發佈文章的全文內容。Feed MUST 使用繁體中文（`zh-Hant`）語言標記。

#### Scenario: 取得 RSS 2.0 Feed

- **WHEN** RSS 閱讀器或訪客請求 `/feed.xml`
- **THEN** 系統回傳 RSS 2.0 格式的 XML，Content-Type 為 `application/rss+xml; charset=utf-8`，包含網站標題、描述、連結，以及每篇已發佈文章的 title、link、description（摘要）、content（全文）、pubDate、category

#### Scenario: Feed 只包含已發佈文章

- **WHEN** 系統中有 DRAFT、PUBLISHED、ARCHIVED 狀態的文章
- **THEN** Feed 僅包含 PUBLISHED 狀態的文章

#### Scenario: Feed 文章排序

- **WHEN** 系統生成 RSS Feed
- **THEN** 文章按 `publishedAt` 降序排列，最新文章在最前面

### Requirement: Atom Feed 生成

系統 SHALL 在 `/feed/atom.xml` 路由提供 Atom 格式的 Feed，包含所有已發佈文章的全文內容。

#### Scenario: 取得 Atom Feed

- **WHEN** RSS 閱讀器請求 `/feed/atom.xml`
- **THEN** 系統回傳 Atom 格式的 XML，Content-Type 為 `application/atom+xml; charset=utf-8`，包含完整的 Feed 資訊和文章條目

### Requirement: 分類 Feed

系統 SHALL 在 `/feed/[category].xml` 路由提供特定分類的 RSS 2.0 Feed，僅包含該分類下的已發佈文章。

#### Scenario: 取得分類 Feed

- **WHEN** RSS 閱讀器請求 `/feed/tech.xml`，且「tech」分類存在
- **THEN** 系統回傳僅包含「tech」分類下已發佈文章的 RSS 2.0 Feed

#### Scenario: 分類不存在

- **WHEN** RSS 閱讀器請求 `/feed/non-existent.xml`
- **THEN** 系統回傳 404 錯誤

#### Scenario: 分類下無已發佈文章

- **WHEN** RSS 閱讀器請求一個存在但無已發佈文章的分類 Feed
- **THEN** 系統回傳有效的 RSS Feed，但 item 列表為空

### Requirement: 全文輸出

系統 SHALL 在所有 Feed 格式中提供文章的全文 HTML 內容，而非僅摘要。

#### Scenario: Feed 包含全文

- **WHEN** 系統生成 Feed 條目
- **THEN** 每篇文章的 content 欄位包含完整的 HTML 渲染內容，description 欄位包含摘要

### Requirement: Auto-discovery 標籤

系統 SHALL 在所有前台頁面的 `<head>` 中包含 RSS/Atom auto-discovery `<link>` 標籤，讓 RSS 閱讀器能自動發現 Feed 訂閱連結。

#### Scenario: 頁面包含 auto-discovery 標籤

- **WHEN** 訪客使用 RSS 閱讀器造訪任何前台頁面
- **THEN** 頁面 `<head>` 包含 `<link rel="alternate" type="application/rss+xml" title="..." href="/feed.xml">` 和 `<link rel="alternate" type="application/atom+xml" title="..." href="/feed/atom.xml">`

### Requirement: Feed ISR 策略

系統 SHALL 對 Feed 路由使用 ISR 策略，設定 `revalidate = 3600`（每小時重新生成），平衡效能與內容即時性。

#### Scenario: Feed 快取與重新驗證

- **WHEN** 多個 RSS 閱讀器在同一小時內請求 Feed
- **THEN** 系統回傳快取的 Feed 內容，不重複查詢資料庫

#### Scenario: Feed 內容更新

- **WHEN** 管理者發佈新文章超過 1 小時後
- **THEN** Feed 內容在下次請求時重新生成，包含新發佈的文章
