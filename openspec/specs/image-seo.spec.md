# 規格:圖片管理與 SEO 設定

## 第一部分:圖片管理功能

### 概述
圖片管理模組提供本地圖片上傳、AI 自動生成 Alt Text、圖片庫瀏覽與管理功能。

### FR-IMAGE-001: 圖片上傳
**描述**: 支援多種方式上傳圖片至本地儲存  
**優先級**: P0 (必須)

#### 上傳方式
1. **點擊上傳**: 點擊按鈕選擇檔案
2. **拖拽上傳**: 拖拽圖片至上傳區域
3. **貼上上傳**: 從剪貼簿貼上圖片 (Ctrl+V / Cmd+V)
4. **批次上傳**: 一次選擇多個圖片

#### 檔案限制
- 支援格式:JPG, PNG, GIF, WebP
- 單檔大小限制:10MB
- 批次上傳最多:20 張

#### 自動處理
1. **重新命名**:使用時間戳記 + 隨機字串 (如:`20260207_a3f8b2.jpg`)
2. **圖片壓縮**:
   - 品質:80%
   - 最大寬度:1920px
   - 保持長寬比
3. **生成縮圖**:
   - 小:200x200 (用於列表)
   - 中:600x600 (用於預覽)
   - 大:1200x1200 (用於文章內嵌)

#### 儲存路徑
- 基礎路徑:`/public/uploads/images/`
- 依年月分資料夾:`/public/uploads/images/2026/02/`
- 完整範例:`/public/uploads/images/2026/02/20260207_a3f8b2.jpg`

#### 上傳回饋
- 顯示上傳進度條
- 成功後顯示圖片預覽與 URL
- 失敗時顯示錯誤訊息 (檔案過大、格式不支援等)

---

### FR-IMAGE-002: AI 自動生成 Alt Text
**描述**: 使用 AI 分析圖片內容,自動生成 Alt Text  
**優先級**: P1 (高)

#### AI 模型選擇
- 優先使用:OpenAI GPT-4 Vision
- 備選:Google Gemini Vision
- 本地備案:BLIP-2 (透過 Ollama)

#### 生成流程
1. 圖片上傳成功後,自動觸發 AI 分析
2. 將圖片轉為 Base64 或提供 URL
3. 呼叫 AI API,請求描述圖片內容
4. 解析回應,生成簡潔的 Alt Text (最多 125 字元)
5. 儲存至資料庫,與圖片關聯

#### Prompt 範本
```
請用繁體中文描述這張圖片的主要內容,以便作為網頁的 Alt Text。
要求:
1. 簡潔明確,最多 125 字元
2. 描述主要元素與視覺重點
3. 適合無障礙閱讀器朗讀
4. 不要使用「這是一張...的圖片」開頭

範例:
- 良好:「夕陽下的海灘,海浪拍打岸邊,遠處有帆船」
- 不佳:「這是一張海灘的照片」
```

#### 手動編輯
- 生成後可手動編輯
- 支援一鍵重新生成
- 標記「已手動編輯」,避免被覆蓋

---

### FR-IMAGE-003: 圖片庫瀏覽與管理
**描述**: 顯示所有上傳圖片,支援篩選、搜尋與管理  
**優先級**: P0 (必須)

#### 顯示模式
- **網格模式**: 縮圖顯示,每行 4-6 張
- **列表模式**: 顯示檔名、尺寸、上傳時間、Alt Text

#### 篩選功能
- 依上傳時間:今日/本週/本月/全部
- 依檔案類型:JPG/PNG/GIF/WebP
- 依尺寸:小 (<500KB) / 中 (500KB-2MB) / 大 (>2MB)

#### 搜尋功能
- 搜尋檔名
- 搜尋 Alt Text
- 即時搜尋 (Debounce 300ms)

#### 圖片資訊
點擊圖片顯示詳細資訊:
- 原始檔名
- 檔案大小
- 尺寸 (寬x高)
- 上傳時間
- Alt Text (可編輯)
- URL (可複製)
- 引用次數 (在多少篇文章中使用)

#### 圖片操作
- **插入文章**: 一鍵插入至 Markdown 編輯器
- **複製 URL**: 複製圖片 URL 至剪貼簿
- **下載**: 下載原圖
- **刪除**: 刪除圖片 (檢查是否被引用)

#### 批次操作
- 多選圖片
- 批次刪除 (需確認)
- 批次編輯 Alt Text

---

### FR-IMAGE-004: 圖片引用追蹤
**描述**: 追蹤圖片在哪些文章中被使用  
**優先級**: P2 (中)

#### 追蹤機制
- 文章儲存時,掃描內容中的圖片 URL
- 建立圖片與文章的關聯表
- 刪除圖片時,檢查是否被引用

#### 引用顯示
- 在圖片資訊中顯示「引用於 N 篇文章」
- 點擊可檢視引用文章列表
- 列表顯示:文章標題、發布狀態、最後修改時間

#### 安全刪除
- 被引用的圖片無法直接刪除
- 需先解除引用或強制刪除 (警告會破壞文章圖片)

---

## 第二部分:SEO 設定功能

