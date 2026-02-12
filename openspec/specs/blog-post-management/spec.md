## ADDED Requirements

### Requirement: 建立新文章

系統 SHALL 允許管理者建立新文章，必須提供標題和內容，可選填摘要、封面圖片、分類、標籤。文章建立後預設狀態為草稿（DRAFT）。系統 SHALL 根據標題自動生成 slug，管理者可手動修改。

#### Scenario: 成功建立草稿文章

- **WHEN** 管理者填寫標題「我的第一篇文章」和 Markdown 內容並提交
- **THEN** 系統建立一篇狀態為 DRAFT 的文章，自動生成 slug「wo-de-di-yi-pian-wen-zhang」，並回傳文章資料

#### Scenario: 建立文章時自動生成版本快照

- **WHEN** 管理者成功建立一篇新文章
- **THEN** 系統自動建立版本 1 的快照，記錄完整標題和內容

#### Scenario: 標題為空時建立失敗

- **WHEN** 管理者提交空白標題的文章
- **THEN** 系統回傳 400 錯誤，提示「標題為必填欄位」

#### Scenario: Slug 重複時自動加後綴

- **WHEN** 管理者建立標題為「測試」的文章，但 slug「ce-shi」已存在
- **THEN** 系統自動將 slug 設為「ce-shi-2」

### Requirement: 編輯文章

系統 SHALL 允許管理者編輯已存在的文章，包含標題、內容、摘要、封面圖片、分類、標籤。每次儲存 SHALL 自動建立新的版本快照。

#### Scenario: 成功更新文章內容

- **WHEN** 管理者修改文章標題和內容後儲存
- **THEN** 系統更新文章資料，更新 `updatedAt` 時間戳

#### Scenario: 更新文章時自動建立版本

- **WHEN** 管理者儲存文章修改
- **THEN** 系統自動建立下一個版本號的快照

#### Scenario: 編輯不存在的文章

- **WHEN** 管理者嘗試更新一篇不存在的文章
- **THEN** 系統回傳 404 錯誤

### Requirement: 刪除文章

系統 SHALL 允許管理者刪除文章。刪除文章時 SHALL 同時刪除其所有版本歷史、標籤關聯和評論。

#### Scenario: 成功刪除文章

- **WHEN** 管理者確認刪除一篇文章
- **THEN** 系統刪除該文章及其所有版本歷史、標籤關聯和評論，回傳成功訊息

#### Scenario: 刪除不存在的文章

- **WHEN** 管理者嘗試刪除一篇不存在的文章
- **THEN** 系統回傳 404 錯誤

#### Scenario: 刪除文章時級聯刪除評論

- **WHEN** 管理員刪除一篇文章，該文章有 10 則評論
- **THEN** 系統刪除文章的同時，級聯刪除所有 10 則評論（包含 replies）

### Requirement: 取得文章列表

系統 SHALL 提供分頁的文章列表，支援按狀態篩選、分類篩選、標籤篩選、關鍵字搜尋、排序。預設按建立時間降序排列。

#### Scenario: 取得所有文章的第一頁

- **WHEN** 管理者請求文章列表，未指定任何篩選條件
- **THEN** 系統回傳第一頁文章（預設 20 筆），包含分頁資訊（總數、總頁數、當前頁碼）

#### Scenario: 依狀態篩選文章

- **WHEN** 管理者篩選狀態為 PUBLISHED 的文章
- **THEN** 系統僅回傳狀態為 PUBLISHED 的文章列表

#### Scenario: 關鍵字搜尋文章

- **WHEN** 管理者輸入關鍵字「Next.js」搜尋
- **THEN** 系統回傳標題或內容包含「Next.js」的文章列表

#### Scenario: 依分類篩選文章

- **WHEN** 管理者選擇特定分類進行篩選
- **THEN** 系統僅回傳屬於該分類的文章列表

#### Scenario: 自訂排序

- **WHEN** 管理者選擇按標題升序排列
- **THEN** 系統回傳按標題字母順序升序排列的文章列表

### Requirement: 取得單篇文章

系統 SHALL 允許管理者取得單篇文章的完整資料，包含分類和標籤資訊。

#### Scenario: 成功取得文章詳情

- **WHEN** 管理者請求一篇存在的文章
- **THEN** 系統回傳文章完整資料，包含分類名稱和所有標籤

