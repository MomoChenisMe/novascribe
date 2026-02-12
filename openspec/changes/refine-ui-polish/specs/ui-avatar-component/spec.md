## ADDED Requirements

### Requirement: Avatar Display Modes
系統 SHALL 提供通用的 Avatar 元件，支援圖片、首字母、預設圖示三種顯示模式。

#### Scenario: Image mode
- **WHEN** 傳入 `src` 屬性
- **THEN** 顯示圖片作為 Avatar

#### Scenario: Initials mode
- **WHEN** 傳入 `name` 屬性但無 `src`
- **THEN** 提取首字母並顯示於品牌色背景上

#### Scenario: Fallback mode
- **WHEN** 無 `src` 且無 `name`
- **THEN** 顯示預設使用者圖示

### Requirement: Initials Extraction
系統 SHALL 從使用者名稱中智慧提取首字母，支援英文與中文名稱。

#### Scenario: English name
- **WHEN** 名稱為 "Momo Chen"
- **THEN** 提取首字母 "MC"

#### Scenario: Chinese name
- **WHEN** 名稱為 "陳默默"
- **THEN** 提取前兩字 "陳默"

#### Scenario: Single word name
- **WHEN** 名稱為 "Momo"
- **THEN** 提取首字母 "M"

### Requirement: Color Theming
系統 SHALL 使用品牌主色作為 Avatar 背景色，白色文字以確保對比度。

#### Scenario: Light mode
- **WHEN** 在 Light Mode 下渲染
- **THEN** 背景色為 Rose 600 (#E11D48)，文字為白色

#### Scenario: Dark mode
- **WHEN** 在 Dark Mode 下渲染
- **THEN** 背景色為 Rose 400 (#FB7185)，文字為白色
