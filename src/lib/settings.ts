/**
 * @file Site Settings 工具函式
 * @description 從 site_settings 資料表讀寫設定值
 *   - getSettingValue: 讀取單一設定值
 *   - setSettingValue: 寫入設定值（upsert）
 *   - getSettingValues: 批量讀取設定值
 */

import { prisma } from '@/lib/prisma';

/**
 * 取得單一設定值
 * @param key 設定鍵名（如 'seo.default_title'）
 * @returns 設定值字串，不存在時回傳 null
 */
export async function getSettingValue(key: string): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key },
  });
  return setting?.value ?? null;
}

/**
 * 寫入設定值（upsert）
 * @param key 設定鍵名
 * @param value 設定值
 */
export async function setSettingValue(
  key: string,
  value: string
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * 批量取得設定值
 * @param keys 設定鍵名陣列
 * @returns 鍵值對映射
 */
export async function getSettingValues(
  keys: string[]
): Promise<Record<string, string | null>> {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });

  const result: Record<string, string | null> = {};
  for (const key of keys) {
    const setting = settings.find((s) => s.key === key);
    result[key] = setting?.value ?? null;
  }
  return result;
}
