## Context

NovaScribe 前台 UI 需要進行第二次大規模重構。使用者決定採用極致的 Swiss Style 風格，核心變更為：**移除頂部導航列 (Navbar)**，改用 **左上角隱藏式選單 (Hamburger) + 側邊抽屜 (Side Drawer)**。首頁採用雜誌風格的大圖 Hero，Footer 則轉為極簡條列式，將豐富資訊 (證照、聲明) 收納進互動式 Widget 中。色彩策略轉為高冷的黑白灰基底，紅色僅作點綴。

## Goals / Non-Goals

**Goals:**
1. **Layout 重構 (Minimal)**：移除 Navbar，實作固定式 Hamburger Toggle 與 Side Drawer Navigation。
2. **首頁重構 (Magazine)**：實作 Featured Post Hero (大圖) 與 Visual Grid (3 欄卡片)。
3. **Footer 重構 (Widget System)**：實作極簡 Footer Bar 與動態 Widget 載入機制 (Modal/Drawer 展示)。
4. **視覺風格 (Swiss Style)**：調整色票為 Accents Only (黑白灰 + 紅色點綴)，統一使用無襯線字體。

**Non-Goals:**
1. **不**實作後台的 Widget 管理介面：本次 Widget 內容透過 Config 檔案或寫死在程式碼中 (Hardcoded Data Structure)，預留未來接 API 的空間。
2. **不**變更後端 API。

## Decisions

### 決策 1：導航架構 (Hidden Nav)

**選擇：** 左上角固定 Hamburger Button，點擊滑出 Side Drawer。
**理由：** 符合 kaochenlong.com 的極簡閱讀體驗，將螢幕空間 100% 留給內容。

**元件結構：**
- `LayoutMinimal.tsx`: 全站 Wrapper。
- `NavToggle.tsx`: 左上角固定按鈕。
- `SideDrawer.tsx`: 滑出的導航面板 (含 Avatar, Bio, Links)。

### 決策 2：Footer Widget 系統

**選擇：** 定義靜態 Config 結構，前端動態渲染 Widget。
**理由：** 雖然不接後端資料庫，但前端結構需保留彈性。

**Config 範例：**
```typescript
export const footerWidgets = [
  { type: 'link', label: 'Disclaimer', content: 'markdown content...' },
  { type: 'image-grid', label: 'Certifications', images: [...] },
]
```
點擊 label 開啟 Modal 顯示 content。

### 決策 3：首頁 Hero 邏輯

**選擇：** 取最新一篇文章作為 Featured Post，其餘文章進入 Grid。
**理由：** 建立明確的視覺階層，強調「最新」內容。

## Risks / Trade-offs

### 風險：隱藏導航降低發現率
**緩解**：Hamburger Button 必須非常顯眼 (例如使用主色或高對比色)，且 Side Drawer 內需包含完整的導航連結。

## Migration Plan

1. **建立新 Layout 系統**：`LayoutMinimal`, `NavToggle`, `SideDrawer`。
2. **建立 Widget 系統**：`WidgetModal`, `WidgetRenderer`。
3. **建立新首頁元件**：`FeaturedHero`, `VisualGrid`。
4. **全站套用**：替換 `src/app/(public)/layout.tsx`。
5. **樣式調整**：全域 CSS 變數調整為 Monochrome 風格。
