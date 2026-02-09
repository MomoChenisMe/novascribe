## ADDED Requirements

### Requirement: 搜尋 API

系統 SHALL 提供 `GET /api/search` 公開端點，支援透過關鍵字搜尋已發佈文章的標題、內容和摘要。搜尋結果 MUST 只包含 PUBLISHED 狀態的文章，並支援分頁。

#### Scenario: 關鍵字搜尋

- **WHEN** 客戶端發送 `GET /api/search?q=Next.js&page=1`
- **THEN** 系統回傳標題、內容或摘要包含「Next.js」的已發佈文章列表，每頁 10 筆，按 `publishedAt` 降序排列，包含分頁資訊（total、totalPages、currentPage）

#### Scenario: 搜尋結果包含文章資訊

- **WHEN** 搜尋回傳結果
- **THEN** 每篇文章包含 title、slug、excerpt、publishedAt、category、tags，不暴露敏感欄位（如 authorId）

#### Scenario: 空關鍵字

- **WHEN** 客戶端發送 `GET /api/search?q=` 或未提供 `q` 參數
- **THEN** 系統回傳 400 錯誤，提示「搜尋關鍵字為必填」

#### Scenario: 無符合結果

- **WHEN** 客戶端搜尋一個沒有任何文章匹配的關鍵字
- **THEN** 系統回傳空陣列和分頁資訊（total: 0、totalPages: 0）

#### Scenario: 分頁超出範圍

- **WHEN** 客戶端請求超出實際頁數的 page 參數
- **THEN** 系統回傳空陣列，分頁資訊正確顯示總頁數

#### Scenario: 只搜尋已發佈文章

- **WHEN** 關鍵字匹配到 DRAFT 或 ARCHIVED 狀態的文章
- **THEN** 搜尋結果不包含這些非 PUBLISHED 狀態的文章

### Requirement: 搜尋結果高亮

系統 SHALL 在搜尋結果中對匹配的關鍵字進行高亮標記，幫助使用者快速定位匹配內容。

#### Scenario: 標題關鍵字高亮

- **WHEN** 搜尋結果的文章標題包含搜尋關鍵字
- **THEN** 回傳的結果中，匹配的關鍵字以 `<mark>` 標籤包裹或提供高亮位置資訊

#### Scenario: 摘要關鍵字高亮

- **WHEN** 搜尋結果的文章摘要包含搜尋關鍵字
- **THEN** 回傳的摘要文字中，匹配的關鍵字被標記高亮

### Requirement: Rate Limiting

系統 SHALL 對搜尋 API 實施速率限制，防止濫用。限制為每個 IP 每分鐘 100 次請求。

#### Scenario: 正常請求

- **WHEN** 一個 IP 在一分鐘內發送 50 次搜尋請求
- **THEN** 所有請求正常處理並回傳搜尋結果

#### Scenario: 超過速率限制

- **WHEN** 一個 IP 在一分鐘內發送超過 100 次搜尋請求
- **THEN** 超過限制的請求回傳 429 Too Many Requests 錯誤，包含 `Retry-After` header

#### Scenario: 速率限制重置

- **WHEN** 一個 IP 達到速率限制後等待一分鐘
- **THEN** 該 IP 的請求計數重置，可正常發送搜尋請求

### Requirement: Client-side 搜尋頁面

系統 SHALL 提供前台搜尋頁面（`/search`），支援即時搜尋體驗。搜尋輸入 SHALL 使用 debounce 機制避免過多 API 請求。

#### Scenario: 搜尋頁面載入

- **WHEN** 訪客造訪 `/search` 頁面
- **THEN** 系統顯示搜尋輸入框和空的搜尋結果區域

#### Scenario: 即時搜尋

- **WHEN** 訪客在搜尋框中輸入關鍵字
- **THEN** 系統在使用者停止輸入 300ms 後（debounce）自動發送搜尋請求，並顯示搜尋結果

#### Scenario: 搜尋結果顯示

- **WHEN** 搜尋 API 回傳結果
- **THEN** 頁面顯示文章列表，每篇文章包含標題（含高亮）、摘要（含高亮）、發佈日期和分類，點擊可跳轉至文章頁面

#### Scenario: 搜尋結果分頁

- **WHEN** 搜尋結果超過 10 筆
- **THEN** 頁面顯示分頁導航，點擊可載入下一頁結果

#### Scenario: 搜尋載入狀態

- **WHEN** 搜尋請求進行中
- **THEN** 頁面顯示載入指示器（loading indicator）

#### Scenario: 搜尋無結果

- **WHEN** 搜尋關鍵字沒有匹配的文章
- **THEN** 頁面顯示「找不到符合的文章」提示訊息

#### Scenario: 從 Header 搜尋入口

- **WHEN** 訪客在 Header 的搜尋輸入框中輸入關鍵字並提交
- **THEN** 系統導航至 `/search?q=關鍵字` 頁面並顯示搜尋結果
