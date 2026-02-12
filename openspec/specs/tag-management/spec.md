## ADDED Requirements

### Requirement: 建立標籤

系統 SHALL 允許管理者建立標籤，必須提供名稱。系統 SHALL 根據名稱自動生成 slug。標籤名稱 MUST 唯一。

#### Scenario: 成功建立標籤

- **WHEN** 管理者建立名稱為「JavaScript」的標籤
- **THEN** 系統建立標籤，自動生成 slug「javascript」

#### Scenario: 建立中文標籤

- **WHEN** 管理者建立名稱為「前端開發」的標籤
- **THEN** 系統建立標籤，自動生成 slug「qian-duan-kai-fa」

#### Scenario: 標籤名稱重複

- **WHEN** 管理者嘗試建立名稱為「JavaScript」的標籤，但該名稱已存在
- **THEN** 系統回傳 400 錯誤，提示「標籤名稱已存在」

#### Scenario: 標籤名稱為空

- **WHEN** 管理者提交空白名稱的標籤
- **THEN** 系統回傳 400 錯誤，提示「標籤名稱為必填欄位」

### Requirement: 更新標籤

系統 SHALL 允許管理者更新標籤的名稱和 slug。

#### Scenario: 成功更新標籤名稱

- **WHEN** 管理者將標籤名稱從「JS」修改為「JavaScript」
- **THEN** 系統更新標籤名稱和 slug

#### Scenario: 更新為已存在的名稱

- **WHEN** 管理者嘗試將標籤名稱修改為一個已存在的名稱
- **THEN** 系統回傳 400 錯誤，提示「標籤名稱已存在」

#### Scenario: 更新不存在的標籤

- **WHEN** 管理者嘗試更新一個不存在的標籤
- **THEN** 系統回傳 404 錯誤

### Requirement: 刪除標籤

系統 SHALL 允許管理者刪除標籤。刪除標籤時 SHALL 同時移除所有文章與該標籤的關聯。

#### Scenario: 成功刪除標籤

- **WHEN** 管理者刪除一個被 3 篇文章使用的標籤
- **THEN** 系統刪除該標籤及其所有文章關聯

#### Scenario: 刪除不存在的標籤

- **WHEN** 管理者嘗試刪除一個不存在的標籤
- **THEN** 系統回傳 404 錯誤

### Requirement: 取得標籤列表

系統 SHALL 提供標籤列表，每個標籤 SHALL 包含使用次數統計（關聯的文章數量）。支援按名稱搜尋。

#### Scenario: 取得所有標籤及使用次數

- **WHEN** 管理者請求標籤列表
- **THEN** 系統回傳所有標籤，每個標籤包含 id、name、slug、postCount（使用次數）

#### Scenario: 搜尋標籤

- **WHEN** 管理者輸入關鍵字「java」搜尋標籤
- **THEN** 系統回傳名稱包含「java」的標籤列表（如「JavaScript」、「Java」）

#### Scenario: 空標籤列表

- **WHEN** 系統中尚無任何標籤
- **THEN** 系統回傳空陣列

### Requirement: 清理未使用標籤

系統 SHALL 允許管理者一鍵清理所有未被任何文章使用的標籤。

#### Scenario: 成功清理未使用標籤

- **WHEN** 系統中有 3 個未被任何文章使用的標籤，管理者執行清理
- **THEN** 系統刪除這 3 個未使用標籤，回傳刪除數量

#### Scenario: 無未使用標籤

- **WHEN** 所有標籤都被至少一篇文章使用，管理者執行清理
- **THEN** 系統回傳刪除數量 0

### Requirement: 文章標籤關聯

系統 SHALL 允許管理者在建立或編輯文章時關聯多個標籤。一篇文章可關聯多個標籤，一個標籤可被多篇文章使用。

#### Scenario: 為文章新增標籤

- **WHEN** 管理者編輯文章並新增 3 個標籤
- **THEN** 系統在 post_tags 表建立 3 筆關聯記錄

#### Scenario: 更新文章的標籤關聯

- **WHEN** 管理者將文章的標籤從 [A, B] 修改為 [B, C]
- **THEN** 系統移除標籤 A 的關聯，新增標籤 C 的關聯，保留標籤 B 的關聯

#### Scenario: 移除文章的所有標籤

- **WHEN** 管理者編輯文章並移除所有標籤
- **THEN** 系統刪除該文章的所有標籤關聯

## ADDED Requirements

### Requirement: 取得公開標籤列表

系統 SHALL 提供 `getPublicTags()` 公開查詢功能，回傳所有含有已發佈文章的標籤列表，每個標籤包含已發佈文章數量。此功能不需認證，供前台 Server Component 直接呼叫。

#### Scenario: 取得公開標籤列表

- **WHEN** 前台頁面呼叫 `getPublicTags()`
- **THEN** 系統回傳標籤列表，每個標籤包含 id、name、slug、postCount（僅計算 PUBLISHED 狀態的文章數量）

#### Scenario: 排除無已發佈文章的標籤

- **WHEN** 某標籤只被 DRAFT 狀態的文章使用
- **THEN** 該標籤的 postCount 為 0，但仍出現在列表中（由前台決定是否顯示）

#### Scenario: 標籤列表排序

- **WHEN** 前台頁面請求公開標籤列表
- **THEN** 標籤按 postCount 降序排列，文章數量多的標籤排在前面

#### Scenario: 無任何標籤

- **WHEN** 系統中沒有任何標籤
- **THEN** 系統回傳空陣列

### Requirement: 透過 Slug 取得標籤詳情（公開）

系統 SHALL 提供 `getTagBySlug(slug)` 公開查詢功能，回傳指定標籤的詳情及其關聯的已發佈文章列表，支援分頁。此功能不需認證。

#### Scenario: 取得標籤及其文章

- **WHEN** 前台頁面呼叫 `getTagBySlug('javascript', { page: 1, limit: 10 })`
- **THEN** 系統回傳標籤資訊（id、name、slug）以及含有該標籤的已發佈文章列表（分頁），文章按 `publishedAt` 降序排列，包含分頁資訊（total、totalPages、currentPage）

#### Scenario: 標籤不存在

- **WHEN** 前台頁面呼叫 `getTagBySlug('non-existent')`
- **THEN** 系統回傳 null

#### Scenario: 標籤下無已發佈文章

- **WHEN** 標籤存在但關聯的文章都是 DRAFT 狀態
- **THEN** 系統回傳標籤資訊，文章列表為空陣列，分頁 total 為 0

#### Scenario: 文章列表只包含已發佈文章

- **WHEN** 標籤關聯了 DRAFT、PUBLISHED、ARCHIVED 狀態的文章
- **THEN** 回傳的文章列表僅包含 PUBLISHED 狀態的文章
