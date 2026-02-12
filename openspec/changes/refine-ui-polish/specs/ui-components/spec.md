## MODIFIED Requirements

### Requirement: Minimal Toggle Button
系統 SHALL 提供一個極簡風格的選單觸發按鈕 (Hamburger)，並確保在任何背景下清晰可見。

#### Scenario: Toggle visibility
- **WHEN** 頁面載入
- **THEN** 按鈕應常駐於畫面左上角，不受捲動影響 (Sticky/Fixed)

#### Scenario: Backdrop contrast
- **WHEN** 按鈕疊加於複雜背景 (如 Hero 圖片) 上
- **THEN** 應顯示毛玻璃背景 (backdrop-blur) 與半透明底座
- **THEN** 應有微弱陰影以增強層次

#### Scenario: Theme adaptation
- **WHEN** 在 Light Mode 下
- **THEN** 背景色為白色 80% 透明度

#### Scenario: Dark mode adaptation
- **WHEN** 在 Dark Mode 下
- **THEN** 背景色為 Neutral 900 80% 透明度

## ADDED Requirements

### Requirement: Footer Widget Button Affordance
系統 SHALL 為 Footer Widget 觸發按鈕提供清晰的互動提示。

#### Scenario: Visual hint
- **WHEN** 渲染 Widget 按鈕
- **THEN** 應顯示微妙的下底線 (underline-offset-4)

#### Scenario: Hover feedback
- **WHEN** 滑鼠懸停於 Widget 按鈕
- **THEN** 文字顏色應變為品牌主色
- **THEN** 下底線顏色應同步變為品牌主色
