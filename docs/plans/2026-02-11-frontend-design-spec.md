# NovaScribe 前台設計規範 (Frontend Design Spec)

**Date:** 2026-02-11
**Version:** 1.0
**Status:** Approved
**Theme:** Minimalist Modern + Modern Rose

---

## 1. 核心設計理念 (Design Philosophy)

- **極簡現代 (Minimalist Modern)**：專注內容，大量留白，減少非必要裝飾。
- **雜誌質感 (Magazine Quality)**：利用網格佈局和高品質排版，呈現大氣的視覺效果。
- **親切專業 (Friendly Professional)**：透過圓角和微互動，在專業技術感中保留「人」的溫度。

## 2. 色彩系統 (Color System)

基於 Tailwind CSS 預設色票進行擴充與定義。

### 2.1 品牌色 (Brand Colors)
以「雅致莓果 (Modern Rose)」為主軸。

| Token | Color | Hex | Use Case |
|---|---|---|---|
| `primary` | Rose 600 | `#E11D48` | 按鈕、連結、強調文字、Logo |
| `primary-hover` | Rose 700 | `#BE123C` | 按鈕 Hover 狀態 |
| `primary-light` | Rose 50 | `#FFF1F2` | 背景高亮、標籤背景 |
| `primary-ring` | Rose 200 | `#FECDD3` | Focus Ring |

### 2.2 中性色 (Neutral Colors)
使用 Stone 色系，帶有微暖色調，比純灰更舒適。

| Token | Color | Hex | Use Case |
|---|---|---|---|
| `bg-main` | Stone 50 | `#FAFAF9` | 全站主背景 |
| `bg-card` | White | `#FFFFFF` | 卡片背景、文章內容區 |
| `bg-sidebar` | White | `#FFFFFF` | 側邊欄、導航列 |
| `border-light` | Stone 200 | `#E7E5E4` | 分隔線、邊框 |
| `text-primary` | Stone 900 | `#1C1917` | 大標題、主要文字 |
| `text-secondary` | Stone 600 | `#57534E` | 內文、次要資訊 |
| `text-muted` | Stone 400 | `#A8A29E` | 日期、Footer、Placeholder |

### 2.3 語意色 (Semantic Colors)

| Token | Color | Hex | Use Case |
|---|---|---|---|
| `success` | Emerald 600 | `#059669` | 成功訊息、Toast |
| `warning` | Amber 500 | `#F59E0B` | 警告、注意 |
| `error` | Red 600 | `#DC2626` | 錯誤訊息、刪除按鈕 |
| `info` | Sky 500 | `#0EA5E9` | 提示資訊 |

---

## 3. 字體系統 (Typography)

採用 **純粹現代 (Full Sans-Serif)** 風格。

### 3.1 字體家族 (Font Family)
- **Primary (Sans)**: `Inter`, `Noto Sans TC`, system-ui, sans-serif
- **Mono (Code)**: `JetBrains Mono`, `Fira Code`, monospace

### 3.2 字級階層 (Type Scale)

| Token | Size | Line Height | Weight | Use Case |
|---|---|---|---|---|
| `text-4xl` | 36px | 1.2 | 800 | 首頁 Hero 標題 |
| `text-3xl` | 30px | 1.3 | 700 | 文章大標題 (H1) |
| `text-2xl` | 24px | 1.3 | 700 | 章節標題 (H2) |
| `text-xl` | 20px | 1.4 | 600 | 子標題 (H3)、卡片標題 |
| `text-lg` | 18px | 1.6 | 400 | 文章導言、引言 |
| `text-base` | 16px | 1.75 | 400 | 文章內文 (重點！行高 1.75 易讀性最佳) |
| `text-sm` | 14px | 1.5 | 400/500 | 說明文字、標籤、UI 元件 |
| `text-xs` | 12px | 1.4 | 400 | 日期、版權宣告 |

---

## 4. UI 元件規範 (Component Spec)

### 4.1 按鈕 (Buttons)
- **Primary**: `bg-rose-600 text-white hover:bg-rose-700 rounded-full px-6 py-2 transition-all`
- **Secondary**: `bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-full px-6 py-2`
- **Outline**: `border-2 border-stone-200 text-stone-600 hover:border-rose-600 hover:text-rose-600 rounded-full`
- **Icon Button**: `p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-rose-600`
- **圓角策略**: 全面採用 `rounded-full` (膠囊型) 或 `rounded-xl` (大圓角)，增加親切感。

### 4.2 卡片 (Cards)
- **Style**: `bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`
- **Padding**: `p-6` (預設)
- **Image**: `aspect-[16/9] object-cover rounded-xl mb-4`

### 4.3 導航列 (Navbar)
- **Sticky**: `sticky top-0 z-50`
- **Style**: `bg-white/80 backdrop-blur-md border-b border-stone-100`
- **Layout**: Logo (左) - Menu (中) - Actions (右)

### 4.4 標籤 (Tags)
- **Style**: `bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors`

---

## 5. 頁面佈局 (Layouts)

### 5.1 首頁 (Home) - Magazine Grid
1. **Hero Section**:
   - 寬度：全寬 (Container)
   - 內容：最新/精選文章
   - 樣式：左圖右文 (Desktop) / 上圖下文 (Mobile)
   - 重點：超大標題 + 摘要 + "Read More" 按鈕

2. **Featured Grid**:
   - 佈局：3 欄網格 (Grid-cols-3)
   - 內容：卡片式文章列表

3. **Newsletter**:
   - 位置：列表下方
   - 樣式：Rose-50 背景，簡潔的訂閱表單

### 5.2 文章頁 (Post) - Utility Nav
1. **Header**:
   - 標題、發佈資訊、標籤
   - 不放超大 Hero Image，改用內容寬度圖片，避免佔據首屏

2. **Body**:
   - 寬度：`max-w-[680px]` (最佳閱讀寬度)
   - 佈局：置中

3. **Sidebar (Right)**:
   - 內容：目錄 (TOC)
   - 行為：Sticky，隨捲動跟隨

4. **Floating Actions (Left/Bottom)**:
   - 內容：分享、回到頂部
   - 樣式：懸浮圓形按鈕

### 5.3 後台 (Admin) - Consistent
1. **Sidebar (Left)**:
   - 深色背景 (`bg-stone-900`) 或 淺色 (`bg-stone-50`)
   - 選單項目 Hover 變色 (`text-rose-600`)

2. **Content (Right)**:
   - 簡潔的表格列表
   - 右上角主要操作按鈕

---

## 6. 互動與動效 (Interaction & Motion)

- **Hover**: 所有可點擊元素必須有 Hover 狀態 (顏色變化、位移、陰影)。
- **Transition**: `duration-200 ease-out` 為預設值。
- **Loading**: 使用 Skeleton Screen 取代 Spinner。
- **Scroll**: 圖片 Lazy load + 輕微 Fade-in 進場效果。

---

## 7. 實作計畫 (Implementation Plan)

### Phase 1: 基礎建設 (Setup)
- 設定 Tailwind Config (colors, fonts, border-radius)
- 建立基礎 UI Components (Button, Card, Tag, Input)
- 設定全域 Layout

### Phase 2: 首頁重構 (Home Refactor)
- 實作 Hero Section
- 實作 Magazine Grid 文章列表
- 實作 Newsletter 區塊

### Phase 3: 文章頁優化 (Post Optimization)
- 優化 Typography (行高、字距)
- 實作 TOC (Table of Contents)
- 實作 Markdown 樣式 (Prose)

### Phase 4: 其他頁面 & 後台
- 分類/標籤頁
- 關於頁
- 後台 UI 更新
