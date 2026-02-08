## ADDED Requirements

### Requirement: Next.js App Router 專案初始化
系統 SHALL 使用 Next.js 最新版本搭配 App Router 架構進行初始化，使用 TypeScript 作為主要開發語言，並啟用嚴格模式（strict mode）。

#### Scenario: 專案成功初始化
- **WHEN** 執行專案初始化
- **THEN** 產生完整的 Next.js App Router 專案結構，包含 `src/app/` 目錄

#### Scenario: TypeScript 嚴格模式啟用
- **WHEN** 檢查 `tsconfig.json`
- **THEN** `strict` 選項 SHALL 為 `true`

### Requirement: Tailwind CSS 整合
系統 SHALL 整合 Tailwind CSS 作為樣式解決方案，並設定基礎的設計 token（色彩、字型、間距）。

#### Scenario: Tailwind CSS 正常運作
- **WHEN** 在元件中使用 Tailwind CSS class
- **THEN** 樣式 SHALL 正確套用並在頁面中顯示

#### Scenario: 自訂設計 token 可用
- **WHEN** 檢查 `tailwind.config.ts`
- **THEN** SHALL 包含專案自訂的色彩主題和字型設定

### Requirement: ESLint 與 Prettier 設定
系統 SHALL 設定 ESLint 和 Prettier，確保程式碼風格一致性。

#### Scenario: ESLint 規則生效
- **WHEN** 執行 `npm run lint`
- **THEN** SHALL 根據設定的規則檢查所有 TypeScript/TSX 檔案

#### Scenario: Prettier 格式化生效
- **WHEN** 執行 `npm run format`
- **THEN** SHALL 自動格式化所有原始碼檔案

### Requirement: 測試框架設定
系統 SHALL 設定 Jest + React Testing Library 用於單元/整合測試，Playwright 用於 E2E 測試。

#### Scenario: Jest 單元測試可執行
- **WHEN** 執行 `npm run test`
- **THEN** Jest SHALL 正確執行所有 `*.test.ts` 和 `*.test.tsx` 檔案

#### Scenario: Playwright E2E 測試可執行
- **WHEN** 執行 `npm run test:e2e`
- **THEN** Playwright SHALL 正確啟動瀏覽器並執行 E2E 測試

#### Scenario: 測試覆蓋率報告生成
- **WHEN** 執行 `npm run test:coverage`
- **THEN** SHALL 生成覆蓋率報告，目標覆蓋率為 80% 以上

### Requirement: 專案使用 `src/` 目錄結構
專案 SHALL 使用 `src/` 目錄將原始碼與設定檔分離。

#### Scenario: 原始碼位於 `src/` 目錄
- **WHEN** 檢視專案結構
- **THEN** 所有應用程式碼 SHALL 位於 `src/` 目錄下，包含 `app/`、`components/`、`lib/`、`types/` 子目錄
