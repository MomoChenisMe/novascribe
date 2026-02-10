## ADDED Requirements

### Requirement: Comment Schema 與資料模型

系統 SHALL 提供 `Comment` model，包含 id、postId、parentId（可選，巢狀回覆）、authorName、authorEmail、content（Markdown）、status（PENDING/APPROVED/SPAM/DELETED）、ipAddress、userAgent、createdAt、updatedAt。Comment 與 Post 為多對一關聯，刪除文章時級聯刪除評論。

#### Scenario: Comment model 定義完整欄位

- **WHEN** 系統初始化 Prisma schema
- **THEN** `Comment` model 包含所有必要欄位：id（cuid）、postId（外鍵關聯 Post）、parentId（可選，自連結）、authorName（VARCHAR 100）、authorEmail（VARCHAR 255）、content（TEXT）、status（CommentStatus enum，預設 PENDING）、ipAddress（VARCHAR 45）、userAgent（VARCHAR 500）、createdAt、updatedAt

#### Scenario: Comment 與 Post 的關聯

- **WHEN** 查詢一篇文章的評論
- **THEN** 系統透過 postId 外鍵取得該文章的所有評論，文章刪除時級聯刪除所有相關評論

#### Scenario: Comment 自連結巢狀回覆

- **WHEN** 讀者回覆一則頂層評論
- **THEN** 系統建立一則新評論，parentId 設為被回覆的頂層評論 ID

### Requirement: 建立評論

系統 SHALL 允許讀者在已發佈文章下提交評論。必須提供 authorName、authorEmail、content。新評論預設狀態為 PENDING。系統 SHALL 記錄讀者的 IP 位址和 User-Agent。

#### Scenario: 成功提交頂層評論

- **WHEN** 讀者在一篇 PUBLISHED 文章頁面填寫暱稱「小明」、Email「ming@example.com」、內容「很棒的文章！」並提交
- **THEN** 系統建立一則 PENDING 狀態的評論，parentId 為 null，記錄 IP 和 User-Agent，回傳成功訊息「評論已送出，待審核後顯示」

#### Scenario: 成功提交回覆評論

- **WHEN** 讀者回覆一則已核准的頂層評論，填寫暱稱和內容
- **THEN** 系統建立一則 PENDING 狀態的評論，parentId 設為被回覆的頂層評論 ID

#### Scenario: 回覆的回覆歸入頂層評論

- **WHEN** 讀者回覆一則「回覆」（即第 2 層評論）
- **THEN** 系統將 parentId 設為該回覆所屬的頂層評論 ID（而非第 2 層評論 ID），維持最多 2 層巢狀

#### Scenario: 在非 PUBLISHED 文章提交評論

- **WHEN** 讀者嘗試在 DRAFT 或 ARCHIVED 文章提交評論
- **THEN** 系統回傳 404 錯誤

#### Scenario: 缺少必填欄位

- **WHEN** 讀者提交評論時未填寫 authorName 或 content
- **THEN** 系統回傳 400 錯誤，提示缺少必填欄位

#### Scenario: Email 格式驗證

- **WHEN** 讀者提交的 authorEmail 格式不正確（如 "not-an-email"）
- **THEN** 系統回傳 400 錯誤，提示 Email 格式不正確

#### Scenario: 內容長度限制

- **WHEN** 讀者提交的評論內容少於 2 字或超過 5000 字
- **THEN** 系統回傳 400 錯誤，提示內容長度不符合要求

### Requirement: 取得已核准評論

系統 SHALL 提供公開 API 取得指定文章的已核准（APPROVED）評論，支援分頁。評論以巢狀結構返回：頂層評論按建立時間升序排列，每則頂層評論包含其 replies。

#### Scenario: 取得文章的已核准評論

- **WHEN** 前台請求文章 ID 為 `abc123` 的評論列表
- **THEN** 系統回傳該文章所有 APPROVED 狀態的頂層評論（分頁，預設每頁 10 則），每則頂層評論包含其所有 APPROVED 的 replies，按 createdAt 升序排列

