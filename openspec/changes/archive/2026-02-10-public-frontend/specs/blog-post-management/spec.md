## ADDED Requirements

### Requirement: 取得已發佈文章列表（公開）

系統 SHALL 提供 `getPublishedPosts()` 公開查詢功能，回傳已發佈（PUBLISHED）狀態的文章列表，支援分頁、分類篩選和標籤篩選。此功能不需認證，供前台 Server Component 直接呼叫。

#### Scenario: 取得已發佈文章列表

- **WHEN** 前台頁面呼叫 `getPublishedPosts({ page: 1, limit: 10 })`
- **THEN** 系統回傳第一頁（最多 10 篇）PUBLISHED 狀態的文章，按 `publishedAt` 降序排列，包含 title、slug、excerpt、coverImage、publishedAt、category、tags、作者名稱、閱讀時間，以及分頁資訊（total、totalPages、currentPage）

#### Scenario: 依分類篩選已發佈文章

- **WHEN** 前台頁面呼叫 `getPublishedPosts({ categorySlug: 'tech' })`
- **THEN** 系統僅回傳屬於「tech」分類且狀態為 PUBLISHED 的文章

#### Scenario: 依標籤篩選已發佈文章

- **WHEN** 前台頁面呼叫 `getPublishedPosts({ tagSlug: 'javascript' })`
- **THEN** 系統僅回傳含有「javascript」標籤且狀態為 PUBLISHED 的文章

#### Scenario: 不暴露敏感欄位

- **WHEN** 前台查詢已發佈文章
- **THEN** 回傳結果不包含 authorId、管理用欄位等敏感資訊，僅包含公開顯示所需的欄位

### Requirement: 透過 Slug 取得單篇文章（公開）

系統 SHALL 提供 `getPostBySlug(slug)` 公開查詢功能，回傳單篇已發佈文章的完整資料，包含 SEO metadata、分類、標籤和作者名稱。此功能不需認證。

#### Scenario: 取得已發佈文章

- **WHEN** 前台頁面呼叫 `getPostBySlug('my-article')`，且該文章狀態為 PUBLISHED
- **THEN** 系統回傳文章完整資料，包含 title、slug、content（Markdown 原始內容）、excerpt、coverImage、publishedAt、updatedAt、category（name、slug）、tags（name、slug 陣列）、作者名稱、SeoMetadata（metaTitle、metaDescription、ogTitle、ogDescription、ogImage、canonicalUrl、noIndex、noFollow、twitterCard）

#### Scenario: Slug 對應的文章未發佈

- **WHEN** 前台頁面呼叫 `getPostBySlug('draft-article')`，且該文章狀態為 DRAFT
- **THEN** 系統回傳 null，等同文章不存在

#### Scenario: Slug 不存在

- **WHEN** 前台頁面呼叫 `getPostBySlug('non-existent')`
- **THEN** 系統回傳 null

### Requirement: 取得相關文章（公開）

系統 SHALL 提供 `getRelatedPosts(postId, limit)` 公開查詢功能，根據相同分類或標籤推薦相關的已發佈文章。

#### Scenario: 取得相關文章

- **WHEN** 前台頁面呼叫 `getRelatedPosts('post-id-1', 3)`
- **THEN** 系統回傳最多 3 篇與指定文章同分類或同標籤的 PUBLISHED 文章，不包含指定文章本身，包含 title、slug、excerpt、coverImage、publishedAt

#### Scenario: 無相關文章

- **WHEN** 指定文章沒有分類也沒有標籤
- **THEN** 系統回傳空陣列

#### Scenario: 相關文章排序

- **WHEN** 系統找到多篇相關文章
- **THEN** 優先回傳同分類的文章，其次為同標籤的文章，按 `publishedAt` 降序排列
