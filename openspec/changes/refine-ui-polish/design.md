## Context

NovaScribe 前台在 `redesign-frontend-v2` 變更中完成了 Swiss Style Minimal 重構，建立了極簡導航系統 (NavToggle + SideDrawer)、Widget 系統 (FooterBar + WidgetModal)、雜誌風格首頁 (FeaturedHero + VisualGrid)。功能驗證完成後，設計審查發現五個影響專業度的視覺問題，需要進行設計細節打磨 (UI Polish)。

當前問題：
1. **Widget Modal 過窄**：`max-w-lg` (512px) 無法良好展示圖片網格
2. **SideDrawer Avatar 未完成**：灰色佔位圓 (`bg-stone-200`) 看起來像 Wireframe
3. **NavToggle 對比度不足**：Fixed 按鈕在複雜背景下可能不可見
4. **圖片資源缺失**：`/images/certs/*.png` 404 錯誤
5. **Footer 互動提示模糊**：Widget 按鈕看起來像靜態文字

## Goals / Non-Goals

**Goals:**
1. **修復視覺完成度**：移除所有「半成品」感受，提升專業度至發布標準
2. **改善內容展示**：為圖片密集型 Widget 提供足夠的展示空間
3. **強化互動可見性**：確保所有互動元素 (按鈕、連結) 在任何背景下清晰可辨
4. **建立可重用元件**：將 Avatar 抽取為通用元件，供全站使用

**Non-Goals:**
1. **不**重構現有架構：保持 LayoutMinimal + SideDrawer + FooterBar 結構不變
2. **不**新增功能：僅調整視覺呈現，不新增 Widget 類型或導航邏輯
3. **不**變更色彩系統：維持 Accents Only 策略 (Neutral + Rose)

## Decisions

### 決策 1：Modal 寬度策略（內容驅動）

**選擇**：根據 Widget 類型動態調整 Modal 寬度。
- `rich-text`, `link-list`: 保持 `max-w-lg` (512px)
- `image-grid`: 擴大至 `max-w-4xl` (896px)

**理由**：證照圖片通常為橫式 (Landscape)，窄 Modal 會導致圖片縮得太小或垂直堆疊。寬 Modal 允許 3 欄展示，保持 Grid 的視覺氣勢。

**替代方案**：統一使用 `max-w-4xl` → 否決，因文字內容在過寬 Modal 中閱讀體驗差（行長過長）。

### 決策 2：Avatar 元件設計（首字母 + 品牌色）

**選擇**：建立 `Avatar.tsx` 元件，支援三種模式：
1. **Image Mode**：傳入 `src` 時顯示圖片
2. **Initials Mode**：傳入 `name` 時提取首字母 (如 "Momo Chen" → "MC")
3. **Fallback Mode**：無參數時顯示預設 Icon

顏色策略：使用品牌主色 (Rose 600) 作為背景，白色文字。

**理由**：首字母 Avatar 在無真實圖片時提供個人化感受，比灰色圓圈更有溫度。品牌色強化視覺識別。

**替代方案**：使用幾何圖形 (如六邊形) → 否決，首字母更直觀且符合業界慣例 (GitHub, Gmail)。

### 決策 3：NavToggle 背景層（毛玻璃 + 陰影）

**選擇**：為 Hamburger 按鈕添加：
- `backdrop-blur-sm`：毛玻璃效果
- `bg-white/80` (Light Mode) / `bg-neutral-900/80` (Dark Mode)：半透明背景
- `shadow-md`：微弱陰影，增強層次

**理由**：Fixed 元素疊加在內容上時，需要背景層提升可見性。毛玻璃效果保持極簡美感，同時確保在任何圖片上可讀。

**替代方案**：純色背景 → 否決，破壞極簡設計；僅使用陰影 → 否決，對比度仍不足。

### 決策 4：圖片資源策略（Placeholder Service）

**選擇**：在 `/public/images/certs/` 建立 3 張 600×400 的 placeholder 圖片，使用 `https://placehold.co/600x400/E11D48/FFFFFF?text=Cert+1` 生成。

**理由**：使用外部 Placeholder 服務快速產生圖片，避免版權問題。尺寸 600×400 (3:2) 符合證照常見比例。

**替代方案**：使用 Next.js Image Placeholder → 否決，需要真實圖片才能生成；使用 SVG → 否決，不如真實感。

### 決策 5：Footer 連結視覺提示（微妙下底線）

**選擇**：為 FooterBar 的 Widget 按鈕添加：
- `underline underline-offset-4 decoration-neutral-300`：微妙下底線
- Hover 時變色：`hover:text-primary hover:decoration-primary`

**理由**：下底線是網頁連結的經典提示，微妙的樣式不破壞極簡設計。Hover 時的顏色變化強化互動回饋。

**替代方案**：使用 Icon → 否決，過於擁擠；僅靠 Hover → 否決，初始狀態無提示。

## Risks / Trade-offs

### 風險 1：Modal 寬度切換複雜度
**緩解**：在 `WidgetModal` 中根據 `widget.type` 判斷，使用三元運算符切換 `max-w-lg` / `max-w-4xl`。邏輯簡單，無需重構。

### 風險 2：首字母提取邏輯 (CJK 支援)
**緩解**：對於中文名字 (如 "陳默默")，取前兩個字 ("陳默")，避免單字不夠識別度。使用 `name.slice(0, 2)` 處理。

### 風險 3：Placeholder 圖片檔案大小
**緩解**：使用 WebP 格式壓縮，控制每張圖片 < 50KB。三張圖片總計 < 150KB，不影響載入速度。
