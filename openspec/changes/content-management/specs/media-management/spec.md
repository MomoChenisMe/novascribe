## ADDED Requirements

### Requirement: 上傳媒體檔案
系統 SHALL 允許管理者上傳圖片檔案。支援的格式：JPEG、PNG、GIF、WebP。單檔大小上限 10MB。上傳的圖片 SHALL 自動壓縮（最大寬度 1920px，品質 85%）並生成縮圖（最大寬度 400px，品質 80%）。

#### Scenario: 成功上傳 JPEG 圖片
- **WHEN** 管理者上傳一張 5MB 的 JPEG 圖片
- **THEN** 系統壓縮圖片、生成縮圖、儲存至指定位置，回傳媒體記錄（含 URL、檔名、尺寸、大小）

#### Scenario: 上傳 PNG 圖片
- **WHEN** 管理者上傳一張 PNG 格式的圖片
- **THEN** 系統處理並儲存圖片，回傳媒體記錄

#### Scenario: 上傳 WebP 圖片
- **WHEN** 管理者上傳一張 WebP 格式的圖片
- **THEN** 系統處理並儲存圖片，回傳媒體記錄

#### Scenario: 檔案大小超過上限
- **WHEN** 管理者嘗試上傳一張 15MB 的圖片
- **THEN** 系統回傳 400 錯誤，提示「檔案大小不得超過 10MB」

#### Scenario: 不支援的檔案格式
- **WHEN** 管理者嘗試上傳一個 PDF 檔案
- **THEN** 系統回傳 400 錯誤，提示「不支援的檔案格式，僅接受 JPEG、PNG、GIF、WebP」

#### Scenario: 未選擇檔案
- **WHEN** 管理者提交上傳請求但未附帶任何檔案
- **THEN** 系統回傳 400 錯誤，提示「請選擇要上傳的檔案」

### Requirement: 媒體列表
系統 SHALL 提供分頁的媒體檔案列表，按上傳時間降序排列，每筆包含檔名、預覽縮圖、檔案大小、上傳時間。

#### Scenario: 取得媒體列表
- **WHEN** 管理者請求媒體列表
- **THEN** 系統回傳分頁的媒體清單，每筆包含 id、filename、originalName、url、mimeType、size、width、height、createdAt

#### Scenario: 空媒體列表
- **WHEN** 系統中尚無任何媒體檔案
- **THEN** 系統回傳空陣列

#### Scenario: 分頁取得媒體
- **WHEN** 管理者請求第 2 頁的媒體列表，每頁 20 筆
- **THEN** 系統回傳第 21-40 筆的媒體記錄

### Requirement: 刪除媒體
系統 SHALL 允許管理者刪除媒體檔案。刪除時 SHALL 同時刪除實體檔案（本地或 S3）和資料庫記錄。

#### Scenario: 成功刪除本地媒體檔案
- **WHEN** 管理者刪除一個儲存在本地的媒體檔案
- **THEN** 系統刪除本地檔案和資料庫記錄

#### Scenario: 成功刪除 S3 媒體檔案
- **WHEN** 管理者刪除一個儲存在 S3 的媒體檔案
- **THEN** 系統刪除 S3 物件和資料庫記錄

#### Scenario: 刪除不存在的媒體
- **WHEN** 管理者嘗試刪除一個不存在的媒體檔案
- **THEN** 系統回傳 404 錯誤

### Requirement: 儲存模式切換
系統 SHALL 支援本地儲存和 S3 儲存兩種模式，透過環境變數 `STORAGE_TYPE` 切換。本地模式儲存於 `public/uploads/YYYY/MM/` 目錄。S3 模式上傳至指定的 S3 bucket。

#### Scenario: 本地儲存模式
- **WHEN** 環境變數 `STORAGE_TYPE=local`，管理者上傳圖片
- **THEN** 系統將圖片儲存至 `public/uploads/YYYY/MM/` 目錄，回傳本地 URL 路徑

#### Scenario: S3 儲存模式
- **WHEN** 環境變數 `STORAGE_TYPE=s3`，管理者上傳圖片
- **THEN** 系統將圖片上傳至 S3 bucket，回傳 S3 URL

#### Scenario: 未設定儲存類型時預設本地
- **WHEN** 環境變數 `STORAGE_TYPE` 未設定
- **THEN** 系統預設使用本地儲存模式
