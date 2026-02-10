## ADDED Requirements

### Requirement: 新評論通知管理員

系統 SHALL 在收到新評論時，透過 Email 通知管理員。通知為非同步發送，不阻塞評論提交 API 回應。使用 Nodemailer + SMTP。

#### Scenario: 新評論觸發管理員通知

- **WHEN** 讀者成功提交一則新評論（通過 anti-spam 檢查）
- **THEN** 系統非同步發送 Email 至管理員信箱，信件包含：文章標題、評論者暱稱、評論內容摘要、評論管理連結

#### Scenario: Email 發送失敗不影響評論

- **WHEN** SMTP 連線失敗或 Email 發送錯誤
- **THEN** 系統記錄錯誤日誌，但評論仍正常儲存，不影響讀者體驗

#### Scenario: Honeypot 攔截的評論不發送通知

- **WHEN** 評論被 honeypot 攔截（靜默拒絕）
- **THEN** 系統不發送任何 Email 通知

#### Scenario: 自動標記為 Spam 的評論不發送通知

- **WHEN** 評論因內容過濾被自動標記為 SPAM
- **THEN** 系統不發送新評論通知給管理員

### Requirement: 回覆通知原評論者

系統 SHALL 在管理員回覆評論時，可選擇通知原評論者。通知信件包含回覆內容和文章連結。

#### Scenario: 管理員回覆觸發通知

- **WHEN** 管理員回覆一則評論，且原評論狀態為 APPROVED、authorEmail 有效
- **THEN** 系統非同步發送 Email 至原評論者的 authorEmail，信件包含：文章標題、管理員回覆內容、文章連結

#### Scenario: 原評論者 Email 無效時不發送

- **WHEN** 管理員回覆一則評論，但原評論者的 authorEmail 為空或格式無效
- **THEN** 系統不發送通知 Email，不回報錯誤

#### Scenario: 讀者回覆已核准評論不觸發通知

- **WHEN** 一般讀者（非管理員）回覆一則已核准評論
- **THEN** 系統不發送回覆通知（僅管理員回覆才觸發通知）

### Requirement: Email 模板

系統 SHALL 使用 HTML Email 模板發送通知信件，包含部落格名稱、文章資訊、評論內容和操作連結。

#### Scenario: 新評論通知 Email 格式

- **WHEN** 系統發送新評論通知 Email
- **THEN** 信件包含：部落格名稱作為寄件者名稱、主旨「[NovaScribe] 新評論 - {文章標題}」、HTML 正文包含文章標題、評論者暱稱、評論內容、「前往審核」連結

#### Scenario: 回覆通知 Email 格式

- **WHEN** 系統發送回覆通知 Email
- **THEN** 信件包含：部落格名稱作為寄件者名稱、主旨「[NovaScribe] 您的評論收到了回覆 - {文章標題}」、HTML 正文包含文章標題、回覆內容、「查看文章」連結

### Requirement: SMTP 設定

系統 SHALL 透過環境變數設定 SMTP 連線，包含 host、port、secure、user、pass。未設定時停用 Email 通知功能。

#### Scenario: SMTP 環境變數完整

- **WHEN** 環境變數 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS` 皆已設定
- **THEN** 系統初始化 Nodemailer transporter，Email 通知功能啟用

#### Scenario: SMTP 環境變數未設定

- **WHEN** `SMTP_HOST` 環境變數未設定
- **THEN** 系統停用 Email 通知功能，評論提交和管理流程正常運作，不發送任何通知 Email

#### Scenario: 管理員通知 Email 設定

- **WHEN** 系統需要發送管理員通知
- **THEN** 系統從環境變數 `ADMIN_EMAIL` 或 `SiteSetting` 中取得管理員 Email 作為收件地址
