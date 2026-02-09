/**
 * @file Slug 自動生成與去重函式
 * @description 從標題生成 URL-friendly slug，支援中文轉拼音。
 *   - 中文轉拼音（使用 pinyin 套件，無聲調模式）
 *   - 轉小寫、空格轉 hyphen
 *   - 移除特殊字元（只保留 a-z0-9-）
 *   - 多個 hyphen 合併為一個
 *   - slug 去重（自動加數字後綴）
 */

import { pinyin } from 'pinyin';

/**
 * 從標題生成 slug
 * - 中文轉拼音（使用 pinyin 套件）
 * - 轉小寫、空格轉 hyphen
 * - 移除特殊字元（只保留 a-z0-9-）
 * - 多個 hyphen 合併為一個
 */
export function generateSlug(title: string): string {
  if (!title.trim()) {
    return '';
  }

  // 使用 pinyin 將中文轉為拼音（無聲調）
  const pinyinResult = pinyin(title, { style: 'normal' });
  const converted = pinyinResult.map((item) => item[0]).join(' ');

  return (
    converted
      // 轉小寫
      .toLowerCase()
      // 將非 a-z0-9 的字元替換為 hyphen
      .replace(/[^a-z0-9]+/g, '-')
      // 移除開頭和結尾的 hyphen
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * 檢查 slug 唯一性並自動加數字後綴
 * - 如果 slug 已存在 → 加上 -2, -3...
 * - checkExists 為非同步函式，接收 slug 回傳 boolean
 */
export async function ensureUniqueSlug(
  slug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let candidate = slug;
  let suffix = 2;

  while (await checkExists(candidate)) {
    candidate = `${slug}-${suffix}`;
    suffix++;
  }

  return candidate;
}
