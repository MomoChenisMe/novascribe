/**
 * @file SEO 資料驗證函式單元測試
 * @description 測試 SeoMetadataSchema 與 SitemapConfigSchema 的驗證邏輯
 *   - meta title ≤ 70 字元
 *   - meta description ≤ 160 字元
 *   - priority 0.0-1.0
 *   - URL 格式驗證
 *   - Twitter Card 類型驗證
 */

import { SeoMetadataSchema, SitemapConfigSchema } from '@/lib/seo/validation';

describe('SeoMetadataSchema', () => {
  describe('metaTitle', () => {
    it('應接受 70 字元以內的標題', () => {
      const result = SeoMetadataSchema.safeParse({
        metaTitle: 'A'.repeat(70),
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕超過 70 字元的標題', () => {
      const result = SeoMetadataSchema.safeParse({
        metaTitle: 'A'.repeat(71),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('70');
      }
    });

    it('應接受 null 值', () => {
      const result = SeoMetadataSchema.safeParse({
        metaTitle: null,
      });
      expect(result.success).toBe(true);
    });

    it('應接受空字串', () => {
      const result = SeoMetadataSchema.safeParse({
        metaTitle: '',
      });
      expect(result.success).toBe(true);
    });

    it('應接受省略的 metaTitle', () => {
      const result = SeoMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('metaDescription', () => {
    it('應接受 160 字元以內的描述', () => {
      const result = SeoMetadataSchema.safeParse({
        metaDescription: 'B'.repeat(160),
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕超過 160 字元的描述', () => {
      const result = SeoMetadataSchema.safeParse({
        metaDescription: 'B'.repeat(161),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('160');
      }
    });

    it('應接受 null 值', () => {
      const result = SeoMetadataSchema.safeParse({
        metaDescription: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ogTitle', () => {
    it('應接受 95 字元以內的 OG 標題', () => {
      const result = SeoMetadataSchema.safeParse({
        ogTitle: 'C'.repeat(95),
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕超過 95 字元的 OG 標題', () => {
      const result = SeoMetadataSchema.safeParse({
        ogTitle: 'C'.repeat(96),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ogDescription', () => {
    it('應接受 200 字元以內的 OG 描述', () => {
      const result = SeoMetadataSchema.safeParse({
        ogDescription: 'D'.repeat(200),
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕超過 200 字元的 OG 描述', () => {
      const result = SeoMetadataSchema.safeParse({
        ogDescription: 'D'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ogImage', () => {
    it('應接受有效 URL', () => {
      const result = SeoMetadataSchema.safeParse({
        ogImage: 'https://example.com/image.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕無效 URL', () => {
      const result = SeoMetadataSchema.safeParse({
        ogImage: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('應接受 null 值', () => {
      const result = SeoMetadataSchema.safeParse({
        ogImage: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('twitterCard', () => {
    it('應接受有效的 Twitter Card 類型', () => {
      const validTypes = ['summary', 'summary_large_image', 'app', 'player'];
      for (const type of validTypes) {
        const result = SeoMetadataSchema.safeParse({ twitterCard: type });
        expect(result.success).toBe(true);
      }
    });

    it('應拒絕無效的 Twitter Card 類型', () => {
      const result = SeoMetadataSchema.safeParse({
        twitterCard: 'invalid_type',
      });
      expect(result.success).toBe(false);
    });

    it('應預設為 summary_large_image', () => {
      const result = SeoMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twitterCard).toBe('summary_large_image');
      }
    });
  });

  describe('canonicalUrl', () => {
    it('應接受有效 URL', () => {
      const result = SeoMetadataSchema.safeParse({
        canonicalUrl: 'https://example.com/post',
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕無效 URL', () => {
      const result = SeoMetadataSchema.safeParse({
        canonicalUrl: 'not-a-valid-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('noIndex / noFollow', () => {
    it('應預設 noIndex 為 false', () => {
      const result = SeoMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.noIndex).toBe(false);
      }
    });

    it('應預設 noFollow 為 false', () => {
      const result = SeoMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.noFollow).toBe(false);
      }
    });

    it('應接受 true 值', () => {
      const result = SeoMetadataSchema.safeParse({
        noIndex: true,
        noFollow: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('focusKeyword', () => {
    it('應接受 100 字元以內的關鍵字', () => {
      const result = SeoMetadataSchema.safeParse({
        focusKeyword: 'E'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕超過 100 字元的關鍵字', () => {
      const result = SeoMetadataSchema.safeParse({
        focusKeyword: 'E'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('完整資料驗證', () => {
    it('應接受完整的 SEO 資料', () => {
      const result = SeoMetadataSchema.safeParse({
        metaTitle: '測試文章標題',
        metaDescription: '這是一篇測試文章的 SEO 描述',
        ogTitle: 'OG 標題',
        ogDescription: 'OG 描述',
        ogImage: 'https://example.com/og.jpg',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://example.com/post',
        noIndex: false,
        noFollow: false,
        focusKeyword: 'Next.js',
      });
      expect(result.success).toBe(true);
    });

    it('應接受空物件（所有欄位 optional）', () => {
      const result = SeoMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('SitemapConfigSchema', () => {
  describe('path', () => {
    it('應接受有效路徑', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/posts/*',
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕空字串', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('priority', () => {
    it('應接受 0.0', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        priority: 0.0,
      });
      expect(result.success).toBe(true);
    });

    it('應接受 1.0', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        priority: 1.0,
      });
      expect(result.success).toBe(true);
    });

    it('應接受 0.5（中間值）', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        priority: 0.5,
      });
      expect(result.success).toBe(true);
    });

    it('應拒絕小於 0.0 的值', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        priority: -0.1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('0.0');
      }
    });

    it('應拒絕大於 1.0 的值', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        priority: 1.1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1.0');
      }
    });

    it('應預設為 0.5', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(0.5);
      }
    });
  });

  describe('changefreq', () => {
    it('應接受所有有效頻率值', () => {
      const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      for (const freq of validFreqs) {
        const result = SitemapConfigSchema.safeParse({
          path: '/test',
          changefreq: freq,
        });
        expect(result.success).toBe(true);
      }
    });

    it('應拒絕無效頻率值', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
        changefreq: 'biweekly',
      });
      expect(result.success).toBe(false);
    });

    it('應預設為 weekly', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.changefreq).toBe('weekly');
      }
    });
  });

  describe('enabled', () => {
    it('應預設為 true', () => {
      const result = SitemapConfigSchema.safeParse({
        path: '/test',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });
  });
});
