# NovaScribe

現代化部落格系統，採用 Next.js 16、Prisma 7 與 PostgreSQL 18 建立。

---

## 目錄

- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [Design System](#design-system)
  - [色彩系統 (Modern Rose)](#色彩系統-modern-rose)
  - [字體系統](#字體系統)
  - [UI 元件庫](#ui-元件庫)
- [快速開始](#快速開始)
- [專案結構](#專案結構)
- [開發指南](#開發指南)
- [授權](#授權)

---

## 功能特色

- ✅ **現代化技術棧**: Next.js 16 App Router + TypeScript + Tailwind CSS
- ✅ **完整的 CMS**: 文章、分類、標籤、評論管理
- ✅ **評論系統**: 支援嵌套回覆、反垃圾郵件、Markdown
- ✅ **SEO 優化**: 完整的 meta tags、sitemap、RSS/Atom feeds
- ✅ **響應式設計**: 適配各種螢幕尺寸
- ✅ **統一 Design System**: 基於 Modern Rose 色彩系統

---

## 技術棧

### 前端

- **框架**: Next.js 16.1 (App Router)
- **語言**: TypeScript 5
- **樣式**: Tailwind CSS 4
- **UI 元件**: 自訂元件庫 (Headless Component 模式)

### 後端

- **Runtime**: Node.js 24
- **ORM**: Prisma 7
- **資料庫**: PostgreSQL 18
- **驗證**: NextAuth.js (Credentials Provider)

### 開發工具

- **測試**: Jest + React Testing Library + Playwright
- **代碼品質**: ESLint + Prettier
- **CI/CD**: GitHub Actions (待設定)

---

## Design System

NovaScribe 採用統一的 Design System，確保 UI 一致性與可維護性。

### 色彩系統 (Modern Rose)

基於 Tailwind CSS Rose 色票，提供溫暖且專業的視覺風格。

#### 主要色票

| 色票 | Hex Code | 用途 |
|------|----------|------|
| **Primary** | `#E11D48` (Rose 600) | 主要按鈕、連結、強調元素 |
| **Primary Hover** | `#BE123C` (Rose 700) | Hover 狀態 |
| **Primary Light** | `#FFF1F2` (Rose 50) | 淺色背景 (Newsletter 區塊) |

#### 文字色票

| 色票 | Hex Code | 用途 |
|------|----------|------|
| **Text Primary** | `#0F172A` (Slate 900) | 標題、主要文字 |
| **Text Secondary** | `#475569` (Slate 600) | 次要文字、說明文字 |
| **Text Muted** | `#94A3B8` (Slate 400) | 輔助文字 (日期、元資料) |

#### 背景色票

| 色票 | Hex Code | 用途 |
|------|----------|------|
| **BG Main** | `#FFFFFF` | 主背景 (白色/深色模式切換) |
| **BG Card** | `#FFFFFF` | 卡片背景 |

#### 使用範例

```tsx
// Tailwind Class (推薦)
<button className="bg-primary hover:bg-primary-hover text-white">
  訂閱
</button>

// CSS Variable
<div style={{ backgroundColor: 'var(--color-primary-light)' }}>
  淺色背景
</div>
```

**完整色票定義:** `tailwind.config.ts` + `app/globals.css`

---

### 字體系統

NovaScribe 使用 Google Fonts，透過 `next/font/google` 自動優化載入。

#### 字體家族

| 字體 | 用途 | 字重 |
|------|------|------|
| **Inter** | 英文、數字 | 400, 500, 600, 700 |
| **Noto Sans TC** | 繁體中文 | 400, 500, 600, 700 |
| **JetBrains Mono** | 程式碼區塊 | 400, 700 |

#### 使用範例

```tsx
// 一般文字 (預設 font-sans)
<p className="font-sans">這是一般文字</p>

// 程式碼區塊
<code className="font-mono">const x = 42;</code>

// 自訂字重
<h1 className="font-bold">粗體標題</h1>
```

**字體配置位置:** `app/layout.tsx` + `tailwind.config.ts`

---

### UI 元件庫

NovaScribe 提供一套可重用的 UI 元件，位於 `src/components/ui/`。

#### 元件列表

| 元件 | 檔案 | 用途 |
|------|------|------|
| **Button** | `Button.tsx` | 按鈕 (Primary, Secondary, Outline, Icon) |
| **Card** | `Card.tsx` | 卡片容器 (含 Hover 效果) |
| **Tag** | `Tag.tsx` | 標籤元件 |
| **Input** | `Input.tsx` | 輸入框 |
| **Textarea** | `Textarea.tsx` | 多行輸入框 |
| **Navbar** | `Navbar.tsx` | 導航列 (Sticky) |
| **Footer** | `Footer.tsx` | 頁尾 |

#### Button 範例

```tsx
import Button from '@/components/ui/Button'

// Primary Button
<Button variant="primary" onClick={handleSubmit}>
  提交
</Button>

// Secondary Button
<Button variant="secondary" onClick={handleCancel}>
  取消
</Button>

// Outline Button
<Button variant="outline" size="small">
  查看更多
</Button>
```

#### Card 範例

```tsx
import Card from '@/components/ui/Card'

<Card>
  <h3>卡片標題</h3>
  <p>卡片內容</p>
</Card>

// 無 Hover 效果
<Card hover={false}>
  靜態卡片
</Card>
```

**完整使用說明:** `docs/migration/ui-redesign-migration-guide.md`

---

## 快速開始

### 環境需求

- Node.js 24+
- PostgreSQL 18+
- pnpm (推薦) 或 npm

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/your-username/novascribe.git
cd novascribe

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 填入資料庫連線資訊

# 4. 初始化資料庫
pnpm prisma migrate dev
pnpm prisma db seed

# 5. 啟動開發伺服器
pnpm dev
```

開啟瀏覽器訪問 `http://localhost:3000`

### 預設帳號

- **帳號**: `admin@novascribe.dev`
- **密碼**: `admin123`

---

## 專案結構

```
novascribe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # 前台頁面
│   │   ├── (admin)/            # 後台頁面
│   │   ├── api/                # API Routes
│   │   └── layout.tsx          # Root Layout
│   ├── components/
│   │   ├── ui/                 # 通用 UI 元件
│   │   ├── public/             # 前台業務元件
│   │   └── admin/              # 後台業務元件
│   ├── lib/
│   │   ├── services/           # 業務邏輯層
│   │   ├── utils/              # 工具函式
│   │   └── prisma.ts           # Prisma Client
│   └── types/                  # TypeScript 類型定義
├── prisma/
│   ├── schema.prisma           # Prisma Schema
│   └── seed.ts                 # 種子資料
├── public/                     # 靜態資源
├── docs/                       # 專案文件
│   ├── migration/              # Migration Guide
│   ├── plans/                  # 設計規劃文件
│   └── reports/                # 測試/驗證報告
└── openspec/                   # OpenSpec 變更管理
```

---

## 開發指南

### 開發指令

```bash
# 啟動開發伺服器
pnpm dev

# 執行測試
pnpm test                # 單元測試 (Jest)
pnpm test:e2e            # E2E 測試 (Playwright)

# 代碼檢查
pnpm lint                # ESLint
pnpm format              # Prettier

# 資料庫操作
pnpm prisma studio       # 開啟 Prisma Studio
pnpm prisma migrate dev  # 執行 Migration
pnpm prisma db seed      # 載入種子資料

# 建置正式版本
pnpm build
pnpm start
```

### 開發規範

1. **遵循 TDD 流程**: 先寫測試，再寫實作
2. **使用 Conventional Commits**: 提交訊息必須符合格式
3. **代碼風格**: ESLint + Prettier 自動格式化
4. **元件開發**: 優先使用 Server Component，互動元件才用 Client Component
5. **樣式管理**: 使用 Tailwind CSS + Design Token，避免 inline styles

### 新增元件

```bash
# 1. 建立元件檔案
touch src/components/ui/Badge.tsx

# 2. 撰寫元件 (遵循現有元件結構)
# 3. 撰寫測試
touch src/components/ui/__tests__/Badge.test.tsx

# 4. 更新文件
# docs/migration/ui-redesign-migration-guide.md
```

### 提交變更

```bash
# 使用 Conventional Commits 格式 (繁體中文)
git commit -m "feat: 新增 Badge 元件"
git commit -m "fix: 修復按鈕 Hover 效果"
git commit -m "docs: 更新 Migration Guide"
```

---

## 授權

MIT License

---

## 相關文件

- [Migration Guide](docs/migration/ui-redesign-migration-guide.md) - UI 元件庫使用指南
- [Design Spec](docs/plans/2026-02-11-frontend-design-spec.md) - 前台設計規範
- [SEO Verification Report](docs/reports/seo-verification.md) - SEO 驗證報告
- [OpenSpec Changes](openspec/changes/) - 變更管理紀錄

---

**版本:** 1.0.0  
**最後更新:** 2026-02-11
