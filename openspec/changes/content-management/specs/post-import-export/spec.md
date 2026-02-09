## ADDED Requirements

### Requirement: 匯出單篇文章

系統 SHALL 允許管理者將單篇文章匯出為 Markdown 格式檔案，包含 YAML front matter（標題、日期、分類、標籤、狀態、slug）。

#### Scenario: 成功匯出已發佈文章

- **WHEN** 管理者匯出一篇已發佈的文章
- **THEN** 系統產生 Markdown 檔案，front matter 包含 title、date、slug、category、tags、status，body 為文章 Markdown 內容

#### Scenario: 匯出草稿文章

- **WHEN** 管理者匯出一篇草稿文章
- **THEN** 系統產生 Markdown 檔案，front matter 中 status 為 draft

#### Scenario: 匯出不存在的文章

- **WHEN** 管理者嘗試匯出一篇不存在的文章
- **THEN** 系統回傳 404 錯誤

### Requirement: 批次匯出文章

系統 SHALL 允許管理者批次匯出多篇文章，打包為 ZIP 檔案下載。每篇文章為一個獨立的 Markdown 檔案，以 slug 作為檔名。

#### Scenario: 批次匯出多篇文章

- **WHEN** 管理者選取 5 篇文章執行批次匯出
- **THEN** 系統產生 ZIP 檔案，包含 5 個以 slug 命名的 `.md` 檔案

#### Scenario: 批次匯出包含 front matter

- **WHEN** 管理者批次匯出文章
- **THEN** 每個 Markdown 檔案都包含完整的 YAML front matter

#### Scenario: 選取的文章為空

- **WHEN** 管理者未選取任何文章就執行批次匯出
- **THEN** 系統回傳 400 錯誤，提示「請至少選取一篇文章」

### Requirement: 從 Markdown 匯入文章

系統 SHALL 允許管理者從 Markdown 檔案匯入文章。系統 SHALL 解析 YAML front matter 取得 metadata，若無 front matter 則使用檔名作為標題。匯入的文章預設狀態為 DRAFT。

#### Scenario: 匯入包含 front matter 的 Markdown

- **WHEN** 管理者上傳一個包含 YAML front matter 的 `.md` 檔案
- **THEN** 系統解析 front matter 的 title、category、tags 等 metadata，建立草稿文章

#### Scenario: 匯入不含 front matter 的 Markdown

- **WHEN** 管理者上傳一個沒有 front matter 的 `.md` 檔案
- **THEN** 系統使用檔名（去除副檔名）作為標題，全部內容作為 body，建立草稿文章

#### Scenario: 匯入時分類自動匹配

- **WHEN** Markdown front matter 中指定分類為「技術」，系統中已有此分類
- **THEN** 系統自動將文章關聯到「技術」分類

#### Scenario: 匯入時分類不存在

- **WHEN** Markdown front matter 中指定分類為「旅遊」，但系統中無此分類
- **THEN** 系統自動建立「旅遊」分類並關聯

#### Scenario: 匯入時標籤自動匹配與建立

- **WHEN** Markdown front matter 中指定標籤 [JavaScript, React]，其中 JavaScript 已存在、React 不存在
- **THEN** 系統使用已有的 JavaScript 標籤，自動建立 React 標籤，並關聯到文章

#### Scenario: 上傳非 Markdown 檔案

- **WHEN** 管理者嘗試上傳一個 `.txt` 檔案作為匯入
- **THEN** 系統回傳 400 錯誤，提示「僅支援 .md 格式的 Markdown 檔案」
