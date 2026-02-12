## ADDED Requirements

### Requirement: Featured Post Hero
系統 SHALL 在首頁頂部展示最新一篇文章作為 Featured Hero，視覺佔比約螢幕寬度 100%。

#### Scenario: Hero content
- **WHEN** 進入首頁
- **THEN** 頂部顯示大張封面圖 (Featured Image)
- **THEN** 標題與摘要覆蓋於圖片上方或下方

### Requirement: Visual Grid Layout
系統 SHALL 使用 3 欄式卡片網格展示其餘文章，強調視覺呈現。

#### Scenario: Grid responsive
- **WHEN** 在桌面版 (lg 以上) 瀏覽
- **THEN** 文章以 3 欄式卡片呈現 (Visual Grid)
- **THEN** 每張卡片皆包含封面縮圖

#### Scenario: Mobile grid
- **WHEN** 在手機版 (md 以下) 瀏覽
- **THEN** 文章以 1 欄式卡片呈現
