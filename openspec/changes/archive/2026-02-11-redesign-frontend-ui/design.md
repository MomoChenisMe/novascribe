## Context

NovaScribe 目前使用 Next.js 16 + Tailwind CSS，前台頁面已實作基礎功能（首頁、分類、標籤、文章詳情），但視覺設計缺乏統一規範，元件樣式分散且不一致。此次重新設計的目標是建立完整的 Design System，並基於「Modern Rose」主題進行全面視覺升級。

**當前狀態：**
- 使用預設 Tailwind 配置，未定義自訂色票
- 字體使用系統預設，無特定品牌字體
- UI 元件樣式分散在各頁面中，缺乏統一的元件庫
- 首頁採用簡單的列表佈局，無 Hero 區塊
- 文章頁無目錄 (TOC) 與浮動操作按鈕
- 後台與前台風格不一致

**技術約束：**
- 必須相容 Next.js 16 App Router（Server Components + Client Components）
- 必須支援 Dark Mode（未來擴充）
- 必須保持現有的 SEO 優化（meta tags, JSON-LD）
- 需考慮 Lighthouse Performance Score（目標：90+）

## Goals / Non-Goals

**Goals:**
1. 建立完整的 Design Token 系統（tailwind.config.ts）
2. 實作可重用的 UI 元件庫（src/components/ui/）
3. 重構前台所有頁面，套用新設計風格
4. 優化閱讀體驗（字體階層、行高、內容寬度）
5. 統一後台風格（延續前台的 Modern Rose 主題）
6. 確保所有頁面的可訪問性（WCAG AA 標準）

**Non-Goals:**
1. **不**重構後端 API 或資料庫 Schema
2. **不**新增或修改任何業務邏輯（僅視覺層面）
3. **不**實作 Dark Mode（保留擴充點，但不在此 change 實作）
4. **不**修改現有的 SEO 策略（保持現有的 generateMetadata 邏輯）

## Decisions

### 決策 1：Design Token 管理策略

**選擇：** 使用 Tailwind CSS 的 `theme.extend` 擴充預設色票，定義語意化 Token。

**理由：**
- Tailwind 原生支援，無需引入額外的 CSS-in-JS 函式庫
- 可直接在 JSX 中使用 `bg-primary`, `text-primary` 等語意化 class
- 便於未來支援 Dark Mode（透過 CSS Variables 切換）

**替代方案考量：**
- **CSS Variables only**：需手動管理所有色票，且失去 Tailwind 的 Intellisense 支援
- **Styled Components**：引入額外 runtime，不符合 Next.js Server Components 最佳實踐

**實作方式：**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E11D48', // Rose 600
          hover: '#BE123C',   // Rose 700
          light: '#FFF1F2',   // Rose 50
        },
        // ... 其他色票
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

### 決策 2：UI 元件庫架構

**選擇：** 建立 `src/components/ui/` 目錄，採用 Headless Component 模式。

**理由：**
- 元件專注於視覺樣式，不包含業務邏輯
- 便於跨頁面重用（前台 + 後台）
- 支援 Server Components（無狀態元件）與 Client Components（互動元件）分離

**元件清單：**
- `Button.tsx` (Primary, Secondary, Outline, Icon variants)
- `Card.tsx` (基礎卡片，支援 hover 效果)
- `Tag.tsx` (標籤，支援不同顏色)
- `Input.tsx`, `Textarea.tsx` (表單元件)
- `Navbar.tsx`, `Footer.tsx` (佈局元件)

**資料夾結構：**
```
src/components/
├── ui/               # 通用 UI 元件（無業務邏輯）
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Tag.tsx
├── public/           # 前台業務元件
│   ├── ArticleCard.tsx
│   ├── HeroSection.tsx
│   └── TOC.tsx
└── admin/            # 後台業務元件
    └── ...
```

### 決策 3：首頁佈局實作方式

**選擇：** 使用 CSS Grid 實作雜誌網格佈局，Hero 區塊採用 Flexbox。

**理由：**
- CSS Grid 天生適合卡片網格佈局，支援響應式設計
- 無需引入第三方 Masonry 函式庫
- 效能優於 JavaScript 動態計算

**佈局結構：**
```tsx
<div className="container mx-auto px-4">
  {/* Hero Section */}
  <section className="mb-12">
    <HeroArticle article={latestPost} />
  </section>

  {/* Magazine Grid */}
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {posts.map(post => <ArticleCard key={post.id} post={post} />)}
  </section>

  {/* Newsletter */}
  <section className="mt-16">
    <NewsletterForm />
  </section>
</div>
```

