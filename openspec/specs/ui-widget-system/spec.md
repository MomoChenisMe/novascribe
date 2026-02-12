# ui-widget-system

## Purpose

定義 NovaScribe 的 Widget 系統，提供可擴展的 Footer Widget 框架，支援動態載入不同類型的互動內容（如證照、聲明、連結等）。

## Requirements

### Requirement: Footer Widget Container
系統 SHALL 提供 Footer 區域的 Widget 容器，支援動態載入不同類型的 Widget 元件。

#### Scenario: Footer structure
- **WHEN** 捲動至頁面底部
- **THEN** 顯示 "Minimal Footer Bar" (版權宣告)
- **THEN** 顯示 Widget 觸發連結 (如 "Certifications", "Disclaimer")

### Requirement: Widget Types
系統 SHALL 支援至少三種基礎 Widget 類型：RichText (HTML/Markdown), ImageGrid (圖片牆), LinkList (連結列表)。

#### Scenario: ImageGrid Widget (Certifications)
- **WHEN** 點擊 "Certifications" 連結
- **THEN** 彈出 Modal 或 Drawer 顯示證照圖片網格

#### Scenario: RichText Widget (Disclaimer)
- **WHEN** 點擊 "Disclaimer" 連結
- **THEN** 彈出 Modal 顯示免責聲明文字
