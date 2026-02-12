## Why

根據先前實作的 Swiss Style 前台設計，使用者回饋與設計審查發現五個視覺與互動體驗問題：Widget Modal 寬度不足、SideDrawer 頭像缺乏質感、導航按鈕對比度風險、圖片資源缺失、Footer 互動提示不足。這些問題雖不影響功能，但降低了產品的完成度與專業感。

## What Changes

- **Widget Modal 寬度調整**：針對 `image-grid` 類型 Widget，將 Modal 寬度從 `max-w-lg` 擴大至 `max-w-4xl`，改善圖片展示空間
- **SideDrawer Avatar 優化**：將灰色佔位圓改為帶有使用者首字母的品牌色 Avatar 元件，提升視覺完成度
- **NavToggle 對比度強化**：為 Hamburger 按鈕添加毛玻璃背景 (Backdrop Blur) 或半透明底座，確保在任何背景下可見
- **補全圖片資源**：建立 `/public/images/certs/` 目錄並添加 placeholder 圖片，修復 404 錯誤
- **Footer Widget 連結強化**：為 Widget 觸發按鈕添加視覺提示 (下底線或 Hover 效果)，明確標示可互動性

## Capabilities

### New Capabilities

- `ui-avatar-component`: 定義通用的 Avatar 元件規範，支援圖片、首字母、顏色主題
- `ui-modal-responsive`: 定義 Modal 元件的響應式寬度策略，根據內容類型自動調整

### Modified Capabilities

- `ui-components`: 調整 NavToggle 與 FooterBar 的視覺規範，增強對比度與互動提示
- `ui-widget-system`: 擴充 Widget Modal 的寬度邏輯，支援內容類型驅動的尺寸策略

## Impact

- **UI 層**：`NavToggle.tsx`, `SideDrawer.tsx`, `WidgetModal.tsx`, `FooterBar.tsx` 需要調整
- **資源層**：新增 `/public/images/certs/` 目錄與 placeholder 圖片
- **元件層**：新增 `Avatar.tsx` 通用元件
- **設計系統**：擴充 Modal 與 Avatar 的設計規範
