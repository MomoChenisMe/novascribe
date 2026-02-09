/**
 * @file SEO Schema 結構驗證測試
 * @description 透過讀取 Prisma schema 檔案驗證 SeoMetadata、SitemapConfig、SiteSetting
 *   model 的欄位定義、關聯與約束。不需要實際的資料庫連線。
 */

import * as fs from 'fs';
import * as path from 'path';

describe('SEO Schema 結構驗證', () => {
  let schemaContent: string;

  /**
   * 從 schema 中擷取特定 model 的區塊內容
   */
  function extractBlock(name: string, type: 'model' | 'enum' = 'model'): string {
    const regex = new RegExp(`${type}\\s+${name}\\s*\\{([^}]*)\\}`, 's');
    const match = schemaContent.match(regex);
    return match ? match[1] : '';
  }

  beforeAll(() => {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  });

  // ===== SeoMetadata Model =====
  describe('SeoMetadata model', () => {
    it('應定義 SeoMetadata model', () => {
      expect(schemaContent).toMatch(/model\s+SeoMetadata\s*\{/);
    });

    it('應映射到 "seo_metadata" 資料表', () => {
      const block = extractBlock('SeoMetadata');
      expect(block).toMatch(/@@map\("seo_metadata"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 postId 欄位（String, @unique）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/postId\s+String\s+@unique/);
      });

      it('應包含 metaTitle 欄位（String?, @map("meta_title"), @db.VarChar(70)）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/metaTitle\s+String\?/);
        expect(block).toMatch(/@map\("meta_title"\)/);
        expect(block).toMatch(/@db\.VarChar\(70\)/);
      });

      it('應包含 metaDescription 欄位（String?, @map("meta_description"), @db.VarChar(160)）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/metaDescription\s+String\?/);
        expect(block).toMatch(/@map\("meta_description"\)/);
        expect(block).toMatch(/@db\.VarChar\(160\)/);
      });

      it('應包含 ogTitle 欄位（String?, @map("og_title"), @db.VarChar(95)）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/ogTitle\s+String\?/);
        expect(block).toMatch(/@map\("og_title"\)/);
        expect(block).toMatch(/@db\.VarChar\(95\)/);
      });

      it('應包含 ogDescription 欄位（String?, @map("og_description"), @db.VarChar(200)）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/ogDescription\s+String\?/);
        expect(block).toMatch(/@map\("og_description"\)/);
        expect(block).toMatch(/@db\.VarChar\(200\)/);
      });

      it('應包含 ogImage 欄位（String?, @map("og_image")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/ogImage\s+String\?/);
        expect(block).toMatch(/@map\("og_image"\)/);
      });

      it('應包含 twitterCard 欄位（String, @default("summary_large_image"), @map("twitter_card")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/twitterCard\s+String\s+@default\("summary_large_image"\)/);
        expect(block).toMatch(/@map\("twitter_card"\)/);
      });

      it('應包含 canonicalUrl 欄位（String?, @map("canonical_url")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/canonicalUrl\s+String\?/);
        expect(block).toMatch(/@map\("canonical_url"\)/);
      });

      it('應包含 noIndex 欄位（Boolean, @default(false), @map("no_index")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/noIndex\s+Boolean\s+@default\(false\)/);
        expect(block).toMatch(/@map\("no_index"\)/);
      });

      it('應包含 noFollow 欄位（Boolean, @default(false), @map("no_follow")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/noFollow\s+Boolean\s+@default\(false\)/);
        expect(block).toMatch(/@map\("no_follow"\)/);
      });

      it('應包含 focusKeyword 欄位（String?, @map("focus_keyword"), @db.VarChar(100)）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/focusKeyword\s+String\?/);
        expect(block).toMatch(/@map\("focus_keyword"\)/);
        expect(block).toMatch(/@db\.VarChar\(100\)/);
      });

      it('應包含 seoScore 欄位（Int?, @map("seo_score")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/seoScore\s+Int\?/);
        expect(block).toMatch(/@map\("seo_score"\)/);
      });

      it('應包含 createdAt 欄位（DateTime, @default(now()), @map("created_at")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
        expect(block).toMatch(/@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（DateTime, @updatedAt, @map("updated_at")）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
        expect(block).toMatch(/@map\("updated_at"\)/);
      });
    });

    describe('關聯', () => {
      it('應定義與 Post 的關聯（onDelete: Cascade）', () => {
        const block = extractBlock('SeoMetadata');
        expect(block).toMatch(/post\s+Post\s+@relation\(fields:\s*\[postId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/);
      });

      it('Post model 應包含 seoMetadata 關聯', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/seoMetadata\s+SeoMetadata\?/);
      });
    });
  });

  // ===== SitemapConfig Model =====
  describe('SitemapConfig model', () => {
    it('應定義 SitemapConfig model', () => {
      expect(schemaContent).toMatch(/model\s+SitemapConfig\s*\{/);
    });

    it('應映射到 "sitemap_configs" 資料表', () => {
      const block = extractBlock('SitemapConfig');
      expect(block).toMatch(/@@map\("sitemap_configs"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 path 欄位（String, @unique）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/path\s+String\s+@unique/);
      });

      it('應包含 changefreq 欄位（String, @default("weekly")）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/changefreq\s+String\s+@default\("weekly"\)/);
      });

      it('應包含 priority 欄位（Float, @default(0.5)）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/priority\s+Float\s+@default\(0\.5\)/);
      });

      it('應包含 enabled 欄位（Boolean, @default(true)）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/enabled\s+Boolean\s+@default\(true\)/);
      });

      it('應包含 createdAt 欄位（DateTime, @default(now()), @map("created_at")）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
        expect(block).toMatch(/@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（DateTime, @updatedAt, @map("updated_at")）', () => {
        const block = extractBlock('SitemapConfig');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
        expect(block).toMatch(/@map\("updated_at"\)/);
      });
    });
  });

  // ===== SiteSetting Model =====
  describe('SiteSetting model', () => {
    it('應定義 SiteSetting model', () => {
      expect(schemaContent).toMatch(/model\s+SiteSetting\s*\{/);
    });

    it('應映射到 "site_settings" 資料表', () => {
      const block = extractBlock('SiteSetting');
      expect(block).toMatch(/@@map\("site_settings"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('SiteSetting');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 key 欄位（String, @unique）', () => {
        const block = extractBlock('SiteSetting');
        expect(block).toMatch(/key\s+String\s+@unique/);
      });

      it('應包含 value 欄位（String, @db.Text）', () => {
        const block = extractBlock('SiteSetting');
        expect(block).toMatch(/value\s+String\s+@db\.Text/);
      });

      it('應包含 createdAt 欄位（DateTime, @default(now()), @map("created_at")）', () => {
        const block = extractBlock('SiteSetting');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
        expect(block).toMatch(/@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（DateTime, @updatedAt, @map("updated_at")）', () => {
        const block = extractBlock('SiteSetting');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
        expect(block).toMatch(/@map\("updated_at"\)/);
      });
    });
  });
});
