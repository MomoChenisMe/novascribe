## ADDED Requirements

### Requirement: 自動生成 Sitemap

系統 SHALL 自動生成符合 XML Sitemap 協定的 sitemap.xml，包含所有已發佈文章、分類頁、標籤頁的 URL。Sitemap 透過 Next.js App Router 的 `sitemap.ts` 動態生成。

#### Scenario: 生成包含已發佈文章的 Sitemap

- **GIVEN** 系統中有已發佈狀態的文章
- **WHEN** 爬蟲或使用者請求 `/sitemap.xml`
- **THEN** 系統回傳有效的 XML Sitemap
- **THEN** Sitemap 包含所有已發佈文章的 URL、最後修改日期、更新頻率、優先權
- **THEN** 草稿、下架文章不包含在 Sitemap 中

#### Scenario: Sitemap 包含分類和標籤頁面

- **GIVEN** 系統中有分類和標籤資料
- **WHEN** 爬蟲請求 `/sitemap.xml`
- **THEN** Sitemap 包含所有分類頁面的 URL
- **THEN** Sitemap 包含所有標籤頁面的 URL
- **THEN** Sitemap 包含首頁 URL，優先權為 1.0

#### Scenario: Sitemap 排除 noindex 頁面

- **GIVEN** 文章的 SEO 設定中 `noIndex` 為 true
- **WHEN** 系統生成 Sitemap
- **THEN** 該文章不包含在 Sitemap 中

#### Scenario: 文章更新後 Sitemap 反映變更

- **GIVEN** 管理者更新了某篇已發佈文章的內容
- **WHEN** 爬蟲下次請求 `/sitemap.xml`
- **THEN** 該文章的 `lastmod` 反映最新的更新時間

#### Scenario: 空白部落格的 Sitemap

- **GIVEN** 系統中沒有任何已發佈文章
- **WHEN** 爬蟲請求 `/sitemap.xml`
- **THEN** 系統回傳有效的 XML Sitemap，僅包含首頁 URL

### Requirement: Sitemap 設定管理

系統 SHALL 提供 Sitemap 設定管理功能，讓管理者可以調整各頁面類型的更新頻率和優先權。

#### Scenario: 取得 Sitemap 設定

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者請求 Sitemap 設定（GET `/api/admin/seo/sitemap-config`）
- **THEN** 系統回傳各路徑類型的 changefreq 和 priority 設定

#### Scenario: 更新 Sitemap 設定

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者更新 Sitemap 設定（PUT `/api/admin/seo/sitemap-config`），調整文章類型的 changefreq 為 `daily`、priority 為 `0.9`
- **THEN** 系統儲存新設定
- **THEN** 下次生成 Sitemap 時使用新設定值

#### Scenario: 無效的 Sitemap 設定值

- **GIVEN** 管理者正在更新 Sitemap 設定
- **WHEN** 管理者提交無效的 priority 值（如 1.5，超出 0.0-1.0 範圍）
- **THEN** 系統回傳驗證錯誤，提示 priority 必須在 0.0 到 1.0 之間
