## 1. 修正 categories/[slug]/page.tsx

- [ ] 1.1 移除 `CategoryPostsPageProps` interface 定義
- [ ] 1.2 引入 `PageProps` 型別：`import type { PageProps } from 'next'`
- [ ] 1.3 修改 `generateMetadata` 函式簽章使用 `PageProps<'/categories/[slug]'>`
- [ ] 1.4 在 `generateMetadata` 函式頂部添加 `const { slug } = await params`
- [ ] 1.5 修改 Page 元件函式簽章使用 `PageProps<'/categories/[slug]'>`
- [ ] 1.6 在 Page 元件函式頂部添加 `const { slug } = await params` 和 `const { page } = await searchParams`
- [ ] 1.7 更新所有使用 `params.slug` 的地方改為使用解構後的 `slug`
- [ ] 1.8 更新所有使用 `searchParams.page` 的地方改為使用解構後的 `page`
- [ ] 1.9 執行 TypeScript 編譯檢查無錯誤

## 2. 修正 tags/[slug]/page.tsx

- [ ] 2.1 移除 `TagPostsPageProps` interface 定義
- [ ] 2.2 引入 `PageProps` 型別：`import type { PageProps } from 'next'`
- [ ] 2.3 修改 `generateMetadata` 函式簽章使用 `PageProps<'/tags/[slug]'>`
- [ ] 2.4 在 `generateMetadata` 函式頂部添加 `const { slug } = await params`
- [ ] 2.5 修改 Page 元件函式簽章使用 `PageProps<'/tags/[slug]'>`
- [ ] 2.6 在 Page 元件函式頂部添加 `const { slug } = await params` 和 `const { page } = await searchParams`
- [ ] 2.7 更新所有使用 `params.slug` 的地方改為使用解構後的 `slug`
- [ ] 2.8 更新所有使用 `searchParams.page` 的地方改為使用解構後的 `page`
- [ ] 2.9 執行 TypeScript 編譯檢查無錯誤

## 3. 修正 posts/[slug]/page.tsx

- [ ] 3.1 移除 `PostPageProps` interface 定義
- [ ] 3.2 引入 `PageProps` 型別：`import type { PageProps } from 'next'`
- [ ] 3.3 修改 `generateMetadata` 函式簽章使用 `PageProps<'/posts/[slug]'>`
- [ ] 3.4 在 `generateMetadata` 函式頂部添加 `const { slug } = await params`
- [ ] 3.5 修改 Page 元件函式簽章使用 `PageProps<'/posts/[slug]'>`
- [ ] 3.6 在 Page 元件函式頂部添加 `const { slug } = await params`
- [ ] 3.7 更新所有使用 `params.slug` 的地方改為使用解構後的 `slug`
- [ ] 3.8 執行 TypeScript 編譯檢查無錯誤

## 4. 執行時穩定性驗證

- [ ] 4.1 啟動開發伺服器 `npm run dev`
- [ ] 4.2 確認開發伺服器啟動無錯誤訊息
- [ ] 4.3 訪問 `/categories/tech`，確認回傳 HTTP 200 status
- [ ] 4.4 確認 `/categories/tech` 頁面正確顯示技術分類文章列表
- [ ] 4.5 確認終端機無 "params should be awaited" 錯誤
- [ ] 4.6 訪問 `/tags/javascript`，確認回傳 HTTP 200 status
- [ ] 4.7 確認 `/tags/javascript` 頁面正確顯示 JavaScript 標籤文章列表
- [ ] 4.8 確認終端機無 "params should be awaited" 錯誤
- [ ] 4.9 訪問 `/posts/getting-started-with-nextjs`，確認回傳 HTTP 200 status
- [ ] 4.10 確認文章詳情頁正確顯示文章內容
- [ ] 4.11 確認終端機無 "params should be awaited" 錯誤
- [ ] 4.12 檢查瀏覽器控制台無執行時錯誤

## 5. SEO 行為一致性驗證

- [ ] 5.1 訪問 `/categories/tech`，檢視頁面原始碼（View Source）
- [ ] 5.2 確認 `<title>` 標籤內容正確（NovaScribe — 技術）
- [ ] 5.3 確認 `<meta name="description">` 標籤存在且內容合理
- [ ] 5.4 確認 `<link rel="canonical">` 標籤指向正確 URL
- [ ] 5.5 確認 Open Graph meta tags 存在（`og:title`, `og:description`, `og:url`）
- [ ] 5.6 訪問 `/tags/javascript`，檢視頁面原始碼
- [ ] 5.7 確認 `<title>` 標籤內容正確（NovaScribe — JavaScript）
- [ ] 5.8 確認 meta tags 和 Open Graph tags 存在
- [ ] 5.9 訪問 `/posts/getting-started-with-nextjs`，檢視頁面原始碼
- [ ] 5.10 確認 `<title>` 標籤內容正確（文章標題）
- [ ] 5.11 確認 JSON-LD 結構化資料存在（Article 類型）
- [ ] 5.12 確認 BreadcrumbList JSON-LD 存在

## 6. 建置驗證

- [ ] 6.1 執行 `npm run build`，確認建置流程啟動
- [ ] 6.2 確認 TypeScript 編譯通過，無型別錯誤
- [ ] 6.3 確認建置過程無警告訊息
- [ ] 6.4 確認所有動態路由頁面成功建置（檢查建置輸出）
- [ ] 6.5 確認建置完成訊息顯示（"Compiled successfully"）

## 7. 完整性檢查

- [ ] 7.1 確認所有前台動態路由頁面正常運作（200 status）
- [ ] 7.2 測試分頁功能（訪問 `/categories/tech?page=2`，確認正常）
- [ ] 7.3 測試不存在的路由（訪問 `/categories/non-existent`，確認回傳 404）
- [ ] 7.4 測試不存在的標籤（訪問 `/tags/non-existent`，確認回傳 404）
- [ ] 7.5 測試不存在的文章（訪問 `/posts/non-existent`，確認回傳 404）
