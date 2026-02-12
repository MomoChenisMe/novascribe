## MODIFIED Requirements

### Requirement: Footer Component
系統 SHALL 提供頁尾元件，顯示網站資訊、連結與版權宣告。

#### Scenario: Footer content
- **WHEN** 使用者捲動至頁面底部
- **THEN** 應看到 Logo、簡介、社群連結、網站地圖連結與版權年份
- **THEN** 應看到免責聲明 (Disclaimer) 與專業證照 (Certifications) 區塊
- **THEN** 版面應採用多欄式設計 (參考 blog.miniasp.com)

## REMOVED Requirements

### Requirement: Navbar Component
**Reason**: 被新的 Sidebar Navigation 或 Minimal Header 取代，不再使用傳統的置頂導航列。
**Migration**: 移除 `<Navbar />` 元件引用，改用 Layout V2 的導航結構。

## ADDED Requirements

### Requirement: Minimal Header Component
系統 SHALL 提供極簡化的頁首元件，僅在特定情境 (如手機版或特定頁面) 顯示最必要的導航元素。

#### Scenario: Mobile navigation
- **WHEN** 在手機版瀏覽
- **THEN** 應顯示漢堡選單按鈕與網站 Logo
