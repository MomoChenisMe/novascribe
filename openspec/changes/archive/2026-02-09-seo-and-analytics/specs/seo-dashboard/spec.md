## ADDED Requirements

### Requirement: SEO 概覽儀表板

系統 SHALL 提供 SEO 分析儀表板，讓管理者一覽全站 SEO 健康度，包含文章 SEO 評分分佈、缺少 meta 資料的文章清單、整體 SEO 改善建議。

#### Scenario: 顯示 SEO 概覽數據

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者存取 SEO 儀表板頁面或請求 GET `/api/admin/seo/dashboard`
- **THEN** 系統顯示以下概覽數據：
  - 已發佈文章總數
  - 已設定 SEO meta 的文章數量與百分比
  - 平均 SEO 評分
  - SEO 評分分佈（優良 / 尚可 / 需改善 的文章數量）

#### Scenario: 顯示缺少 SEO 資料的文章清單

- **GIVEN** 管理者已登入後台
- **WHEN** 管理者查看 SEO 儀表板
- **THEN** 系統列出缺少 meta title 的文章清單
- **THEN** 系統列出缺少 meta description 的文章清單
- **THEN** 系統列出缺少 OG Image 的文章清單
- **THEN** 每個清單項目包含文章標題和快速編輯連結

#### Scenario: 所有文章 SEO 完善

- **GIVEN** 所有已發佈文章都已設定完整的 SEO metadata 且評分 ≥ 80
- **WHEN** 管理者查看 SEO 儀表板
- **THEN** 缺少 SEO 資料的清單顯示「所有文章的 SEO 設定已完善」
- **THEN** 概覽卡片顯示全部綠色狀態

### Requirement: SEO 改善建議

系統 SHALL 基於全站 SEO 狀況提供改善建議清單。

#### Scenario: 產生改善建議

- **GIVEN** 管理者存取 SEO 儀表板
- **WHEN** 系統分析全站 SEO 狀況
- **THEN** 系統根據以下規則產生建議：
  - 若超過 20% 文章缺少 meta description → 建議「為文章補充 meta description 以提升搜尋結果點擊率」
  - 若超過 50% 文章未設定 focus keyword → 建議「設定焦點關鍵字以優化搜尋排名」
  - 若平均 SEO 評分低於 60 → 建議「整體 SEO 品質偏低，建議逐篇改善」
  - 若有文章 noIndex 但仍出現在 sitemap → 警告不一致的設定

#### Scenario: 無建議可提供

- **GIVEN** 全站 SEO 狀況良好
- **WHEN** 系統分析後無改善建議
- **THEN** 系統顯示「目前 SEO 狀況良好，請持續保持！」

### Requirement: 搜尋效能趨勢圖

系統 SHALL 在 SEO 儀表板中顯示搜尋效能趨勢圖（若 Search Console 已整合）。

#### Scenario: 顯示搜尋效能趨勢

- **GIVEN** 管理者已登入後台且 Search Console API 已設定
- **WHEN** 管理者查看 SEO 儀表板的搜尋效能區塊
- **THEN** 系統顯示近 28 天的趨勢圖，包含曝光次數和點擊次數的每日數據
- **THEN** 圖表支援切換檢視期間（7 天、28 天、3 個月）

#### Scenario: Search Console 未整合時的趨勢圖

- **GIVEN** 系統未設定 Search Console API
- **WHEN** 管理者查看 SEO 儀表板的搜尋效能區塊
- **THEN** 系統顯示「尚未整合 Google Search Console」並提供設定引導連結
