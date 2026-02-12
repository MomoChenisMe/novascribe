## MODIFIED Requirements

### Requirement: Layout Wrapper
系統 SHALL 使用新的 Layout V2 元件作為所有公開頁面的外層容器。

#### Scenario: Page layout structure
- **WHEN** 進入任何公開頁面 (如 /posts/slug)
- **THEN** 頁面應包覆在 Layout V2 結構中
- **THEN** 頁尾應顯示新的 Rich Footer

## ADDED Requirements

### Requirement: Content Width Constraint
系統 SHALL 限制文章閱讀區域的寬度，以確保最佳閱讀體驗 (約 65-75 字元/行)。

#### Scenario: Reading width
- **WHEN** 瀏覽文章詳情頁
- **THEN** 文章內容容器寬度不應超過 800px (視 Typography 設定微調)