#### Scenario: 取得不存在的文章

- **WHEN** 管理者請求一篇不存在的文章
- **THEN** 系統回傳 404 錯誤

### Requirement: 文章狀態切換

系統 SHALL 允許管理者切換文章狀態。支援的狀態轉換：DRAFT → PUBLISHED、DRAFT → SCHEDULED、PUBLISHED → ARCHIVED、ARCHIVED → DRAFT、SCHEDULED → DRAFT。發佈時 SHALL 自動設定 `publishedAt` 時間。

#### Scenario: 將草稿發佈

- **WHEN** 管理者將一篇 DRAFT 文章狀態切換為 PUBLISHED
- **THEN** 系統更新文章狀態為 PUBLISHED，設定 `publishedAt` 為當前時間

#### Scenario: 將文章下架

- **WHEN** 管理者將一篇 PUBLISHED 文章狀態切換為 ARCHIVED
- **THEN** 系統更新文章狀態為 ARCHIVED

#### Scenario: 設定排程發佈

- **WHEN** 管理者將一篇 DRAFT 文章設定為 SCHEDULED，並指定未來的發佈時間
- **THEN** 系統更新文章狀態為 SCHEDULED，記錄 `scheduledAt` 時間

#### Scenario: 排程時間已過的排程發佈

- **WHEN** 管理者嘗試設定排程發佈時間為過去的時間
- **THEN** 系統回傳 400 錯誤，提示「排程時間必須為未來時間」

#### Scenario: 無效的狀態轉換

- **WHEN** 管理者嘗試將 ARCHIVED 文章直接切換為 PUBLISHED
- **THEN** 系統回傳 400 錯誤，提示不允許的狀態轉換

### Requirement: Markdown 編輯器

系統 SHALL 提供 Markdown 編輯器，支援即時預覽、GFM 語法、程式碼語法高亮。編輯器 SHALL 支援圖片插入（從媒體庫選擇或直接上傳）。

#### Scenario: 即時預覽 Markdown 內容

- **WHEN** 管理者在編輯器中輸入 Markdown 語法
- **THEN** 右側預覽區域即時渲染 HTML 結果

#### Scenario: 插入圖片到編輯器

- **WHEN** 管理者點擊插入圖片按鈕並選擇媒體庫中的圖片
- **THEN** 編輯器在游標位置插入 Markdown 圖片語法 `![alt](url)`

#### Scenario: 程式碼區塊語法高亮

- **WHEN** 管理者在編輯器中輸入程式碼區塊（使用三個反引號並指定語言）
- **THEN** 預覽區域顯示帶有語法高亮的程式碼

### Requirement: 批次操作

系統 SHALL 允許管理者對多篇文章執行批次操作，包含批次刪除、批次發佈、批次下架。單次批次操作最多 50 篇。

#### Scenario: 批次刪除文章

- **WHEN** 管理者選取 3 篇文章並執行批次刪除
- **THEN** 系統刪除選取的 3 篇文章及其關聯資料

#### Scenario: 批次發佈草稿

- **WHEN** 管理者選取 5 篇 DRAFT 文章並執行批次發佈
- **THEN** 系統將 5 篇文章狀態更新為 PUBLISHED，設定 `publishedAt`

#### Scenario: 批次下架文章

- **WHEN** 管理者選取 2 篇 PUBLISHED 文章並執行批次下架
- **THEN** 系統將 2 篇文章狀態更新為 ARCHIVED

#### Scenario: 批次操作超過上限

- **WHEN** 管理者嘗試對 51 篇文章執行批次操作
- **THEN** 系統回傳 400 錯誤，提示「單次批次操作最多 50 篇」

#### Scenario: 批次發佈中包含非草稿文章

- **WHEN** 管理者選取的文章中包含已發佈的文章並執行批次發佈
- **THEN** 系統僅將符合條件的草稿文章發佈，跳過不符合條件的文章，回傳操作結果摘要

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

### Requirement: Post model 新增 comments 關聯

系統 SHALL 擴充 Post model，新增與 Comment model 的一對多關聯。刪除文章時 SHALL 級聯刪除該文章下的所有評論（已包含在「刪除文章」requirement 中）。

#### Scenario: Post 包含 comments 關聯

- **WHEN** 查詢一篇文章並 include comments
- **THEN** 系統回傳文章資料及其所有關聯的評論

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
