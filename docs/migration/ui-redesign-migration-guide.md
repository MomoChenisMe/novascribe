# UI Redesign Migration Guide

**版本:** 1.0.0  
**日期:** 2026-02-11  
**Change:** redesign-frontend-ui

本文件說明如何使用重構後的 UI 元件庫與 Design System。

---

## 目錄

1. [UI 元件庫概述](#ui-元件庫概述)
2. [色彩 Token 使用](#色彩-token-使用)
3. [字體設定說明](#字體設定說明)
4. [UI 元件使用範例](#ui-元件使用範例)
5. [常見問題](#常見問題)

---

## UI 元件庫概述

### 元件位置

```
src/components/
├── ui/               # 通用 UI 元件 (無業務邏輯)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Tag.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── public/           # 前台業務元件
│   ├── ArticleCard.tsx
│   ├── HeroSection.tsx
│   ├── NewsletterForm.tsx
│   └── ...
└── admin/            # 後台業務元件
```

### 設計原則

- **無業務邏輯**: `ui/` 元件專注於視覺樣式，不包含業務邏輯
- **Headless Component 模式**: 元件接收 props，渲染純視覺元素
- **Server Component 優先**: 無狀態元件使用 Server Component，互動元件標記 `'use client'`

---

## 色彩 Token 使用

### Modern Rose 色彩系統

NovaScribe 採用 Modern Rose 色彩系統，基於 Tailwind CSS Rose 色票。

#### 主要色票

| Token | Tailwind Class | CSS Variable | 用途 |
|-------|----------------|--------------|------|
| Primary | `bg-primary` | `var(--color-primary)` | 主要按鈕、連結、強調元素 |
| Primary Hover | `bg-primary-hover` | `var(--color-primary-hover)` | Hover 狀態 |
| Primary Light | `bg-primary-light` | `var(--color-primary-light)` | 淺色背景 (Newsletter 區塊) |

#### 文字色票

| Token | CSS Variable | 用途 |
|-------|--------------|------|
| Text Primary | `var(--color-text-primary)` | 標題、主要文字 |
| Text Secondary | `var(--color-text-secondary)` | 次要文字、說明文字 |
| Text Muted | `var(--color-text-muted)` | 輔助文字 (日期、元資料) |

#### 背景色票

| Token | CSS Variable | 用途 |
|-------|--------------|------|
| BG Main | `var(--color-bg-main)` | 主背景 (白色/深色模式切換) |
| BG Card | `var(--color-bg-card)` | 卡片背景 |

#### 邊框色票

| Token | CSS Variable | 用途 |
|-------|--------------|------|
| Border Light | `var(--color-border-light)` | 輸入框邊框 |
| Primary Ring | `var(--color-primary-ring)` | Focus 狀態 ring 顏色 |

### 使用範例

#### Tailwind Class (推薦)

```tsx
// 主要按鈕
<button className="bg-primary hover:bg-primary-hover text-white">
  訂閱
</button>

// 卡片背景
<div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm">
  內容
</div>
```

#### CSS Variable (適用於複雜場景)

```tsx
// 自訂元件
<div style={{ backgroundColor: 'var(--color-primary-light)' }}>
  淺色背景
</div>
```

### 色彩定義位置

**檔案:** `tailwind.config.ts`

```typescript
colors: {
  primary: {
    DEFAULT: 'var(--color-primary)',
    hover: 'var(--color-primary-hover)',
    light: 'var(--color-primary-light)',
  },
}
```

**檔案:** `app/globals.css`

```css
:root {
  --color-primary: #E11D48;              /* Rose 600 */
  --color-primary-hover: #BE123C;        /* Rose 700 */
  --color-primary-light: #FFF1F2;        /* Rose 50 */
  /* ... 其他色票 */
}
```

---

## 字體設定說明

### 字體家族

NovaScribe 使用三種字體家族：

| 字體 | Tailwind Class | 用途 |
|------|----------------|------|
| Inter + Noto Sans TC | `font-sans` | 一般文字、UI 元件 |
| JetBrains Mono | `font-mono` | 程式碼區塊 |

### 字體載入

**檔案:** `app/layout.tsx`

```typescript
import { Inter, Noto_Sans_TC, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
})

const notoSansTC = Noto_Sans_TC({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-noto' 
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${notoSansTC.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

### 字體使用範例

```tsx
// 一般文字 (預設)
<p className="font-sans">這是一般文字</p>

// 程式碼區塊
<code className="font-mono">const x = 42;</code>

// 自訂字重
<h1 className="font-bold">粗體標題</h1>
<p className="font-normal">一般文字</p>
```

### 字體配置位置

**檔案:** `tailwind.config.ts`

```typescript
fontFamily: {
  sans: ['var(--font-inter)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

---

## UI 元件使用範例

### Button

**檔案:** `src/components/ui/Button.tsx`

#### Variants

| Variant | 說明 | 範例 |
|---------|------|------|
| `primary` | 主要按鈕 (Rose 600) | 提交表單、主要 CTA |
| `secondary` | 次要按鈕 (Stone 100) | 取消、返回 |
| `outline` | 輪廓按鈕 | 次要操作 |
| `icon` | 圖示按鈕 | 導航列圖示 |

#### 使用範例

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

// Icon Button
<Button variant="icon" ariaLabel="關閉">
  <CloseIcon />
</Button>

// Disabled Button
<Button variant="primary" disabled>
  載入中...
</Button>
```

### Card

**檔案:** `src/components/ui/Card.tsx`

#### Props

| Prop | Type | 預設值 | 說明 |
|------|------|--------|------|
| `hover` | boolean | `true` | 是否啟用 Hover 效果 |
| `className` | string | `''` | 額外 CSS class |

#### 使用範例

```tsx
import Card from '@/components/ui/Card'

// 基礎卡片
<Card>
  <h3>卡片標題</h3>
  <p>卡片內容</p>
</Card>

// 無 Hover 效果
<Card hover={false}>
  靜態卡片
</Card>

// 自訂樣式
<Card className="p-8 border-2">
  自訂樣式卡片
</Card>
```

### Tag

**檔案:** `src/components/ui/Tag.tsx`

#### 使用範例

```tsx
import Tag from '@/components/ui/Tag'

// 基礎標籤
<Tag>Next.js</Tag>

// 連結標籤
<Link href="/tags/nextjs">
  <Tag>Next.js</Tag>
</Link>

// 標籤列表
<div className="flex gap-2">
  {tags.map(tag => (
    <Tag key={tag.id}>{tag.name}</Tag>
  ))}
</div>
```

### Input / Textarea

**檔案:** `src/components/ui/Input.tsx`, `Textarea.tsx`

#### Props

| Prop | Type | 說明 |
|------|------|------|
| `label` | string | 輸入框標籤 |
| `error` | string | 錯誤訊息 |
| `helperText` | string | 輔助文字 |

#### 使用範例

```tsx
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

// 基礎輸入框
<Input 
  label="電子郵件"
  type="email"
  placeholder="your@email.com"
/>

// 錯誤狀態
<Input 
  label="電子郵件"
  type="email"
  error="請輸入有效的電子郵件地址"
/>

// Textarea
<Textarea 
  label="訊息"
  rows={4}
  placeholder="請輸入訊息..."
/>
```

---

## 常見問題

### Q1: 如何覆寫元件樣式?

**A:** 使用 `className` prop 傳入自訂 Tailwind class。元件內部使用 template literal 合併 class，後面的 class 會覆寫前面的。

```tsx
// 覆寫 padding
<Card className="p-8">
  自訂 padding
</Card>

// 覆寫背景色
<Button variant="primary" className="bg-blue-600">
  自訂顏色按鈕
</Button>
```

### Q2: 如何新增自訂元件?

**A:** 

1. 在 `src/components/ui/` 建立新元件檔案
2. 遵循現有元件的結構 (無業務邏輯)
3. 使用 Tailwind CSS 與色彩 Token
4. 支援 `className` prop 允許覆寫樣式

```tsx
// src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error'
  className?: string
}

export default function Badge({ children, variant = 'success', className = '' }: BadgeProps) {
  const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium'
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
```

### Q3: Dark Mode 何時支援?

**A:** 目前已預留 Dark Mode 擴充點 (CSS Variables)，但完整實作不在此 change 範圍。未來實作時僅需：

1. 更新 `app/globals.css` 新增 `[data-theme='dark']` 選擇器
2. 定義暗色模式色票
3. 新增主題切換邏輯

### Q4: 如何使用 Server Component vs Client Component?

**A:**

- **Server Component (預設):** 無互動、純展示的元件 (Card, Tag, ArticleCard)
- **Client Component (`'use client'`):** 需要狀態、事件處理、瀏覽器 API 的元件 (Button with onClick, Form, TOC)

```tsx
// Server Component (預設)
export default function ArticleCard({ post }) {
  return <Card>...</Card>
}

// Client Component
'use client'
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  // ... 互動邏輯
}
```

### Q5: 如何處理響應式設計?

**A:** 使用 Tailwind 的響應式前綴 (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)

```tsx
// 手機: 1 欄, 平板: 2 欄, 桌面: 3 欄
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(post => <ArticleCard key={post.id} post={post} />)}
</div>

// 手機: 上圖下文, 桌面: 左圖右文
<div className="flex flex-col lg:flex-row gap-6">
  <div className="w-full lg:w-1/2">圖片</div>
  <div className="w-full lg:w-1/2">文字</div>
</div>
```

### Q6: 如何調整圓角大小?

**A:** 使用 Tailwind 的圓角 class，預設使用 `rounded-2xl`

```tsx
// 預設圓角 (16px)
<Card>預設圓角</Card>

// 小圓角
<Card className="rounded-lg">小圓角</Card>

// 完全圓角
<Button className="rounded-full">圓形按鈕</Button>
```

### Q7: 如何確保可訪問性 (Accessibility)?

**A:** 所有元件均遵循 WCAG AA 標準：

- 使用語意化 HTML (`<button>`, `<nav>`, `<article>`)
- 提供 ARIA labels (`aria-label`, `aria-labelledby`)
- 確保鍵盤導航支援 (`tabIndex`, `onKeyDown`)
- 足夠的色彩對比度 (4.5:1 以上)

```tsx
// ✅ 良好的可訪問性
<button 
  aria-label="關閉對話框"
  onClick={handleClose}
>
  <CloseIcon />
</button>

// ❌ 不佳的可訪問性
<div onClick={handleClose}>
  <CloseIcon />
</div>
```

---

## 更多資源

- **Design System 文件:** `openspec/changes/redesign-frontend-ui/design.md`
- **Tailwind CSS 文件:** https://tailwindcss.com/docs
- **Next.js Font Optimization:** https://nextjs.org/docs/app/api-reference/components/font
- **WCAG AA 標準:** https://www.w3.org/WAI/WCAG2AA-Conformance

---

**版本歷史:**

- 1.0.0 (2026-02-11): 初始版本