#### Scenario: 分頁取得評論

- **WHEN** 前台請求第 2 頁的評論（`?page=2&limit=10`）
- **THEN** 系統回傳第 2 頁的頂層評論及其 replies，包含分頁資訊（total、totalPages、currentPage）

#### Scenario: 無已核准評論

- **WHEN** 文章沒有任何 APPROVED 狀態的評論
- **THEN** 系統回傳空陣列，分頁資訊 total 為 0

#### Scenario: 不顯示非 APPROVED 評論

- **WHEN** 文章有 PENDING、SPAM、DELETED 狀態的評論
- **THEN** 公開 API 不回傳這些評論，僅回傳 APPROVED 狀態的評論

### Requirement: 評論狀態管理

系統 SHALL 支援評論狀態機：PENDING → APPROVED、PENDING → SPAM、PENDING → DELETED、APPROVED → SPAM、APPROVED → DELETED、SPAM → APPROVED、SPAM → DELETED。管理員可更新評論狀態。

#### Scenario: 核准待審評論

- **WHEN** 管理員將一則 PENDING 評論狀態更新為 APPROVED
- **THEN** 系統更新評論狀態為 APPROVED，該評論開始在前台顯示

#### Scenario: 將評論標記為 spam

- **WHEN** 管理員將一則 PENDING 或 APPROVED 評論標記為 SPAM
- **THEN** 系統更新評論狀態為 SPAM，該評論不在前台顯示

#### Scenario: 刪除評論

- **WHEN** 管理員刪除一則評論
- **THEN** 系統將評論狀態設為 DELETED（軟刪除），該評論不在前台顯示

#### Scenario: 硬刪除評論

- **WHEN** 管理員對評論執行硬刪除
- **THEN** 系統從資料庫永久移除該評論及其所有 replies

#### Scenario: 恢復 spam 評論

- **WHEN** 管理員將一則 SPAM 評論狀態更新為 APPROVED
- **THEN** 系統更新評論狀態為 APPROVED，該評論重新在前台顯示

### Requirement: 自動核准設定

系統 SHALL 支援透過 `SiteSetting` 設定評論自動核准（`comment_auto_approve`）。啟用時，新評論通過 anti-spam 檢查後直接設為 APPROVED。

#### Scenario: 自動核准啟用

- **WHEN** `SiteSetting` 中 `comment_auto_approve` 設為 `true`，且讀者提交的評論通過 anti-spam 檢查
- **THEN** 系統建立評論時狀態直接設為 APPROVED，評論立即在前台顯示

#### Scenario: 自動核准停用（預設）

- **WHEN** `SiteSetting` 中 `comment_auto_approve` 未設定或設為 `false`
- **THEN** 新評論預設狀態為 PENDING，需管理員手動核准

### Requirement: 評論 Markdown 支援

系統 SHALL 支援評論內容使用基本 Markdown 格式，渲染時僅允許安全的 HTML 標籤（白名單制）。

#### Scenario: 渲染基本 Markdown

- **WHEN** 評論內容包含 `**粗體**`、`*斜體*`、`` `程式碼` ``、`[連結](https://example.com)`
- **THEN** 系統渲染為對應的 HTML：`<strong>`、`<em>`、`<code>`、`<a href="...">`

#### Scenario: 渲染程式碼區塊

- **WHEN** 評論內容包含三個反引號包裹的程式碼區塊
- **THEN** 系統渲染為 `<pre><code>` 區塊

#### Scenario: 過濾不安全的 HTML

- **WHEN** 評論內容包含 `<script>alert('xss')</script>` 或 `<iframe>` 或 `onclick="..."`
- **THEN** 系統移除所有不安全的 HTML 標籤和屬性，僅保留白名單內的安全標籤

#### Scenario: 禁止標題和圖片

- **WHEN** 評論內容包含 `# 標題` 或 `![圖片](url)`
- **THEN** 系統不渲染為 `<h1>` 或 `<img>`，以純文字顯示