### 概述
SEO 設定模組提供全域 SEO 配置與單篇文章的 SEO 元數據編輯。

### FR-SEO-001: 全域 SEO 設定
**描述**: 配置網站層級的 SEO 基礎設定  
**優先級**: P0 (必須)

#### 設定項目
1. **網站基本資訊**
   - 網站名稱 (顯示在瀏覽器標籤)
   - 網站標語 (Meta Description 預設值)
   - 網站 Logo (用於 Schema.org)
   - 預設 Open Graph 圖片

2. **社交媒體連結**
   - Facebook 粉絲專頁 URL
   - Twitter/X 帳號
   - Instagram 帳號
   - LinkedIn 個人/企業頁面

3. **追蹤碼**
   - Google Analytics 4 追蹤 ID (GA4 Measurement ID)
   - Google Search Console 驗證碼
   - Google Tag Manager Container ID (選填)

4. **Robots 設定**
   - 允許搜尋引擎索引 (預設開啟)
   - Robots.txt 內容編輯
   - 允許 AI 爬蟲訓練 (預設關閉)

5. **Sitemap 設定**
   - 自動生成 Sitemap.xml
   - 更新頻率 (每日/每週)
   - 優先級規則 (首頁 1.0, 文章 0.8, 分類 0.6)

---

### FR-SEO-002: 文章 SEO 元數據編輯
**描述**: 為每篇文章獨立設定 SEO 元數據  
**優先級**: P0 (必須)

#### 元數據欄位
1. **Meta Title** (選填,預設使用文章標題)
   - 長度建議:50-60 字元
   - 即時顯示字元計數
   - 超過 60 字元時警告

2. **Meta Description** (選填)
   - 長度建議:150-160 字元
   - 即時顯示字元計數
   - 支援 AI 自動生成 (基於文章內容前 300 字)

3. **Open Graph 設定**
   - OG Title (預設使用 Meta Title)
   - OG Description (預設使用 Meta Description)
   - OG Image (選填,可上傳或從圖片庫選擇)
   - OG Type (預設:`article`)

4. **Twitter Card 設定**
   - Card Type (預設:`summary_large_image`)
   - Twitter Image (預設使用 OG Image)

5. **結構化數據 (Schema.org)**
   - 自動生成 Article Schema (JSON-LD)
   - 包含欄位:
     - `@type`: "Article"
     - `headline`: 文章標題
     - `author`: 作者資訊
     - `datePublished`: 發布時間
     - `dateModified`: 最後修改時間
     - `image`: 封面圖片
     - `publisher`: 網站資訊

6. **進階設定**
   - Canonical URL (避免重複內容)
   - Noindex / Nofollow (排除特定文章)
   - Hreflang (多語系版本連結)

---

### FR-SEO-003: AI 自動生成 Meta Description
**描述**: 使用 AI 分析文章內容,自動生成 Meta Description  
**優先級**: P1 (高)

#### 生成邏輯
1. 取得文章內容前 500 字
2. 使用 AI 摘要為 150-160 字元的描述
3. 確保包含主要關鍵字
4. 適合搜尋結果顯示

#### Prompt 範本
```
請根據以下文章內容,生成一段 150-160 字元的 Meta Description。
要求:
1. 簡潔描述文章主旨
2. 包含主要關鍵字
3. 吸引讀者點擊
4. 繁體中文
5. 不要使用引號

文章內容:
{{article_excerpt}}
```

#### 手動編輯
- 生成後可手動調整
- 支援一鍵重新生成
- 標記「已手動編輯」,避免被覆蓋

---

### FR-SEO-004: SEO 預覽
**描述**: 即時預覽文章在搜尋結果的顯示效果  
**優先級**: P2 (中)

#### 預覽項目
1. **Google 搜尋結果預覽**
   - 顯示 Meta Title (藍色連結)
   - 顯示 URL (綠色)
   - 顯示 Meta Description (灰色文字)
   - 模擬 SERP 樣式

2. **社交媒體預覽**
   - Facebook 卡片預覽 (OG Image + Title + Description)
   - Twitter 卡片預覽 (Twitter Image + Title + Description)

3. **JSON-LD 預覽**
   - 顯示生成的結構化數據 JSON
   - 支援複製至剪貼簿
   - 可使用 Google Rich Results Test 驗證

---

## 非功能需求

### NFR-IMAGE-001: 效能
- 圖片上傳時間 < 3 秒 (2MB 圖片)
- 壓縮與縮圖生成時間 < 2 秒
- AI Alt Text 生成時間 < 5 秒
- 圖片庫載入 100 張圖片 < 1 秒

### NFR-IMAGE-002: 儲存空間管理
- 定期清理未引用的圖片 (超過 90 天)
- 壓縮後圖片平均節省 40% 空間
- 提供儲存空間使用統計

### NFR-SEO-001: 標準合規
- Meta Title / Description 符合 Google 建議長度
- Open Graph 符合 Facebook 標準
- Schema.org JSON-LD 通過 Google 驗證
- Robots.txt 符合標準格式

---

## 資料模型

