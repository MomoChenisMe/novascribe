/**
 * @file SEO 資料驗證函式
 * @description 使用 Zod 定義 SEO 資料驗證 schema
 *   - SeoMetadataSchema: SEO meta 資料驗證
 *   - meta title ≤ 70 字元
 *   - meta description ≤ 160 字元
 *   - priority 0.0-1.0
 */

import { z } from 'zod';

/** Twitter Card 類型 */
const TwitterCardSchema = z.enum([
  'summary',
  'summary_large_image',
  'app',
  'player',
]);

/** SEO Metadata 建立/更新 schema */
export const SeoMetadataSchema = z.object({
  metaTitle: z
    .string()
    .max(70, 'Meta title 不得超過 70 字元')
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, 'Meta description 不得超過 160 字元')
    .optional()
    .nullable(),
  ogTitle: z
    .string()
    .max(95, 'OG title 不得超過 95 字元')
    .optional()
    .nullable(),
  ogDescription: z
    .string()
    .max(200, 'OG description 不得超過 200 字元')
    .optional()
    .nullable(),
  ogImage: z.string().url('OG image 必須為有效 URL').optional().nullable(),
  twitterCard: TwitterCardSchema.default('summary_large_image'),
  canonicalUrl: z
    .string()
    .url('Canonical URL 必須為有效 URL')
    .optional()
    .nullable(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  focusKeyword: z
    .string()
    .max(100, 'Focus keyword 不得超過 100 字元')
    .optional()
    .nullable(),
});

/** Sitemap 設定驗證 schema */
export const SitemapConfigSchema = z.object({
  path: z.string().min(1, 'Path 不得為空'),
  changefreq: z.enum([
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
  ]).default('weekly'),
  priority: z
    .number()
    .min(0.0, 'Priority 最小為 0.0')
    .max(1.0, 'Priority 最大為 1.0')
    .default(0.5),
  enabled: z.boolean().default(true),
});

export type SeoMetadataInput = z.infer<typeof SeoMetadataSchema>;
export type SitemapConfigInput = z.infer<typeof SitemapConfigSchema>;
