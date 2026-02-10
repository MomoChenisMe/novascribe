## ADDED Requirements

### Requirement: 評論區容器元件

系統 SHALL 在文章詳情頁面底部顯示評論區（CommentSection），使用 client-side rendering 載入已核准評論和提交表單。

#### Scenario: 載入評論區

- **WHEN** 訪客造訪文章詳情頁面
- **THEN** 頁面底部顯示評論區，包含：評論數量標題、已核准評論列表、評論提交表單

#### Scenario: 評論區載入狀態

- **WHEN** 評論區正在從 API 載入評論資料
- **THEN** 系統顯示載入動畫（skeleton 或 spinner），載入完成後顯示評論列表

#### Scenario: 評論區載入失敗

- **WHEN** API 請求失敗或網路錯誤
- **THEN** 系統顯示「載入評論失敗，請重新整理頁面」的錯誤提示

### Requirement: 巢狀評論顯示

系統 SHALL 以巢狀縮排方式顯示評論。頂層評論無縮排，回覆（第 2 層）向右縮排。每則評論顯示作者暱稱、時間、Markdown 渲染後的內容、回覆按鈕。

#### Scenario: 顯示頂層評論

- **WHEN** 評論區載入頂層評論
- **THEN** 每則頂層評論顯示：Gravatar 頭像（依據 Email hash）、作者暱稱、相對時間（如「3 小時前」）、Markdown 渲染後的內容、「回覆」按鈕

#### Scenario: 顯示巢狀回覆

- **WHEN** 一則頂層評論有 3 則回覆
- **THEN** 3 則回覆在頂層評論下方縮排顯示，按 createdAt 升序排列

#### Scenario: 最多 2 層縮排

- **WHEN** 評論結構為頂層 → 回覆
- **THEN** UI 最多顯示 2 層縮排，不會出現更深層的巢狀

### Requirement: 評論提交表單

系統 SHALL 提供評論提交表單，包含暱稱、Email、內容（Markdown textarea）和隱藏的 honeypot 欄位。

#### Scenario: 顯示評論表單

- **WHEN** 訪客查看評論區
- **THEN** 頁面顯示評論提交表單，包含：暱稱輸入框（必填）、Email 輸入框（必填，提示不會公開）、內容 textarea（必填，支援 Markdown）、「送出評論」按鈕

#### Scenario: Honeypot 欄位隱藏

- **WHEN** 評論表單渲染完成
- **THEN** 表單包含一個 name="website" 的隱藏欄位，使用 CSS 隱藏（`position: absolute; left: -9999px`），正常使用者看不到

#### Scenario: 成功提交評論

- **WHEN** 訪客填寫完整表單並點擊「送出評論」
- **THEN** 系統送出 POST 請求至 `/api/posts/[postId]/comments`，成功後顯示「評論已送出，待審核後顯示」提示，表單清空

#### Scenario: 提交時驗證失敗

- **WHEN** 訪客未填寫暱稱或內容就點擊「送出評論」
- **THEN** 表單顯示 client-side 驗證錯誤訊息，不送出 API 請求

#### Scenario: 提交時 API 錯誤

- **WHEN** API 回傳 429（rate limit）或 400（驗證錯誤）
- **THEN** 表單下方顯示對應的錯誤訊息

#### Scenario: 提交時載入狀態

- **WHEN** 表單正在提交中
- **THEN**「送出評論」按鈕顯示 loading 狀態，禁止重複提交

### Requirement: 回覆評論功能

系統 SHALL 允許訪客在前台回覆已核准的評論。點擊「回覆」按鈕展開 inline 回覆表單。

#### Scenario: 點擊回覆按鈕

- **WHEN** 訪客點擊一則評論的「回覆」按鈕
- **THEN** 該評論下方展開 inline 回覆表單（與頂層表單相同欄位），包含「取消」按鈕

#### Scenario: 取消回覆

- **WHEN** 訪客點擊回覆表單的「取消」按鈕
- **THEN** inline 回覆表單收合，恢復原始狀態

#### Scenario: 提交回覆

- **WHEN** 訪客在 inline 回覆表單填寫內容並提交
- **THEN** 系統送出 POST 請求（包含 parentId），成功後回覆表單收合，顯示成功提示

### Requirement: Markdown 即時預覽

系統 SHALL 在評論表單中提供 Markdown 即時預覽功能。訪客切換「編輯」/「預覽」tab 可在 Markdown 原始碼和渲染結果之間切換。

#### Scenario: 切換至預覽模式

- **WHEN** 訪客在評論 textarea 輸入 Markdown 內容，點擊「預覽」tab
- **THEN** textarea 區域切換為渲染後的 HTML 預覽，顯示粗體、斜體、程式碼等格式化結果

#### Scenario: 切換回編輯模式

- **WHEN** 訪客在預覽模式點擊「編輯」tab
- **THEN** 切換回 textarea 編輯模式，Markdown 原始碼不變

#### Scenario: 空內容預覽

- **WHEN** textarea 為空時切換到預覽模式
- **THEN** 預覽區域顯示「沒有內容可預覽」的灰色提示文字

### Requirement: 評論分頁載入

系統 SHALL 支援評論分頁載入。頂層評論每頁 10 則，使用「載入更多」按鈕載入下一頁。

#### Scenario: 初始載入

- **WHEN** 評論區載入完成，總共有 25 則頂層評論
- **THEN** 系統顯示前 10 則頂層評論及其 replies，底部顯示「載入更多評論」按鈕

#### Scenario: 載入更多

- **WHEN** 訪客點擊「載入更多評論」按鈕
- **THEN** 系統載入下一頁 10 則頂層評論，追加至現有列表下方

#### Scenario: 載入完畢

- **WHEN** 所有頂層評論都已載入
- **THEN**「載入更多評論」按鈕消失或顯示為「已顯示所有評論」
