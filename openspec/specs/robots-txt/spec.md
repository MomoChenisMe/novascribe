## ADDED Requirements

### Requirement: 動態生成 robots.txt

系統 SHALL 透過 Next.js App Router 的 `robots.ts` 動態生成 robots.txt，控制搜尋引擎爬蟲的存取規則。

#### Scenario: 預設 robots.txt 輸出

- **GIVEN** 系統未自訂 robots.txt 規則
- **WHEN** 爬蟲請求 `/robots.txt`
- **THEN** 系統回傳預設的 robots.txt，包含：
  - `User-agent: *`
  - `Allow: /`
  - `Disallow: /admin/`
  - `Disallow: /api/`
  - `Sitemap: {siteUrl}/sitemap.xml`

#### Scenario: 包含自訂規則的 robots.txt

- **GIVEN** 管理者在 site_settings 中設定了自訂 robots.txt 規則
- **WHEN** 爬蟲請求 `/robots.txt`
- **THEN** 系統回傳包含自訂規則的 robots.txt
- **THEN** 預設規則（Disallow /admin/、/api/）始終保留，不可被自訂規則覆蓋

#### Scenario: Sitemap URL 自動包含

- **GIVEN** 系統已設定 site_url
- **WHEN** 爬蟲請求 `/robots.txt`
- **THEN** robots.txt 末尾包含 `Sitemap:` 指令，指向正確的 sitemap.xml URL

### Requirement: robots.txt 設定管理

系統 SHALL 提供 robots.txt 自訂規則的管理介面，讓管理者可以新增額外的爬蟲規則。

#### Scenario: 透過全站 SEO 設定管理 robots.txt

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者在全站 SEO 設定中編輯 robots.txt 自訂規則（PUT `/api/admin/seo/settings`，key 為 `robots_txt_custom_rules`）
- **THEN** 系統儲存自訂規則
- **THEN** 下次請求 `/robots.txt` 時包含自訂規則

#### Scenario: 空白自訂規則

- **GIVEN** 管理者清空了 robots.txt 自訂規則
- **WHEN** 爬蟲請求 `/robots.txt`
- **THEN** 系統只回傳預設規則，不包含額外自訂規則

#### Scenario: 保護性路徑不可解除封鎖

- **GIVEN** 管理者嘗試在自訂規則中加入 `Allow: /admin/`
- **WHEN** 系統生成 robots.txt
- **THEN** `/admin/` 和 `/api/` 的 Disallow 規則仍然保留（安全優先）
