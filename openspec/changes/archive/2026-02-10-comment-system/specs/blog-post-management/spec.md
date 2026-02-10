## MODIFIED Requirements

### Requirement: Post model 新增 comments 關聯

系統 SHALL 擴充 Post model，新增與 Comment model 的一對多關聯。刪除文章時 SHALL 級聯刪除該文章下的所有評論。

#### Scenario: Post 包含 comments 關聯

- **WHEN** 查詢一篇文章並 include comments
- **THEN** 系統回傳文章資料及其所有關聯的評論

#### Scenario: 刪除文章時級聯刪除評論

- **WHEN** 管理員刪除一篇文章，該文章有 10 則評論
- **THEN** 系統刪除文章的同時，級聯刪除所有 10 則評論（包含 replies）

### Requirement: 文章評論數統計

系統 SHALL 提供文章已核准評論數的查詢功能，供前台文章卡片和文章詳情頁顯示評論數。

#### Scenario: 查詢文章評論數

- **WHEN** 前台頁面需要顯示文章的評論數
- **THEN** 系統透過 `COUNT` 查詢該文章 APPROVED 狀態的評論數量

#### Scenario: 文章列表包含評論數

- **WHEN** 首頁或分類頁顯示文章卡片
- **THEN** 每張文章卡片顯示該文章的已核准評論數（如「3 則評論」）

#### Scenario: 無評論的文章

- **WHEN** 文章沒有任何 APPROVED 評論
- **THEN** 文章卡片顯示「0 則評論」或不顯示評論數
