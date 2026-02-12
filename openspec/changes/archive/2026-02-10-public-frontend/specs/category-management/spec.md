## ADDED Requirements

### Requirement: 取得公開分類列表

系統 SHALL 提供 `getPublicCategories()` 公開查詢功能，回傳所有含有已發佈文章的分類列表，每個分類包含已發佈文章數量。此功能不需認證，供前台 Server Component 直接呼叫。

#### Scenario: 取得公開分類列表

- **WHEN** 前台頁面呼叫 `getPublicCategories()`
- **THEN** 系統回傳分類列表，每個分類包含 id、name、slug、description、postCount（僅計算 PUBLISHED 狀態的文章數量）

#### Scenario: 排除無已發佈文章的分類

- **WHEN** 某分類下只有 DRAFT 狀態的文章
- **THEN** 該分類的 postCount 為 0，但仍出現在列表中（由前台決定是否顯示）

#### Scenario: 分類列表排序

- **WHEN** 前台頁面請求公開分類列表
- **THEN** 分類按名稱字母序排列

#### Scenario: 無任何分類

- **WHEN** 系統中沒有任何分類
- **THEN** 系統回傳空陣列

### Requirement: 透過 Slug 取得分類詳情（公開）

系統 SHALL 提供 `getCategoryBySlug(slug)` 公開查詢功能，回傳指定分類的詳情及其下的已發佈文章列表，支援分頁。此功能不需認證。

#### Scenario: 取得分類及其文章

- **WHEN** 前台頁面呼叫 `getCategoryBySlug('tech', { page: 1, limit: 10 })`
- **THEN** 系統回傳分類資訊（id、name、slug、description）以及該分類下的已發佈文章列表（分頁），文章按 `publishedAt` 降序排列，包含分頁資訊（total、totalPages、currentPage）

#### Scenario: 分類不存在

- **WHEN** 前台頁面呼叫 `getCategoryBySlug('non-existent')`
- **THEN** 系統回傳 null

#### Scenario: 分類下無已發佈文章

- **WHEN** 分類存在但其下所有文章都是 DRAFT 狀態
- **THEN** 系統回傳分類資訊，文章列表為空陣列，分頁 total 為 0

#### Scenario: 文章列表只包含已發佈文章

- **WHEN** 分類下有 DRAFT、PUBLISHED、ARCHIVED 狀態的文章
- **THEN** 回傳的文章列表僅包含 PUBLISHED 狀態的文章
