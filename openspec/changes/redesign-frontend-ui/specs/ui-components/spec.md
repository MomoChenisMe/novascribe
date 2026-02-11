## ADDED Requirements

### Requirement: Button 元件

系統 MUST 提供可重用的 Button 元件，支援 Primary, Secondary, Outline, Icon 四種變體。

#### Scenario: 渲染 Primary 按鈕

- **WHEN** 開發者使用 `<Button variant="primary">Submit</Button>`
- **THEN** 系統渲染 Rose 600 背景、白色文字、膠囊型圓角的按鈕

#### Scenario: 渲染 Hover 狀態

- **WHEN** 使用者將滑鼠移至按鈕上方
- **THEN** 系統顯示 Rose 700 背景，並顯示 `cursor-pointer`

#### Scenario: 支援 Loading 狀態

- **WHEN** 開發者設定 `<Button loading={true}>`
- **THEN** 系統禁用按鈕並顯示 Loading Spinner

### Requirement: Card 元件

系統 MUST 提供卡片元件，支援 hover 效果與圖片展示。

#### Scenario: 渲染基礎卡片

- **WHEN** 開發者使用 `<Card>內容</Card>`
- **THEN** 系統渲染白色背景、`rounded-2xl` 圓角、`shadow-sm` 陰影的卡片

#### Scenario: Hover 效果

- **WHEN** 使用者將滑鼠移至卡片上方
- **THEN** 系統顯示 `shadow-md` 陰影，並向上移動 4px (`-translate-y-1`)

### Requirement: Tag 元件

系統 MUST 提供標籤元件，用於顯示分類與標籤。

#### Scenario: 渲染標籤

- **WHEN** 開發者使用 `<Tag>技術</Tag>`
- **THEN** 系統渲染 Stone 100 背景、Stone 600 文字、膠囊型圓角的標籤

#### Scenario: Hover 變色

- **WHEN** 使用者將滑鼠移至標籤上方
- **THEN** 系統顯示 Rose 50 背景、Rose 600 文字

### Requirement: Input 與 Textarea 元件

系統 MUST 提供表單輸入元件，支援 Label 與錯誤訊息顯示。

#### Scenario: 渲染 Input

- **WHEN** 開發者使用 `<Input label="Email" />`
- **THEN** 系統渲染含 label 標籤的輸入框，並顯示 Focus Ring

#### Scenario: 顯示錯誤訊息

- **WHEN** 開發者設定 `<Input error="Email 格式錯誤" />`
- **THEN** 系統在輸入框下方顯示紅色錯誤訊息

### Requirement: Navbar 元件

系統 MUST 提供導航列元件，支援 Sticky 定位與背景模糊效果。

#### Scenario: 渲染導航列

- **WHEN** 使用者進入任一頁面
- **THEN** 系統顯示 Logo (左)、選單 (中)、操作按鈕 (右) 的導航列

#### Scenario: Sticky 行為

- **WHEN** 使用者向下捲動頁面
- **THEN** 導航列固定在頂部 (`sticky top-0`)，並顯示背景模糊效果 (`backdrop-blur-md`)

### Requirement: 元件測試覆蓋率

系統 MUST 為所有 UI 元件撰寫單元測試，覆蓋率達 80% 以上。

#### Scenario: Button 元件測試

- **WHEN** 執行 `npm test`
- **THEN** 系統驗證 Button 的所有 variant 渲染正確

#### Scenario: Accessibility 測試

- **WHEN** 執行 jest-axe 測試
- **THEN** 系統驗證所有元件符合 WCAG AA 標準
