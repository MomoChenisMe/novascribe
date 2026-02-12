## MODIFIED Requirements

### Requirement: Global Design Tokens
系統 SHALL 使用 Tailwind CSS 定義全域設計變數，包含色彩、字體、間距與斷點，以支援 Modern Rose 主題。

#### Scenario: Verify color palette
- **WHEN** 開發者檢查 `tailwind.config.ts`
- **THEN** 應包含 `primary` (Rose 600), `bg-main` (Stone 50), `text-primary` (Stone 900) 等自訂色票

#### Scenario: Verify font family
- **WHEN** 檢查字體設定
- **THEN** `font-sans` 應包含 `Inter` 與 `Noto Sans TC`，並設定為預設字體

### Requirement: Responsive Grid System
系統 SHALL 定義響應式網格系統，支援手機、平板與桌面三種斷點。

#### Scenario: Grid behavior
- **WHEN** 視窗寬度改變
- **THEN** 容器最大寬度應隨斷點調整 (sm: 100%, md: 768px, lg: 1024px, xl: 1280px)

## ADDED Requirements

### Requirement: Layout V2 Container
系統 SHALL 定義全站統一的佈局容器，移除舊版預設 padding，改用更精確的間距控制以支援全寬 Hero 區塊與內容區塊的切換。

#### Scenario: Container width
- **WHEN** 在桌面版瀏覽
- **THEN** 內容區域最大寬度應限制在 1200px (或設計指定寬度) 並置中

### Requirement: Typography Scale V2
系統 SHALL 定義新的字體階層 (Type Scale)，標題與內文的比例應符合 Swiss Modernism 風格，強化對比度。

#### Scenario: Heading styles
- **WHEN** 渲染 h1 至 h6 標題
- **THEN** 應呈現明確的大小差異與行高設定 (Line-height 1.1 ~ 1.3)
