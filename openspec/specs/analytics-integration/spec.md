## ADDED Requirements

### Requirement: GA4 追蹤碼嵌入

系統 SHALL 在前台所有頁面嵌入 Google Analytics 4 追蹤碼，使用 `@next/third-parties` 套件整合。追蹤碼透過環境變數或 site_settings 設定。

#### Scenario: 前台頁面包含 GA4 追蹤碼

- **GIVEN** 系統已設定 GA4 Measurement ID（透過環境變數 `GA4_MEASUREMENT_ID` 或 site_settings）
- **WHEN** 使用者存取任何前台頁面
- **THEN** 頁面載入 GA4 追蹤 script
- **THEN** GA4 自動追蹤頁面瀏覽事件

#### Scenario: 未設定 GA4 ID 時不載入

- **GIVEN** 系統未設定 GA4 Measurement ID
- **WHEN** 使用者存取前台頁面
- **THEN** 頁面不載入任何 GA4 script（graceful degradation）
- **THEN** 不產生任何 JavaScript 錯誤

#### Scenario: 後台頁面不追蹤

- **GIVEN** 系統已設定 GA4 Measurement ID
- **WHEN** 管理者存取後台管理頁面（`/admin/*`）
- **THEN** 該頁面不載入 GA4 追蹤碼

### Requirement: 自訂事件追蹤

系統 SHALL 支援追蹤自訂使用者行為事件，包含文章閱讀時間、捲動深度、外部連結點擊。

#### Scenario: 追蹤文章閱讀時間

- **GIVEN** 使用者正在閱讀一篇文章
- **WHEN** 使用者離開文章頁面（或切換分頁）
- **THEN** 系統發送 `article_read` 事件到 GA4，包含文章 slug 和閱讀秒數

#### Scenario: 追蹤捲動深度

- **GIVEN** 使用者正在瀏覽文章頁面
- **WHEN** 使用者捲動到達 25%、50%、75%、100% 的深度
- **THEN** 系統發送 `scroll_depth` 事件到 GA4，包含捲動百分比和文章 slug
- **THEN** 每個深度等級只觸發一次（避免重複計算）

#### Scenario: 追蹤外部連結點擊

- **GIVEN** 使用者正在閱讀文章
- **WHEN** 使用者點擊文章中的外部連結（非本站 URL）
- **THEN** 系統發送 `outbound_click` 事件到 GA4，包含目標 URL

#### Scenario: GA4 未設定時事件追蹤靜默失敗

- **GIVEN** 系統未設定 GA4 Measurement ID
- **WHEN** 事件追蹤元件嘗試發送事件
- **THEN** 事件發送靜默忽略，不產生錯誤

### Requirement: GA4 數據概覽儀表板

系統 SHALL 在後台提供 GA4 流量數據概覽，透過 GA4 Data API 取得報表數據。

#### Scenario: 顯示流量概覽

- **GIVEN** 管理者已登入後台且 GA4 Data API 已設定
- **WHEN** 管理者存取流量分析頁面或請求 GET `/api/admin/analytics/overview`
- **THEN** 系統顯示近 30 天的流量概覽：總瀏覽次數、不重複訪客數、平均工作階段時間、跳出率
- **THEN** 數據包含與前一期間的比較百分比

#### Scenario: GA4 Data API 未設定

- **GIVEN** 系統未設定 Google Service Account 或 GA4 Property ID
- **WHEN** 管理者存取流量分析頁面
- **THEN** 系統顯示設定引導訊息，說明如何設定 GA4 Data API

#### Scenario: GA4 API 呼叫失敗

- **GIVEN** GA4 Data API 已設定但回傳錯誤（如配額超限、權限不足）
- **WHEN** 系統嘗試取得分析數據
- **THEN** 系統顯示友善的錯誤訊息
- **THEN** 若有快取數據，顯示快取數據並標示「數據可能非最新」
