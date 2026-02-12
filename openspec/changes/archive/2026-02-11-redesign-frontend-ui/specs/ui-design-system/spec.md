## ADDED Requirements

### Requirement: 色彩系統定義

系統 MUST 定義完整的色彩 Token 系統，包含品牌色、中性色、語意色，並整合至 Tailwind CSS 配置中。

#### Scenario: 定義品牌主色

- **WHEN** 開發者需要使用品牌主色
- **THEN** 系統提供 `primary` Token，對應 Rose 600 (#E11D48)

#### Scenario: 定義品牌 Hover 狀態色

- **WHEN** 開發者需要定義按鈕或連結的 Hover 狀態
- **THEN** 系統提供 `primary-hover` Token，對應 Rose 700 (#BE123C)

#### Scenario: 定義中性背景色

- **WHEN** 開發者需要定義頁面背景色
- **THEN** 系統提供 `bg-main` Token，對應 Stone 50 (#FAFAF9)

#### Scenario: 定義語意色（成功、警告、錯誤）

- **WHEN** 開發者需要顯示成功、警告或錯誤狀態
- **THEN** 系統提供 `success`, `warning`, `error` Token，對應 Emerald 600, Amber 500, Red 600

### Requirement: 字體系統定義

系統 MUST 定義字體家族與字級階層，並整合至 Tailwind CSS 與 Next.js 字體優化機制。

#### Scenario: 定義主要 Sans-serif 字體

- **WHEN** 開發者需要使用內文字體
- **THEN** 系統提供 `font-sans`，對應 Inter 與 Noto Sans TC

#### Scenario: 定義程式碼字體

- **WHEN** 開發者需要顯示程式碼區塊
- **THEN** 系統提供 `font-mono`，對應 JetBrains Mono

#### Scenario: 定義字級階層

- **WHEN** 開發者需要設定標題與內文大小
- **THEN** 系統提供 `text-4xl` (36px) 至 `text-xs` (12px) 的字級 Token

#### Scenario: 定義最佳行高

- **WHEN** 開發者設定文章內文樣式
- **THEN** 系統 MUST 使用 `line-height: 1.75`，確保最佳閱讀體驗

### Requirement: 間距與圓角系統

系統 MUST 定義統一的間距階層與圓角設定，確保視覺一致性。

#### Scenario: 定義按鈕圓角

- **WHEN** 開發者建立按鈕元件
- **THEN** 系統使用 `rounded-full` (膠囊型) 或 `rounded-xl` (大圓角)

#### Scenario: 定義卡片圓角

- **WHEN** 開發者建立卡片元件
- **THEN** 系統使用 `rounded-2xl`

#### Scenario: 定義間距階層

- **WHEN** 開發者設定元件內邊距
- **THEN** 系統提供 Tailwind 預設間距階層 (0.5rem, 1rem, 1.5rem, 2rem...)

### Requirement: 陰影與邊框系統

系統 MUST 定義卡片陰影、邊框樣式，提升視覺層次感。

#### Scenario: 定義卡片陰影

- **WHEN** 開發者建立卡片元件
- **THEN** 系統使用 `shadow-sm` 預設狀態，`hover:shadow-md` Hover 狀態

#### Scenario: 定義邊框顏色

- **WHEN** 開發者建立分隔線或邊框
- **THEN** 系統使用 `border-stone-100` (淺色) 或 `border-stone-200` (深色)

### Requirement: Tailwind CSS 配置整合

系統 MUST 將所有 Design Token 整合至 `tailwind.config.ts`，確保開發者可透過 Tailwind class 直接使用。

#### Scenario: 擴充 Tailwind 色票

- **WHEN** 開發者執行 `npm run dev`
- **THEN** Tailwind 編譯器讀取 `tailwind.config.ts` 中的自訂色票

#### Scenario: 啟用字體 CSS Variables

- **WHEN** Next.js 載入字體
- **THEN** 系統產生 `--font-inter` 與 `--font-noto` CSS Variables

#### Scenario: 支援 Intellisense

- **WHEN** 開發者在 IDE 中輸入 `bg-primary`
- **THEN** VSCode / IDE 顯示自動補全與色票預覽
