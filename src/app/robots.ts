/**
 * @file 動態 Robots.txt 生成
 * @description Next.js App Router 原生 robots.ts
 *   - 預設規則：Allow: /, Disallow: /admin/, /api/
 *   - 自訂規則從 site_settings 讀取
 *   - 保護性路徑（/admin/、/api/）不可解除
 *   - 自動包含 Sitemap URL
 */

import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { parseCustomRules, mergeRules } from '@/lib/seo/robots';

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();

  // 讀取自訂規則
  const customRulesSetting = await prisma.siteSetting.findUnique({
    where: { key: 'seo.robots_custom_rules' },
  });

  const customRulesText = customRulesSetting?.value || '';
  const customRules = parseCustomRules(customRulesText);
  const mergedRules = mergeRules(customRules);

  // 轉換為 Next.js MetadataRoute.Robots 格式
  const rules: MetadataRoute.Robots['rules'] = mergedRules.map((rule) => ({
    userAgent: rule.userAgent,
    allow: rule.allow,
    disallow: rule.disallow,
  }));

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
