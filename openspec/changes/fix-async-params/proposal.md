## Why

Next.js 16 將動態路由的 `params` 和 `searchParams` props 改為 Promise（breaking change），導致所有前台動態路由頁面（`/categories/[slug]`, `/tags/[slug]`, `/posts/[slug]`）拋出錯誤並回傳 500 status。使用者無法訪問分類文章列表、標籤文章列表、文章詳情頁，嚴重影響前台核心功能。必須立即修正以恢復正常運作。

## What Changes

- 修改 3 個前台動態路由頁面，將 `params` 和 `searchParams` 從同步存取改為 async/await
- 移除自訂 interface，改用 Next.js 提供的 `PageProps<路徑>` 工具型別，獲得路由參數型別安全
- 在 `generateMetadata` 和 Page 元件函式頂部 await params 和 searchParams
- 更新所有使用 `params.slug` 和 `searchParams.page` 的地方為先 await 再解構

## Capabilities

### New Capabilities
<!-- 無新功能，純修正 -->

### Modified Capabilities
- `dynamic-routes`: 修正動態路由 params 存取方式，從同步改為 async/await，符合 Next.js 16 API 規範

## Impact

**影響檔案（3 個）：**
- `src/app/(public)/categories/[slug]/page.tsx`
- `src/app/(public)/tags/[slug]/page.tsx`
- `src/app/(public)/posts/[slug]/page.tsx`

**影響範圍：**
- 前台所有動態路由頁面
- `generateMetadata` 函式（SEO meta tags 生成）
- Page 元件（頁面渲染）

**SEO 影響：**
- 修正前：動態路由回傳 500，搜尋引擎無法索引
- 修正後：正常回傳 200，SEO 功能完全恢復

**使用者影響：**
- 目標使用者：所有前台訪客
- 使用情境：瀏覽分類文章列表、標籤文章列表、閱讀文章詳情
- 修正前：無法訪問任何動態路由頁面（500 錯誤）
- 修正後：所有頁面恢復正常

**依賴影響：**
- 無新依賴
- 無 API 變更
- 不影響後台功能（後台使用 Client Components + `useParams()`，無需修正）
