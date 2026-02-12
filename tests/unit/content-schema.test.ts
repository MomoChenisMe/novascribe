/**
 * @file 內容管理 Schema 結構驗證測試
 * @description 透過讀取 Prisma schema 檔案驗證 Post、PostVersion、Category、Tag、PostTag、Media
 *   model 的欄位定義、索引、關聯與約束。不需要實際的資料庫連線。
 */

import * as fs from 'fs';
import * as path from 'path';

describe('內容管理 Schema 結構驗證', () => {
  let schemaContent: string;

  /**
   * 從 schema 中擷取特定 model 或 enum 的區塊內容
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

  // ===== PostStatus Enum =====
  describe('PostStatus enum', () => {
    it('應定義 PostStatus enum', () => {
      expect(schemaContent).toMatch(/enum\s+PostStatus\s*\{/);
    });

    it('應包含 DRAFT 值', () => {
      const block = extractBlock('PostStatus', 'enum');
      expect(block).toContain('DRAFT');
    });

    it('應包含 PUBLISHED 值', () => {
      const block = extractBlock('PostStatus', 'enum');
      expect(block).toContain('PUBLISHED');
    });

    it('應包含 SCHEDULED 值', () => {
      const block = extractBlock('PostStatus', 'enum');
      expect(block).toContain('SCHEDULED');
    });

    it('應包含 ARCHIVED 值', () => {
      const block = extractBlock('PostStatus', 'enum');
      expect(block).toContain('ARCHIVED');
    });
  });

  // ===== Post Model =====
  describe('Post model', () => {
    it('應定義 Post model', () => {
      expect(schemaContent).toMatch(/model\s+Post\s*\{/);
    });

    it('應映射到 "posts" 資料表', () => {
      const block = extractBlock('Post');
      expect(block).toMatch(/@@map\("posts"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 title 欄位（String）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/title\s+String/);
      });

      it('應包含 slug 欄位（String, @unique）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/slug\s+String\s+@unique/);
      });

      it('應包含 content 欄位（String, @db.Text）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/content\s+String\s+@db\.Text/);
      });

      it('應包含 excerpt 欄位（String?, @db.Text）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/excerpt\s+String\?\s+@db\.Text/);
      });

      it('應包含 coverImage 欄位（String?）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/coverImage\s+String\?/);
      });

      it('應包含 status 欄位（PostStatus, @default(DRAFT)）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/status\s+PostStatus\s+@default\(DRAFT\)/);
      });

      it('應包含 publishedAt 欄位（DateTime?）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/publishedAt\s+DateTime\?/);
      });

      it('應包含 scheduledAt 欄位（DateTime?）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/scheduledAt\s+DateTime\?/);
      });

      it('應包含 authorId 欄位（String）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/authorId\s+String/);
      });

      it('應包含 categoryId 欄位（String?）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/categoryId\s+String\?/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（@map("updated_at")）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt\s+@map\("updated_at"\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 author 關聯到 User', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/author\s+User\s+@relation\(fields:\s*\[authorId\]/);
      });

      it('應定義 category 關聯到 Category（onDelete: SetNull）', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/category\s+Category\?\s+@relation\(.*onDelete:\s*SetNull/);
      });

      it('應定義 tags 關聯到 PostTag[]', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/tags\s+PostTag\[\]/);
      });

      it('應定義 versions 關聯到 PostVersion[]', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/versions\s+PostVersion\[\]/);
      });
    });

    describe('索引定義', () => {
      it('應在 status 上建立索引', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/@@index\(\[status\]\)/);
      });

      it('應在 publishedAt 上建立索引', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/@@index\(\[publishedAt\]\)/);
      });

      it('應在 slug 上建立索引', () => {
        const block = extractBlock('Post');
        expect(block).toMatch(/@@index\(\[slug\]\)/);
      });
    });
  });

  // ===== PostVersion Model =====
  describe('PostVersion model', () => {
    it('應定義 PostVersion model', () => {
      expect(schemaContent).toMatch(/model\s+PostVersion\s*\{/);
    });

    it('應映射到 "post_versions" 資料表', () => {
      const block = extractBlock('PostVersion');
      expect(block).toMatch(/@@map\("post_versions"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 postId 欄位（@map("post_id")）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/postId\s+String\s+@map\("post_id"\)/);
      });

      it('應包含 title 欄位（String）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/title\s+String/);
      });

      it('應包含 content 欄位（String, @db.Text）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/content\s+String\s+@db\.Text/);
      });

      it('應包含 version 欄位（Int）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/version\s+Int/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 post 關聯到 Post（onDelete: Cascade）', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/post\s+Post\s+@relation\(.*onDelete:\s*Cascade/);
      });
    });

    describe('索引定義', () => {
      it('應在 [postId, version] 上建立複合索引', () => {
        const block = extractBlock('PostVersion');
        expect(block).toMatch(/@@index\(\[postId,\s*version\]\)/);
      });
    });
  });

  // ===== Category Model =====
  describe('Category model', () => {
    it('應定義 Category model', () => {
      expect(schemaContent).toMatch(/model\s+Category\s*\{/);
    });

    it('應映射到 "categories" 資料表', () => {
      const block = extractBlock('Category');
      expect(block).toMatch(/@@map\("categories"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 name 欄位（String, @unique）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/name\s+String\s+@unique/);
      });

      it('應包含 slug 欄位（String, @unique）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/slug\s+String\s+@unique/);
      });

      it('應包含 parentId 欄位（String?, @map("parent_id")）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/parentId\s+String\?\s+@map\("parent_id"\)/);
      });

      it('應包含 sortOrder 欄位（Int, @default(0), @map("sort_order")）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/sortOrder\s+Int\s+@default\(0\)\s+@map\("sort_order"\)/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（@map("updated_at")）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt\s+@map\("updated_at"\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 parent 自關聯（CategoryHierarchy, onDelete: SetNull）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(
          /parent\s+Category\?\s+@relation\("CategoryHierarchy",\s*fields:\s*\[parentId\].*onDelete:\s*SetNull/
        );
      });

      it('應定義 children 自關聯（CategoryHierarchy）', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/children\s+Category\[\]\s+@relation\("CategoryHierarchy"\)/);
      });

      it('應定義 posts 關聯到 Post[]', () => {
        const block = extractBlock('Category');
        expect(block).toMatch(/posts\s+Post\[\]/);
      });
    });
  });

  // ===== Tag Model =====
  describe('Tag model', () => {
    it('應定義 Tag model', () => {
      expect(schemaContent).toMatch(/model\s+Tag\s*\{/);
    });

    it('應映射到 "tags" 資料表', () => {
      const block = extractBlock('Tag');
      expect(block).toMatch(/@@map\("tags"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 name 欄位（String, @unique）', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/name\s+String\s+@unique/);
      });

      it('應包含 slug 欄位（String, @unique）', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/slug\s+String\s+@unique/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });

      it('應包含 updatedAt 欄位（@map("updated_at")）', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/updatedAt\s+DateTime\s+@updatedAt\s+@map\("updated_at"\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 posts 關聯到 PostTag[]', () => {
        const block = extractBlock('Tag');
        expect(block).toMatch(/posts\s+PostTag\[\]/);
      });
    });
  });

  // ===== PostTag Model =====
  describe('PostTag model', () => {
    it('應定義 PostTag model', () => {
      expect(schemaContent).toMatch(/model\s+PostTag\s*\{/);
    });

    it('應映射到 "post_tags" 資料表', () => {
      const block = extractBlock('PostTag');
      expect(block).toMatch(/@@map\("post_tags"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 postId 欄位（@map("post_id")）', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/postId\s+String\s+@map\("post_id"\)/);
      });

      it('應包含 tagId 欄位（@map("tag_id")）', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/tagId\s+String\s+@map\("tag_id"\)/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });
    });

    describe('複合主鍵', () => {
      it('應使用 [postId, tagId] 作為複合主鍵', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/@@id\(\[postId,\s*tagId\]\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 post 關聯到 Post（onDelete: Cascade）', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/post\s+Post\s+@relation\(.*onDelete:\s*Cascade/);
      });

      it('應定義 tag 關聯到 Tag（onDelete: Cascade）', () => {
        const block = extractBlock('PostTag');
        expect(block).toMatch(/tag\s+Tag\s+@relation\(.*onDelete:\s*Cascade/);
      });
    });
  });

  // ===== Media Model =====
  describe('Media model', () => {
    it('應定義 Media model', () => {
      expect(schemaContent).toMatch(/model\s+Media\s*\{/);
    });

    it('應映射到 "media" 資料表', () => {
      const block = extractBlock('Media');
      expect(block).toMatch(/@@map\("media"\)/);
    });

    describe('欄位定義', () => {
      it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/id\s+String\s+@id\s+@default\(cuid\(\)\)/);
      });

      it('應包含 filename 欄位（String）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/filename\s+String/);
      });

      it('應包含 mimeType 欄位（String, @map("mime_type")）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/mimeType\s+String\s+@map\("mime_type"\)/);
      });

      it('應包含 size 欄位（Int）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/size\s+Int/);
      });

      it('應包含 url 欄位（String）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/url\s+String/);
      });

      it('應包含 thumbnailUrl 欄位（String?, @map("thumbnail_url")）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/thumbnailUrl\s+String\?\s+@map\("thumbnail_url"\)/);
      });

      it('應包含 uploadedBy 欄位（String, @map("uploaded_by")）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/uploadedBy\s+String\s+@map\("uploaded_by"\)/);
      });

      it('應包含 createdAt 欄位（@map("created_at")）', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/);
      });
    });

    describe('關聯定義', () => {
      it('應定義 uploader 關聯到 User', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/uploader\s+User\s+@relation\(fields:\s*\[uploadedBy\]/);
      });
    });

    describe('索引定義', () => {
      it('應在 uploadedBy 上建立索引', () => {
        const block = extractBlock('Media');
        expect(block).toMatch(/@@index\(\[uploadedBy\]\)/);
      });
    });
  });

  // ===== User Model 關聯更新 =====
  describe('User model 關聯更新', () => {
    it('User model 應包含 posts 關聯', () => {
      const block = extractBlock('User');
      expect(block).toMatch(/posts\s+Post\[\]/);
    });

    it('User model 應包含 media 關聯', () => {
      const block = extractBlock('User');
      expect(block).toMatch(/media\s+Media\[\]/);
    });
  });
});
