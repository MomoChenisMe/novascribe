## ADDED Requirements

### Requirement: Google Search Console 網站驗證

系統 SHALL 支援透過 HTML meta tag 方式完成 Google Search Console 的網站所有權驗證。

#### Scenario: 注入驗證 meta tag

- **GIVEN** 管理者在 site_settings 中設定了 Google Site Verification code
- **WHEN** 爬蟲或使用者存取任何頁面
- **THEN** 頁面 `<head>` 包含 `<meta name="google-site-verification" content="{verification_code}" />`

#### Scenario: 未設定驗證碼時不注入

- **GIVEN** 系統未設定 Google Site Verification code
- **WHEN** 使用者存取頁面
- **THEN** 頁面 `<head>` 不包含 google-site-verification meta tag

#### Scenario: 透過後台設定驗證碼

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者在全站 SEO 設定中填入 Google Site Verification code 並儲存
- **THEN** 系統儲存驗證碼到 site_settings
- **THEN** 前台所有頁面自動包含驗證 meta tag

### Requirement: 搜尋效能數據同步

系統 SHALL 透過 Google Search Console API 取得網站的搜尋效能數據，包含曝光次數、點擊次數、平均排名、點擊率（CTR）。

#### Scenario: 取得搜尋效能數據

- **GIVEN** 管理者已登入後台且 Search Console API 已設定
- **WHEN** 管理者請求搜尋效能數據（GET `/api/admin/search-console/performance`）
- **THEN** 系統回傳近 28 天的搜尋效能數據：總曝光次數、總點擊次數、平均 CTR、平均排名
- **THEN** 數據包含依日期的趨勢資料

#### Scenario: 依查詢關鍵字分析

- **GIVEN** 管理者已登入後台且 Search Console API 已設定
- **WHEN** 管理者請求依查詢關鍵字分組的效能數據（GET `/api/admin/search-console/performance?dimension=query`）
- **THEN** 系統回傳各搜尋關鍵字的曝光次數、點擊次數、CTR、平均排名
- **THEN** 結果按點擊次數降序排列

#### Scenario: 依頁面分析

- **GIVEN** 管理者已登入後台且 Search Console API 已設定
- **WHEN** 管理者請求依頁面分組的效能數據（GET `/api/admin/search-console/performance?dimension=page`）
- **THEN** 系統回傳各頁面 URL 的曝光次數、點擊次數、CTR、平均排名

#### Scenario: Search Console API 未設定

- **GIVEN** 系統未設定 Google Service Account 或未驗證網站
- **WHEN** 管理者存取搜尋效能數據
- **THEN** 系統顯示設定引導訊息，說明所需步驟

#### Scenario: Search Console API 呼叫失敗

- **GIVEN** Search Console API 已設定但回傳錯誤
- **WHEN** 系統嘗試取得搜尋效能數據
- **THEN** 系統回傳友善的錯誤訊息
- **THEN** 不影響其他 SEO 功能的正常運作
