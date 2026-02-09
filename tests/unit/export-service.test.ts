/**
 * @file 匯出 Service 層測試
 * @description 測試文章匯出邏輯
 *   - exportPost：單篇匯出 Markdown + YAML front matter
 *   - exportPostsBatch：批次匯出為 ZIP
 *
 * @jest-environment node
 */

import { exportPost, exportPostsBatch } from '@/services/export.service';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立完整 mock 文章資料（含關聯） */
function mockPostWithRelations(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    status: string;
    publishedAt: Date | null;
    category: { name: string } | null;
    tags: Array<{ tag: { name: string } }>;
  }> = {}
) {
  return {
    id: 'post-1',
    title: '測試文章',
    slug: 'test-article',
    content: '# 測試內容\n\n這是正文',
    excerpt: '摘要內容',
    coverImage: '/uploads/cover.webp',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-15T10:00:00.000Z'),
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    category: { name: '技術' },
    tags: [
      { tag: { name: 'JavaScript' } },
      { tag: { name: 'TypeScript' } },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== exportPost =====
describe('exportPost', () => {
  it('應匯出含完整 front matter 的 Markdown', async () => {
    const post = mockPostWithRelations();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    // 驗證 front matter
    expect(result).toContain('---');
    expect(result).toContain('title: "測試文章"');
    expect(result).toContain('slug: "test-article"');
    expect(result).toContain('date: "2024-01-15T10:00:00.000Z"');
    expect(result).toContain('excerpt: "摘要內容"');
    expect(result).toContain('coverImage: "/uploads/cover.webp"');
    expect(result).toContain('category: "技術"');
    expect(result).toContain('status: "PUBLISHED"');

    // 驗證標籤
    expect(result).toMatch(/tags:/);
    expect(result).toContain('JavaScript');
    expect(result).toContain('TypeScript');

    // 驗證內容（在 front matter 之後）
    expect(result).toContain('# 測試內容');
    expect(result).toContain('這是正文');
  });

  it('應正確處理無分類的文章', async () => {
    const post = mockPostWithRelations({
      category: null,
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    expect(result).not.toContain('category:');
  });

  it('應正確處理無標籤的文章', async () => {
    const post = mockPostWithRelations({
      tags: [],
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    expect(result).not.toContain('tags:');
  });

  it('應正確處理無摘要的文章', async () => {
    const post = mockPostWithRelations({
      excerpt: null,
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    expect(result).not.toContain('excerpt:');
  });

  it('應正確處理無封面圖片的文章', async () => {
    const post = mockPostWithRelations({
      coverImage: null,
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    expect(result).not.toContain('coverImage:');
  });

  it('應正確處理無發佈日期的文章（DRAFT）', async () => {
    const post = mockPostWithRelations({
      status: 'DRAFT',
      publishedAt: null,
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await exportPost('post-1');

    expect(result).not.toContain('date:');
    expect(result).toContain('status: "DRAFT"');
  });

  it('文章不存在時應拋出錯誤', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(exportPost('nonexistent')).rejects.toThrow(
      'Post "nonexistent" not found'
    );
  });

  it('應呼叫 prisma 並 include 關聯資料', async () => {
    const post = mockPostWithRelations();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await exportPost('post-1');

    expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });
  });
});

// ===== exportPostsBatch =====
describe('exportPostsBatch', () => {
  it('應匯出多篇文章為 ZIP', async () => {
    const posts = [
      mockPostWithRelations({ id: 'post-1', slug: 'article-one' }),
      mockPostWithRelations({
        id: 'post-2',
        slug: 'article-two',
        title: '第二篇文章',
      }),
    ];
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);

    const buffer = await exportPostsBatch(['post-1', 'post-2']);

    // 驗證 ZIP 內容
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);

    expect(files).toHaveLength(2);
    expect(files).toContain('article-one.md');
    expect(files).toContain('article-two.md');

    // 驗證第一個檔案內容
    const content1 = await zip.files['article-one.md'].async('string');
    expect(content1).toContain('title: "測試文章"');
    expect(content1).toContain('# 測試內容');

    // 驗證第二個檔案內容
    const content2 = await zip.files['article-two.md'].async('string');
    expect(content2).toContain('title: "第二篇文章"');
  });

  it('空陣列應回傳空 ZIP', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);

    const buffer = await exportPostsBatch([]);

    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);

    expect(files).toHaveLength(0);
  });

  it('應呼叫 prisma 取得文章列表', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);

    await exportPostsBatch(['post-1', 'post-2']);

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['post-1', 'post-2'] } },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });
  });

  it('應處理重複 slug 的情況（加上 id 後綴）', async () => {
    const posts = [
      mockPostWithRelations({ id: 'post-1', slug: 'same-slug' }),
      mockPostWithRelations({ id: 'post-2', slug: 'same-slug', title: '第二篇' }),
    ];
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);

    const buffer = await exportPostsBatch(['post-1', 'post-2']);

    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);

    expect(files).toHaveLength(2);
    // 第一個用原始 slug，第二個加後綴
    expect(files).toContain('same-slug.md');
    expect(files.some((f) => f.startsWith('same-slug-') && f.endsWith('.md'))).toBe(true);
  });
});
