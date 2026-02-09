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
