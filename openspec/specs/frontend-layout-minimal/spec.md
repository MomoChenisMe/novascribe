# frontend-layout-minimal

## Purpose

定義 NovaScribe 前台的極簡 Layout 系統，實作無 Header 的 Swiss Style 設計，透過隱藏式側邊導航提供流暢的閱讀體驗。

## Requirements

### Requirement: Layout Minimal (No Header)
系統 SHALL 提供全新的極簡 Layout 容器，頂部不保留任何常駐 Navbar，僅保留左上角極簡導航按鈕 (Hamburger)。

#### Scenario: Mobile view
- **WHEN** 在手機版 (md 以下) 瀏覽
- **THEN** 頂部不顯示 Header
- **THEN** 左上角浮動顯示漢堡按鈕 (Icon Button)

#### Scenario: Desktop view
- **WHEN** 在桌面版 (lg 以上) 瀏覽
- **THEN** 左側顯示漢堡按鈕與品牌 Logo
- **THEN** 內容區域置中呈現

### Requirement: Side Drawer Navigation
系統 SHALL 實作全站統一的側邊抽屜選單，作為唯一的導航入口。

#### Scenario: Drawer open
- **WHEN** 點擊左上角漢堡按鈕
- **THEN** 從左側滑出全高 Drawer 面板 (寬度約 320px)
- **THEN** 背景呈現遮罩 (Backdrop)

#### Scenario: Drawer content
- **WHEN** Drawer 開啟時
- **THEN** 頂部顯示個人頭像與簡介
- **THEN** 中間顯示主要導航連結 (首頁、分類、標籤、關於)
- **THEN** 底部顯示社群媒體連結
