## ADDED Requirements

### Requirement: Content-Driven Modal Width
系統 SHALL 根據 Modal 內容類型動態調整寬度，改善內容展示效果。

#### Scenario: Text content modal
- **WHEN** Modal 類型為 `rich-text` 或 `link-list`
- **THEN** 使用窄寬度 `max-w-lg` (512px) 以最佳化閱讀體驗

#### Scenario: Image grid modal
- **WHEN** Modal 類型為 `image-grid`
- **THEN** 使用寬寬度 `max-w-4xl` (896px) 以提供充足展示空間

#### Scenario: Responsive behavior
- **WHEN** 螢幕寬度小於 Modal 最大寬度
- **THEN** Modal 寬度應響應式縮小並保持 16px 左右邊距

### Requirement: Modal Content Layout
系統 SHALL 針對不同內容類型最佳化 Modal 內部佈局。

#### Scenario: Image grid layout
- **WHEN** 顯示圖片網格內容
- **THEN** 使用 3 欄網格佈局 (Desktop)，1 欄佈局 (Mobile)

#### Scenario: Text content layout
- **WHEN** 顯示文字內容
- **THEN** 使用單欄佈局並限制行長以提升可讀性