### 決策 4：文章頁 TOC 實作方式

**選擇：** Server-side 解析 Markdown headings，生成目錄結構；Client-side 監聽 scroll 事件高亮當前章節。

**理由：**
- Markdown 在 Server Component 中解析（remark/rehype），無需客戶端運算
- 僅目錄高亮需要 Client Component（use client）
- 減少 JavaScript bundle size

**實作流程：**
1. Server Component：解析 `post.content` 提取 h2/h3 標籤與 id
2. 傳遞 TOC 資料結構給 Client Component
3. Client Component：監聽 `IntersectionObserver` 更新高亮狀態

### 決策 5：字體載入策略

**選擇：** 使用 `next/font/google` 自動優化 Google Fonts 載入。

**理由：**
- Next.js 內建支援，自動產生 font-face CSS
- 自動子集化（subset）與壓縮，減少載入時間
- 支援 `display: swap` 避免 FOIT (Flash of Invisible Text)

**實作方式：**
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_TC, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansTC = Noto_Sans_TC({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-noto' })

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

## Risks / Trade-offs

### 風險 1：重構範圍過大導致回歸 Bug

**影響：** 修改所有前台頁面，可能影響現有功能（表單提交、分頁、搜尋）

**緩解措施：**
- 分階段實作（Phase 1: 基礎建設 → Phase 2: 首頁 → Phase 3: 文章頁 → Phase 4: 其他頁面）
- 每個 Phase 完成後執行完整的 E2E 測試
- 保留舊版元件作為 fallback，使用 feature flag 控制切換

### 風險 2：字體載入影響 Performance Score

**影響：** Google Fonts 可能增加 FCP (First Contentful Paint) 時間

**緩解措施：**
- 使用 `next/font/google` 自動優化
- 僅載入必要的字重（400, 500, 600, 700）
- 設定 `font-display: swap` 避免阻塞渲染
- 監控 Lighthouse Performance Score，目標維持 90+

### 風險 3：元件庫與既有程式碼衝突

**影響：** 新元件庫的 API 可能與現有元件不相容

**緩解措施：**
- 新元件庫使用獨立命名空間（`src/components/ui/`）
- 不刪除舊元件，逐步遷移
- 提供 Migration Guide 文件

### Trade-off：短期開發時間 vs. 長期可維護性

**選擇：** 投入時間建立完整的 Design System，而非快速套用樣式。

**理由：**
- 長期來看，統一的元件庫可減少未來開發與維護成本
- 便於未來支援 Dark Mode 與 Accessibility 改進
- 提升程式碼可讀性與團隊協作效率

## 測試策略

### 視覺回歸測試
- 使用 Playwright 截圖比對關鍵頁面（首頁、文章頁、後台）
- 驗證不同視窗寬度下的響應式佈局

### Accessibility 測試
- 使用 `jest-axe` 驗證每個元件的 WCAG 合規性
- 手動測試鍵盤導航與 Screen Reader 相容性

### Performance 測試
- 每個 Phase 完成後執行 Lighthouse CI
- 監控 FCP, LCP, CLS 指標，確保不低於重構前

## Migration Plan

### Phase 1: 基礎建設 (1-2 天)
1. 更新 `tailwind.config.ts`（色票、字體、圓角）
2. 建立 `src/components/ui/` 元件庫
3. 撰寫元件單元測試

### Phase 2: 首頁重構 (2-3 天)
1. 實作 Hero Section
2. 實作 Magazine Grid 佈局
3. 更新 Newsletter 區塊樣式
4. E2E 測試驗證

### Phase 3: 文章頁優化 (2-3 天)
1. 實作 TOC (Table of Contents)
2. 實作浮動操作按鈕
3. 優化 Markdown 排版樣式
4. E2E 測試驗證

### Phase 4: 其他頁面 & 後台 (3-4 天)
1. 更新分類/標籤頁
2. 更新關於頁
3. 更新後台 UI
4. 完整回歸測試

**Rollback 策略：**
- 每個 Phase 使用獨立 Git Branch
- 若 Performance Score 下降超過 5 分，暫停並分析原因
- 保留 feature flag 可快速切回舊版 UI

## Open Questions

1. **Dark Mode 支援時程？** → 不在此 change 範圍，但需預留擴充點（CSS Variables）
2. **Newsletter 功能是否需要整合第三方服務？** → 暫時僅實作 UI，後續再整合 API
3. **是否需要支援多語系切換？** → 不在此 change 範圍
