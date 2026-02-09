## ADDED Requirements

### Requirement: 帳密登入認證

系統 SHALL 提供基於 email 和密碼的登入認證機制，使用 NextAuth.js Credentials Provider 實作。

#### Scenario: 登入成功

- **WHEN** 使用者提供正確的 email 和密碼
- **THEN** 系統 SHALL 驗證通過，建立 JWT session，並重新導向至 `/admin`

#### Scenario: 登入失敗 — 錯誤的密碼

- **WHEN** 使用者提供正確的 email 但錯誤的密碼
- **THEN** 系統 SHALL 拒絕登入並顯示「帳號或密碼錯誤」的通用錯誤訊息

#### Scenario: 登入失敗 — 不存在的帳號

- **WHEN** 使用者提供不存在的 email
- **THEN** 系統 SHALL 拒絕登入並顯示「帳號或密碼錯誤」的通用錯誤訊息（不洩漏帳號是否存在）

#### Scenario: 登入失敗 — 空白欄位

- **WHEN** 使用者未填寫 email 或密碼
- **THEN** 系統 SHALL 顯示欄位必填的驗證錯誤

### Requirement: JWT Session 管理

系統 SHALL 使用 JWT 策略管理使用者 session。

#### Scenario: Session Token 建立

- **WHEN** 登入成功
- **THEN** 系統 SHALL 簽發包含使用者 ID 和 email 的 JWT token

#### Scenario: Session Token 過期

- **WHEN** JWT token 超過設定的過期時間（24 小時）
- **THEN** 系統 SHALL 要求使用者重新登入

#### Scenario: Session Token 自動刷新

- **WHEN** 使用者在 token 過期前持續使用系統
- **THEN** 系統 SHALL 自動延長 session 有效期

### Requirement: 登出功能

系統 SHALL 提供登出功能，清除使用者的 session。

#### Scenario: 登出成功

- **WHEN** 使用者點擊登出按鈕
- **THEN** 系統 SHALL 清除 JWT session cookie 並重新導向至登入頁面

#### Scenario: 登出後無法存取後台

- **WHEN** 使用者已登出
- **THEN** 嘗試存取 `/admin` 路由 SHALL 被重新導向至登入頁面

### Requirement: 後台路由保護

系統 SHALL 透過 Next.js middleware 保護所有 `/admin` 路由，未認證的使用者不得存取。

#### Scenario: 未認證存取後台頁面

- **WHEN** 未登入的使用者嘗試存取 `/admin` 下的任何頁面
- **THEN** 系統 SHALL 自動重新導向至 `/login` 頁面

#### Scenario: 認證後存取後台頁面

- **WHEN** 已登入的使用者存取 `/admin` 下的頁面
- **THEN** 系統 SHALL 正常顯示頁面內容

#### Scenario: API 路由保護

- **WHEN** 未認證的請求嘗試存取 `/api/admin/*` 端點
- **THEN** 系統 SHALL 回傳 HTTP 401 Unauthorized

### Requirement: 登入頁面

系統 SHALL 提供 `/login` 登入頁面，包含 email 和密碼輸入欄位。

#### Scenario: 登入頁面正常顯示

- **WHEN** 使用者存取 `/login`
- **THEN** 頁面 SHALL 顯示 email 輸入框、密碼輸入框、登入按鈕

#### Scenario: 登入中狀態顯示

- **WHEN** 使用者點擊登入按鈕後等待回應
- **THEN** 按鈕 SHALL 顯示載入狀態，防止重複提交

#### Scenario: 已登入使用者存取登入頁

- **WHEN** 已登入的使用者存取 `/login`
- **THEN** 系統 SHALL 自動重新導向至 `/admin`

### Requirement: 暴力破解防護

系統 SHALL 實作基本的登入速率限制，防止暴力破解攻擊。

#### Scenario: 連續登入失敗限制

- **WHEN** 同一 IP 在 15 分鐘內連續登入失敗超過 5 次
- **THEN** 系統 SHALL 暫時鎖定該 IP 的登入嘗試，並回傳 HTTP 429 Too Many Requests

#### Scenario: 鎖定期滿後恢復

- **WHEN** IP 鎖定時間到期（15 分鐘）
- **THEN** 系統 SHALL 允許該 IP 再次嘗試登入
