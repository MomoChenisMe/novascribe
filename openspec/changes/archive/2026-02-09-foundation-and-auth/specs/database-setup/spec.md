## ADDED Requirements

### Requirement: Prisma ORM 設定與 PostgreSQL 連線

系統 SHALL 使用 Prisma ORM 連接 PostgreSQL 18 資料庫，並透過環境變數 `DATABASE_URL` 設定連線字串。

#### Scenario: 資料庫連線成功

- **WHEN** 應用程式啟動
- **THEN** Prisma Client SHALL 成功連接到 PostgreSQL 資料庫

#### Scenario: 資料庫連線失敗

- **WHEN** `DATABASE_URL` 環境變數未設定或連線字串錯誤
- **THEN** 系統 SHALL 拋出明確的錯誤訊息，說明資料庫連線失敗的原因

#### Scenario: Prisma Client Singleton

- **WHEN** 多個模組同時需要資料庫存取
- **THEN** SHALL 共用同一個 Prisma Client 實例，避免連線池耗盡

### Requirement: Users 資料表設計

系統 SHALL 建立 `users` 資料表，儲存後台管理者帳號資訊。

#### Scenario: Users 資料表結構正確

- **WHEN** 執行 migration
- **THEN** `users` 資料表 SHALL 包含以下欄位：
  - `id`：主鍵，使用 cuid 格式
  - `email`：唯一索引，不可為空
  - `name`：可為空
  - `password_hash`：不可為空
  - `created_at`：建立時間，預設為當前時間
  - `updated_at`：更新時間，自動更新

#### Scenario: Email 唯一性約束

- **WHEN** 嘗試建立重複 email 的使用者
- **THEN** 資料庫 SHALL 拒絕該操作並回傳唯一性約束錯誤

### Requirement: Migration 流程

系統 SHALL 使用 Prisma Migrate 管理資料庫 schema 變更。

#### Scenario: 初始 migration 建立

- **WHEN** 執行 `npx prisma migrate dev`
- **THEN** SHALL 建立 `users` 資料表並記錄 migration 歷史

#### Scenario: Migration 可重複執行

- **WHEN** 在已有 migration 的環境中再次執行 migrate
- **THEN** SHALL 只執行尚未套用的 migration，不影響既有資料

### Requirement: 種子資料腳本

系統 SHALL 提供種子資料腳本（seed script），用於建立初始管理者帳號。

#### Scenario: 建立初始管理者

- **WHEN** 執行 `npx prisma db seed`
- **THEN** SHALL 在 `users` 資料表中建立一個管理者帳號，密碼使用 bcrypt 雜湊

#### Scenario: 種子資料可重複執行

- **WHEN** 重複執行 seed 腳本
- **THEN** SHALL 使用 upsert 策略，若帳號已存在則更新而非拋出錯誤

### Requirement: 密碼安全儲存

系統 SHALL 使用 bcrypt 演算法對密碼進行雜湊處理，永不儲存明文密碼。

#### Scenario: 密碼雜湊

- **WHEN** 建立或更新使用者密碼
- **THEN** SHALL 使用 bcrypt 搭配至少 10 rounds salt 進行雜湊後儲存

#### Scenario: 明文密碼不被記錄

- **WHEN** 任何密碼相關操作發生
- **THEN** 明文密碼 SHALL NOT 出現在日誌、錯誤訊息、或 API 回應中
