# public-pages

## Purpose

定義 NovaScribe 前台公開頁面的整體架構與 Layout 整合策略，確保所有頁面一致使用極簡設計系統。

## Requirements

### Requirement: Public Page Wrapper
系統 SHALL 更新所有公開頁面的 Layout Wrapper，套用新的 Minimal Layout。

#### Scenario: Page container
- **WHEN** 進入任何公開頁面
- **THEN** 頁面應包覆在 Minimal Layout 結構中
- **THEN** 頂部不顯示舊版 Header
