## ADDED Requirements

### Requirement: Honeypot 欄位防禦

系統 SHALL 在評論提交表單中加入隱藏的 honeypot 欄位（name="website"）。正常使用者不會看到此欄位，機器人會自動填入。若此欄位有值，系統靜默拒絕（回傳 200 假裝成功但不儲存評論）。

#### Scenario: 機器人填入 honeypot 欄位

- **WHEN** 提交的表單資料中 `website` 欄位有值（如 "http://spam.com"）
- **THEN** 系統回傳 HTTP 200 和成功訊息（假裝成功），但不建立任何評論記錄

#### Scenario: 正常使用者未填 honeypot 欄位

- **WHEN** 提交的表單資料中 `website` 欄位為空
- **THEN** 系統繼續後續的 anti-spam 檢查流程

### Requirement: IP Rate Limiting

系統 SHALL 對同一 IP 位址實施評論提交頻率限制：每分鐘最多 3 則評論。使用記憶體 Map 實作，自動清理過期記錄。

#### Scenario: 正常頻率提交

- **WHEN** 同一 IP 在一分鐘內提交第 1 至第 3 則評論
- **THEN** 系統正常處理每則評論

#### Scenario: 超過頻率限制

- **WHEN** 同一 IP 在一分鐘內提交第 4 則評論
- **THEN** 系統回傳 HTTP 429 Too Many Requests，提示「評論頻率過高，請稍後再試」

#### Scenario: Rate limit 自動重置

- **WHEN** 一分鐘過後，同一 IP 再次提交評論
- **THEN** 系統正常處理，rate limit 計數已重置

#### Scenario: 不同 IP 不互相影響

- **WHEN** IP-A 已達到頻率限制，IP-B 提交評論
- **THEN** IP-B 的評論正常處理，不受 IP-A 的 rate limit 影響

### Requirement: 內容過濾

系統 SHALL 對評論內容進行多項過濾檢查：禁止詞清單、連結數量限制、內容長度限制。未通過檢查的評論自動標記為 SPAM 或拒絕提交。

#### Scenario: 包含禁止詞的評論

- **WHEN** 評論內容包含禁止詞清單中的詞彙
- **THEN** 系統自動將評論狀態設為 SPAM（仍儲存，但不顯示在前台）

#### Scenario: 超過連結數量限制

- **WHEN** 評論內容包含超過 3 個 URL 連結
- **THEN** 系統自動將評論狀態設為 SPAM

#### Scenario: 通過所有內容過濾

- **WHEN** 評論內容不含禁止詞、連結數量在 3 個以內、長度在 2-5000 字之間
- **THEN** 系統繼續正常流程（根據自動核准設定決定狀態為 PENDING 或 APPROVED）

#### Scenario: 禁止詞清單設定

- **WHEN** 管理員在 `SiteSetting` 中設定 `comment_banned_words` 為 "casino,viagra,loan"
- **THEN** 系統使用此清單進行內容過濾，包含任一禁止詞的評論自動標記為 SPAM

### Requirement: 管理員評論列表

系統 SHALL 提供管理後台評論列表頁面，支援按狀態篩選（全部/待審核/已核准/Spam），顯示評論作者、內容摘要、對應文章、狀態、時間，支援分頁。

#### Scenario: 載入評論管理頁面

- **WHEN** 管理員進入評論管理頁面
- **THEN** 系統顯示所有評論列表（預設全部狀態），每頁 20 則，包含作者名稱、內容前 100 字、文章標題連結、狀態標籤、建立時間

#### Scenario: 篩選待審核評論

- **WHEN** 管理員點擊「待審核」tab
- **THEN** 系統僅顯示 PENDING 狀態的評論列表，tab 顯示待審核數量 badge

#### Scenario: 篩選已核准評論

- **WHEN** 管理員點擊「已核准」tab
- **THEN** 系統僅顯示 APPROVED 狀態的評論列表

#### Scenario: 篩選 Spam 評論

- **WHEN** 管理員點擊「Spam」tab
- **THEN** 系統僅顯示 SPAM 狀態的評論列表

### Requirement: 批次操作

系統 SHALL 允許管理員對多則評論執行批次操作：批次核准、批次標記為 Spam、批次刪除。單次批次操作最多 50 則。

#### Scenario: 批次核准評論

- **WHEN** 管理員勾選 5 則 PENDING 評論，執行「批次核准」
- **THEN** 系統將 5 則評論狀態全部更新為 APPROVED，回傳操作結果（成功 5 則）

#### Scenario: 批次標記為 Spam

- **WHEN** 管理員勾選 3 則評論，執行「批次標記 Spam」
- **THEN** 系統將 3 則評論狀態全部更新為 SPAM

#### Scenario: 批次刪除評論

- **WHEN** 管理員勾選 2 則評論，執行「批次刪除」
- **THEN** 系統將 2 則評論狀態設為 DELETED（軟刪除）

#### Scenario: 批次操作超過上限

- **WHEN** 管理員嘗試對 51 則評論執行批次操作
- **THEN** 系統回傳 400 錯誤，提示「單次批次操作最多 50 則」

#### Scenario: 批次操作包含不同狀態評論

- **WHEN** 管理員選取的評論中包含 PENDING 和 APPROVED 狀態，執行「批次核准」
- **THEN** 系統僅將 PENDING 評論更新為 APPROVED，已是 APPROVED 的評論不受影響，回傳操作結果摘要

### Requirement: 管理員回覆評論

系統 SHALL 允許管理員直接在管理後台回覆評論。管理員回覆自動設為 APPROVED 狀態，作者名稱使用管理員帳號名稱。

#### Scenario: 管理員回覆頂層評論

- **WHEN** 管理員對一則頂層評論點擊「回覆」，輸入回覆內容並提交
- **THEN** 系統建立一則 APPROVED 狀態的回覆評論，parentId 為被回覆的評論 ID，authorName 為管理員名稱，authorEmail 為管理員 Email

#### Scenario: 管理員回覆觸發通知

- **WHEN** 管理員回覆一則評論，且原評論者的 authorEmail 有效
- **THEN** 系統非同步發送 Email 通知原評論者有新回覆

### Requirement: 評論統計

系統 SHALL 在管理後台評論頁面頂部顯示評論統計資訊。

#### Scenario: 顯示評論統計

- **WHEN** 管理員進入評論管理頁面
- **THEN** 頁面頂部顯示統計卡片：待審核數、今日新增數、已核准總數、Spam 總數
