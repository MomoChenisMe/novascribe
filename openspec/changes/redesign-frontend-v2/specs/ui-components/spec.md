## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Navbar Component
**Reason**: 被 Layout Minimal 與 Side Drawer 取代。
**Migration**: 移除 `<Navbar />`，改用 `<MinimalToggle />` 與 `<SideDrawer />`。
