## ADDED Requirements

### Requirement: 建立分類

系統 SHALL 允許管理者建立分類，必須提供名稱，可選填父分類和 slug。系統 SHALL 根據分類名稱自動生成 slug（中文轉拼音），管理者可手動指定。分類名稱 MUST 唯一。

#### Scenario: 成功建立頂層分類

- **WHEN** 管理者建立名稱為「技術文章」的分類，未指定父分類
- **THEN** 系統建立分類，自動生成 slug「ji-shu-wen-zhang」，parentId 為 null

#### Scenario: 建立子分類

- **WHEN** 管理者建立名稱為「前端」的分類，並指定父分類為「技術文章」
- **THEN** 系統建立分類，parentId 設為「技術文章」的 ID

#### Scenario: 分類名稱重複

- **WHEN** 管理者嘗試建立一個已存在名稱的分類
- **THEN** 系統回傳 400 錯誤，提示「分類名稱已存在」

#### Scenario: 分類名稱為空

- **WHEN** 管理者提交空白名稱的分類
- **THEN** 系統回傳 400 錯誤，提示「分類名稱為必填欄位」

#### Scenario: Slug 自動去重

- **WHEN** 管理者建立名稱為「測試」的分類，但 slug「ce-shi」已存在
- **THEN** 系統自動將 slug 設為「ce-shi-2」

### Requirement: 更新分類

系統 SHALL 允許管理者更新分類的名稱、slug、父分類。系統 MUST 防止分類設定自身為父分類（避免循環參照）。

#### Scenario: 成功更新分類名稱

- **WHEN** 管理者將分類名稱從「技術」修改為「技術文章」
- **THEN** 系統更新分類名稱並回傳更新後的資料

#### Scenario: 更改父分類

- **WHEN** 管理者將「前端」分類的父分類從「技術」改為「開發」
- **THEN** 系統更新 parentId 為「開發」的 ID

#### Scenario: 防止循環參照

- **WHEN** 管理者嘗試將「技術」分類的父分類設為「技術」自身
- **THEN** 系統回傳 400 錯誤，提示「不允許將分類設為自身的子分類」

#### Scenario: 防止間接循環參照

- **WHEN** 「前端」是「技術」的子分類，管理者嘗試將「技術」的父分類設為「前端」
- **THEN** 系統回傳 400 錯誤，提示「不允許建立循環層級結構」

#### Scenario: 更新不存在的分類

- **WHEN** 管理者嘗試更新一個不存在的分類
- **THEN** 系統回傳 404 錯誤

### Requirement: 刪除分類

系統 SHALL 允許管理者刪除分類。刪除父分類時，其子分類 SHALL 提升為頂層分類。該分類下的文章之 categoryId SHALL 設為 null。

#### Scenario: 刪除無子分類的分類

- **WHEN** 管理者刪除一個無子分類的分類
- **THEN** 系統刪除該分類，關聯文章的 categoryId 設為 null

#### Scenario: 刪除有子分類的父分類

- **WHEN** 管理者刪除一個有 2 個子分類的父分類
- **THEN** 系統刪除該父分類，2 個子分類的 parentId 設為 null（提升為頂層分類）

#### Scenario: 刪除不存在的分類

- **WHEN** 管理者嘗試刪除一個不存在的分類
- **THEN** 系統回傳 404 錯誤

### Requirement: 取得分類列表

系統 SHALL 提供分類列表，以樹狀層級結構呈現，每個分類 SHALL 包含文章數量統計。

#### Scenario: 取得完整分類樹

- **WHEN** 管理者請求分類列表
- **THEN** 系統回傳樹狀結構的分類清單，每個分類包含 id、name、slug、parentId、children 陣列、文章數量（postCount）

#### Scenario: 空分類列表

- **WHEN** 系統中尚無任何分類
- **THEN** 系統回傳空陣列

#### Scenario: 分類包含文章數量

- **WHEN** 「技術」分類下有 5 篇文章
- **THEN** 該分類的 postCount 為 5
