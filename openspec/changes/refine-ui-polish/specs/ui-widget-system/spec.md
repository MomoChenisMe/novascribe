## MODIFIED Requirements

### Requirement: Widget Types
系統 SHALL 支援至少三種基礎 Widget 類型：RichText (HTML/Markdown), ImageGrid (圖片牆), LinkList (連結列表)，並根據類型最佳化展示寬度。

#### Scenario: ImageGrid Widget (Certifications)
- **WHEN** 點擊 "Certifications" 連結
- **THEN** 彈出寬 Modal (`max-w-4xl`) 顯示證照圖片網格
- **THEN** 圖片以 3 欄網格佈局 (Desktop) 或 1 欄 (Mobile) 展示

#### Scenario: RichText Widget (Disclaimer)
- **WHEN** 點擊 "Disclaimer" 連結
- **THEN** 彈出窄 Modal (`max-w-lg`) 顯示免責聲明文字

#### Scenario: LinkList Widget
- **WHEN** 點擊 LinkList 類型 Widget
- **THEN** 彈出窄 Modal (`max-w-lg`) 顯示連結列表