### Image
```typescript
interface Image {
  id: string;
  filename: string;
  originalFilename: string;
  path: string;
  url: string;
  size: number; // bytes
  width: number;
  height: number;
  mimeType: string;
  altText: string;
  altTextGenerated: boolean; // AI 生成或手動編輯
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  uploadedBy: string; // userId
  createdAt: Date;
}
```

### ImageReference
```typescript
interface ImageReference {
  id: string;
  imageId: string;
  articleId: string;
  createdAt: Date;
}
```

### SEOSettings
```typescript
interface SEOSettings {
  siteName: string;
  siteTagline: string;
  siteLogo: string;
  defaultOGImage: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  ga4MeasurementId: string;
  gscVerificationCode: string;
  gtmContainerId: string;
  robotsAllowIndex: boolean;
  robotsTxt: string;
  allowAICrawlers: boolean;
  sitemapEnabled: boolean;
  sitemapUpdateFrequency: 'daily' | 'weekly';
}
```

### ArticleSEO
```typescript
interface ArticleSEO {
  articleId: string;
  metaTitle: string;
  metaDescription: string;
  metaDescriptionGenerated: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterImage: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
  hreflangLinks: Array<{
    lang: string;
    url: string;
  }>;
  schemaJson: string; // JSON-LD
}
```

---

## API 端點

### 圖片管理 API

#### POST /api/admin/images/upload
上傳圖片

**Content-Type**: `multipart/form-data`

**Body**:
- `file`: 圖片檔案 (或多個)

**回應**:
```json
{
  "images": [
    {
      "id": "uuid",
      "url": "/uploads/images/2026/02/20260207_a3f8b2.jpg",
      "altText": "AI 生成的描述",
      "thumbnails": {
        "small": "/uploads/images/2026/02/20260207_a3f8b2_small.jpg",
        "medium": "/uploads/images/2026/02/20260207_a3f8b2_medium.jpg",
        "large": "/uploads/images/2026/02/20260207_a3f8b2_large.jpg"
      }
    }
  ]
}
```

#### GET /api/admin/images
取得圖片列表

**Query Params**:
- `page`, `limit`, `type`, `search`

#### GET /api/admin/images/:id
取得圖片詳細資訊

#### PUT /api/admin/images/:id
更新圖片資訊 (主要是編輯 Alt Text)

#### DELETE /api/admin/images/:id
刪除圖片

#### GET /api/admin/images/:id/references
取得圖片引用列表

---

### SEO 設定 API

#### GET /api/admin/seo/settings
取得全域 SEO 設定

#### PUT /api/admin/seo/settings
更新全域 SEO 設定

#### POST /api/admin/seo/generate-meta-description
AI 生成 Meta Description

**Body**:
```json
{
  "content": "文章內容前 500 字"
}
```

**回應**:
```json
{
  "metaDescription": "AI 生成的描述"
}
```

#### GET /api/admin/seo/preview/:articleId
取得 SEO 預覽資料

---

## 測試案例

### TC-IMAGE-001: 圖片上傳
1. 選擇一張 JPG 圖片上傳
2. **預期**: 顯示上傳進度
3. **預期**: 上傳成功,顯示預覽與 URL
4. **預期**: 圖片已壓縮且生成縮圖
5. **預期**: AI 自動生成 Alt Text

### TC-IMAGE-002: 批次上傳
1. 選擇 10 張圖片批次上傳
2. **預期**: 所有圖片成功上傳
3. **預期**: 每張圖片都有 Alt Text

### TC-IMAGE-003: 圖片引用追蹤
1. 在文章中插入圖片
2. 儲存文章
3. 開啟圖片庫,檢視該圖片
4. **預期**: 顯示「引用於 1 篇文章」
5. 嘗試刪除圖片
6. **預期**: 提示「圖片被引用,無法刪除」

### TC-SEO-001: 設定 GA4
1. 進入全域 SEO 設定
2. 輸入 GA4 Measurement ID
3. 儲存設定
4. **預期**: 前端頁面包含 GA4 追蹤碼

### TC-SEO-002: AI 生成 Meta Description
1. 編輯文章
2. 點擊「AI 生成 Meta Description」
3. **預期**: 顯示生成進度
4. **預期**: 生成 150-160 字元的描述
5. **預期**: 可手動編輯

### TC-SEO-003: SEO 預覽
1. 編輯文章並設定 Meta Title / Description
2. 開啟 SEO 預覽
3. **預期**: Google 搜尋結果預覽正確顯示
4. **預期**: Facebook / Twitter 卡片預覽正確顯示

---

## 驗收標準

- [ ] 圖片上傳功能正常,支援多種方式
- [ ] 圖片自動壓縮與生成縮圖
- [ ] AI Alt Text 生成成功率 > 95%
- [ ] 圖片庫正確顯示所有圖片
- [ ] 圖片引用追蹤正常運作
- [ ] 全域 SEO 設定可儲存並生效
- [ ] 文章 SEO 元數據可獨立編輯
- [ ] AI 生成 Meta Description 品質良好
- [ ] SEO 預覽正確呈現
- [ ] JSON-LD 通過 Google 驗證
- [ ] 所有 API 端點正確回應
- [ ] 所有測試案例通過
