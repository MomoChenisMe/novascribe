## 1. Avatar 元件建立

- [ ] 1.1 建立 `src/components/ui/Avatar.tsx` 元件
- [ ] 1.2 實作 Image Mode (傳入 `src` 時顯示圖片)
- [ ] 1.3 實作 Initials Mode (提取首字母邏輯，支援英文與中文)
- [ ] 1.4 實作 Fallback Mode (預設使用者圖示)
- [ ] 1.5 實作品牌色主題 (Rose 600 背景 + 白色文字)
- [ ] 1.6 撰寫 Avatar 元件測試 (`Avatar.test.tsx`)

## 2. SideDrawer 頭像整合

- [ ] 2.1 更新 `SideDrawer.tsx`：替換灰色佔位圓為 `Avatar` 元件
- [ ] 2.2 傳入使用者名稱 "Momo Chen" 至 Avatar
- [ ] 2.3 測試：驗證 SideDrawer 頭像顯示正確

## 3. NavToggle 對比度強化

- [ ] 3.1 更新 `NavToggle.tsx`：添加毛玻璃背景 (`backdrop-blur-sm`)
- [ ] 3.2 添加半透明底座 (`bg-white/80` Light / `bg-neutral-900/80` Dark)
- [ ] 3.3 添加微弱陰影 (`shadow-md`)
- [ ] 3.4 測試：驗證按鈕在複雜背景下清晰可見

## 4. WidgetModal 響應式寬度

- [ ] 4.1 更新 `WidgetModal.tsx`：根據 `widget.type` 動態調整寬度
- [ ] 4.2 `rich-text` 與 `link-list` 使用 `max-w-lg`
- [ ] 4.3 `image-grid` 使用 `max-w-4xl`
- [ ] 4.4 測試：驗證 Certifications Modal 寬度正確

## 5. FooterBar 互動提示

- [ ] 5.1 更新 `FooterBar.tsx`：為 Widget 按鈕添加下底線
- [ ] 5.2 添加樣式：`underline underline-offset-4 decoration-neutral-300`
- [ ] 5.3 添加 Hover 效果：`hover:text-primary hover:decoration-primary`
- [ ] 5.4 測試：驗證 Footer 按鈕互動提示清晰

## 6. 圖片資源補全

- [ ] 6.1 建立 `/public/images/certs/` 目錄
- [ ] 6.2 生成 3 張 placeholder 圖片 (600×400, WebP 格式)
- [ ] 6.3 使用 `https://placehold.co/600x400/E11D48/FFFFFF?text=Cert+X`
- [ ] 6.4 測試：驗證 Certifications Modal 圖片載入正常

## 7. 測試與驗證

- [ ] 7.1 執行全站視覺回歸測試
- [ ] 7.2 驗證 NavToggle 在不同背景下可見性
- [ ] 7.3 驗證 Avatar 在 Light/Dark Mode 下顯示正確
- [ ] 7.4 驗證 Modal 寬度策略符合預期
- [ ] 7.5 驗證 Footer 互動提示清晰
- [ ] 7.6 更新文件 (CHANGELOG 或 README)
