## ADDED Requirements

### Requirement: Layout V2 Structure
系統 SHALL 實作全新的全站佈局結構，包含左側導航欄 (Sidebar) 與右側內容區 (Main Content)。

#### Scenario: Desktop layout
- **WHEN** 在桌面版 (lg 以上) 瀏覽
- **THEN** 左側應顯示固定的導航欄 (Sidebar)
- **THEN** 右側應顯示主要內容區域，且不被 Sidebar 遮擋

#### Scenario: Mobile layout
- **WHEN** 在手機版 (md 以下) 瀏覽
- **THEN** Sidebar 應隱藏，改由漢堡選單觸發 Drawer 顯示
- **THEN** 頂部應顯示 Minimal Header

### Requirement: Sidebar Navigation
系統 SHALL 在 Sidebar 提供完整的導航功能，包含個人簡介、選單連結與社群圖示。

#### Scenario: Sidebar content
- **WHEN** 檢視 Sidebar
- **THEN** 應顯示作者頭像、名稱、簡介
- **THEN** 應顯示主要導航連結 (首頁、分類、標籤、關於)
- **THEN** 應顯示社群媒體連結圖示
