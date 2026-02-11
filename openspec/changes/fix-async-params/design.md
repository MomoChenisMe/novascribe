## Context

Next.js 16 將動態路由的 `params` 和 `searchParams` props 從同步物件改為 Promise（breaking change）。這是 Next.js 框架層級的 API 變更，目的是為了支援更好的靜態渲染最佳化和 Suspense 整合。

當前專案有 3 個前台動態路由頁面使用舊的同步存取方式，導致執行時拋出錯誤：
```
Error: Route "/categories/[slug]" used `params.slug`. 
`params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties.
```

影響檔案：
- `src/app/(public)/categories/[slug]/page.tsx`
- `src/app/(public)/tags/[slug]/page.tsx`
- `src/app/(public)/posts/[slug]/page.tsx`

後台動態路由頁面使用 Client Components + `useParams()` hook，不受此變更影響。

## Goals / Non-Goals

**Goals:**
- 修正所有前台動態路由頁面，使用 async/await 存取 params 和 searchParams
- 改用 Next.js 官方推薦的 `PageProps<路徑>` 工具型別，提升型別安全
- 確保 generateMetadata 和 Page 元件都正確處理 async params
- 保持程式碼風格一致性
- 確保執行時零錯誤（消除 "params should be awaited" 錯誤）
- 確保 SEO 行為不變（generateMetadata 邏輯一致）
- 通過建置驗證（`npm run build` 成功）

**Non-Goals:**
- 不修改後台頁面（已使用 Client Components + useParams()，無需變更）
- 不降級 Next.js 版本（應該跟隨框架最佳實踐）
- 不新增功能或改變現有行為（純修正 API 使用方式）
- 不處理 Prisma Query Engine panic 問題（已在另一個 change 追蹤）

## Decisions

### Decision 1: 使用 await params 而非 React.use()

**選擇：** 在 async Server Components 中使用 `await params`

**理由：**
- Next.js 官方文件優先推薦此方式用於 Server Components
- 程式碼更簡潔直觀（`const { slug } = await params`）
- 避免引入 React.use() 的額外複雜度
- 所有現有頁面都是 async Server Components，適合此模式

**替代方案（已拒絕）：**
- React.use(params)：適用於 Client Components，但我們的動態路由頁面都是 Server Components

### Decision 2: 使用 PageProps 工具型別

**選擇：** 移除自訂 interface，改用 `PageProps<'/path/[param]'>`

**理由：**
- Next.js 16 新增的官方工具型別，自動推斷路由參數結構
- 提供路徑字串的型別檢查（錯誤路徑會在編譯時報錯）
- IDE 自動補全支援更好
- 減少手動維護型別定義的負擔
- 符合框架最佳實踐

**替代方案（已拒絕）：**
- 保留自訂 interface 並修改為 `Promise<{ slug: string }>`：可行但失去 PageProps 的型別安全優勢

### Decision 3: 在函式頂部 await params

**選擇：** 在 generateMetadata 和 Page 元件函式的頂部立即 await params

```typescript
export async function generateMetadata({ params }: PageProps<'/categories/[slug]'>) {
  const { slug } = await params  // 函式頂部
  const category = await getCategoryBySlug(slug)
  // ...
}
```

**理由：**
- 符合 Next.js 官方建議（延遲 unwrap 直到真正需要使用）
- 但為了程式碼可讀性，在函式頂部統一解構
- 避免在多處重複 await params.slug

**替代方案（已拒絕）：**
- 每次使用都 await：`await params.slug`（重複且不易閱讀）

### Decision 4: searchParams 也需 await

**選擇：** searchParams 同樣使用 await 解構

**理由：**
- Next.js 15+ 已將 searchParams 改為 Promise
- 保持一致性（params 和 searchParams 使用相同模式）

```typescript
export default async function Page({ params, searchParams }: PageProps<'/categories/[slug]'>) {
  const { slug } = await params
  const { page } = await searchParams
  // ...
}
```

### Decision 5: 不使用 Next.js codemod

**選擇：** 手動修正而非使用 `@next/codemod next-async-request-api`

**理由：**
- 只有 3 個檔案需要修正，手動修正可控性更高
- 可以順便升級為 PageProps 型別（codemod 不會做這個）
- 避免 codemod 可能的誤判或遺漏
- 更容易 code review

### Decision 6: 補強穩定性和 SEO 驗證要求

**選擇：** 在 specs 中明確定義執行時穩定性、SEO 一致性、建置驗證要求

**理由：**
- 確保修正不僅語法正確，更要求執行時零錯誤
- 防止 SEO 回歸（generateMetadata 邏輯必須一致）
- 建置驗證確保問題在開發階段發現，而非生產環境

## Risks / Trade-offs

### Risk 1: 忘記 await params 導致執行時錯誤

**風險：** 開發者在未來新增動態路由時忘記 await params

**緩解：**
- TypeScript 會在編譯時警告（params 型別是 Promise）
- Next.js dev mode 會在執行時立即報錯（fail fast）
- 在 code review 中檢查動態路由的 params 使用方式
- 可考慮建立 ESLint rule 強制檢查（未來改善項目）

### Risk 2: PageProps 路徑字串維護負擔

**風險：** 檔案路徑改變時需要手動更新 PageProps 的路徑字串

**緩解：**
- TypeScript 會在路徑不符時報錯（型別安全）
- 路徑字串錯誤在編譯時就會被發現
- 動態路由的檔案路徑很少改變

### Trade-off: 增加一行程式碼

**取捨：** 每個函式需要額外一行 `const { slug } = await params`

**理由：** 這是 Next.js 16 的強制要求，不是可選的。雖然增加一行，但換來型別安全和框架相容性。

### Risk 3: SEO 行為意外改變

**風險：** 修正 params 使用方式時，意外改變 generateMetadata 的邏輯

**緩解：**
- 在 specs 中明確要求 SEO 行為一致性
- 修正時只改 params 存取方式，不改業務邏輯
- 驗證時檢查 meta tags 輸出與修正前相同

## Migration Plan

### 步驟 1：修正 categories/[slug]/page.tsx
1. 移除 `CategoryPostsPageProps` interface
2. 在 generateMetadata 和 Page 元件使用 `PageProps<'/categories/[slug]'>`
3. 函式頂部添加 `const { slug } = await params` 和 `const { page } = await searchParams`
4. 更新所有使用 `params.slug` 和 `searchParams.page` 的地方

### 步驟 2：修正 tags/[slug]/page.tsx
（同步驟 1，路徑改為 `'/tags/[slug]'`）

### 步驟 3：修正 posts/[slug]/page.tsx
（同步驟 1，路徑改為 `'/posts/[slug]'`，且無 searchParams）

### 步驟 4：驗證執行時穩定性
1. 啟動開發伺服器 `npm run dev`
2. 訪問 `/categories/tech`（應回傳 200，無錯誤）
3. 訪問 `/tags/javascript`（應回傳 200，無錯誤）
4. 訪問 `/posts/getting-started-with-nextjs`（應回傳 200，無錯誤）
5. 確認終端機無 "params should be awaited" 錯誤

### 步驟 5：驗證 SEO 一致性
1. 檢查 `/categories/tech` 的 View Source，確認 meta tags 與修正前一致
2. 檢查 `/tags/javascript` 的 View Source，確認 meta tags 與修正前一致
3. 檢查 `/posts/[slug]` 的 View Source，確認 meta tags 和 JSON-LD 與修正前一致

### 步驟 6：建置驗證
1. 執行 `npm run build`，確認建置成功
2. 確認 TypeScript 編譯無錯誤
3. 確認建置輸出無警告訊息
4. 確認所有動態路由頁面都成功建置

### Rollback 策略

若修正後出現未預期的問題：
1. 停止開發伺服器
2. Git revert 此次修改
3. 重新檢查 Next.js 官方文件的最新指引

（實際上 rollback 機率極低，此為 Next.js 框架強制要求的變更）

## Open Questions

無。此修正方式已由 Next.js 官方文件明確定義，無模糊空間。

## SEO 影響評估

**修正前：** 所有動態路由回傳 500 錯誤，搜尋引擎無法索引這些頁面（嚴重 SEO 損害）

**修正後：** 頁面正常回傳 200，SEO 功能完全恢復，包括：
- generateMetadata 正常輸出動態 meta tags
- JSON-LD 結構化資料正常嵌入
- Canonical URL 正確生成
- Open Graph 和 Twitter Card tags 正常

此修正對 SEO 是正面且必要的。修正過程中必須確保 generateMetadata 的邏輯不變，僅改變 params 存取方式。

## 資料庫 Schema 設計

不涉及資料庫變更。

## API 端點設計

不涉及 API 變更。此修正僅影響前台頁面渲染邏輯。
