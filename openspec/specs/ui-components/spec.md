# ui-components

## Purpose

定義 NovaScribe 前台的通用 UI 元件庫，提供一致的互動元件（按鈕、Modal、卡片等），支撐極簡設計系統。

## Requirements

### Requirement: Minimal Toggle Button
系統 SHALL 提供一個極簡風格的選單觸發按鈕 (Hamburger)。

#### Scenario: Toggle visibility
- **WHEN** 頁面載入
- **THEN** 按鈕應常駐於畫面左上角，不受捲動影響 (Sticky/Fixed)

### Requirement: Widget Modal
系統 SHALL 提供通用的 Modal 元件，用於展示 Footer Widget 的詳細內容。

#### Scenario: Modal behavior
- **WHEN** Widget 被觸發
- **THEN** Modal 應顯示於畫面中央，背景變暗
- **THEN** 應提供關閉按鈕與點擊背景關閉功能
