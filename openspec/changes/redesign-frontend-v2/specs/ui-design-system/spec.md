## MODIFIED Requirements

### Requirement: Color Palette - Accents Only
系統 SHALL 調整色彩策略，主色 (Rose 600) 僅用於互動元素，背景與文字全面使用單色系 (Monochrome)。

#### Scenario: Button colors
- **WHEN** 渲染 Primary Button
- **THEN** 背景色應為 Rose 600 (`#E11D48`)

#### Scenario: Background colors
- **WHEN** 渲染頁面背景
- **THEN** 應為純白 (`#FFFFFF`) 或極淺灰 (`#FAFAFA`)，不再混用主色調淡色系

### Requirement: Typography - Full Sans
系統 SHALL 全面使用無襯線字體 (Inter + Noto Sans TC)，不再區分標題與內文字體。

#### Scenario: Font stack
- **WHEN** 渲染任何文字
- **THEN** `font-family` 應優先使用 `Inter` 與 `Noto Sans TC`
