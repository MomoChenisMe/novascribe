/**
 * @file Sitemap 動態生成整合測試
 * @description 測試 src/app/sitemap.ts 的動態 Sitemap 生成
 *   - 包含已發佈文章（PUBLISHED）
 *   - 排除草稿/下架/noIndex 文章
 *   - 包含分類和標籤頁
 *   - 空白部落格情境
 *
 * @jest-environment node
 */

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
    sitemapConfig: {
      findMany: jest.fn(),
    },
    seoMetadata: {
      findMany: jest.fn(),
    },
  },
}));

import sitemap from '@/app/sitemap';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('sitemap()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://blog.example.com';
    (mockPrisma.sitemapConfig.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.seoMetadata.findMany as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('應包含首頁', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    const result = await sitemap();

    const homeEntry = result.find(
      (entry) => entry.url === 'https://blog.example.com'
    );
    expect(homeEntry).toBeDefined();
    expect(homeEntry!.priority).toBe(1.0);
    expect(homeEntry!.changeFrequency).toBe('daily');
  });

  it('應包含已發佈文章', async () => {
    const publishedDate = new Date('2025-01-15');
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'post-1',
        slug: 'hello-world',
        updatedAt: publishedDate,
        status: 'PUBLISHED',
      },
      {
        id: 'post-2',
        slug: 'second-post',
        updatedAt: publishedDate,
        status: 'PUBLISHED',
      },
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    const result = await sitemap();

    const postEntries = result.filter((entry) =>
      entry.url.includes('/posts/')
    );
    expect(postEntries).toHaveLength(2);
    expect(postEntries[0].url).toBe(
      'https://blog.example.com/posts/hello-world'
    );
    expect(postEntries[1].url).toBe(
      'https://blog.example.com/posts/second-post'
    );
    expect(postEntries[0].changeFrequency).toBe('weekly');
    expect(postEntries[0].priority).toBe(0.8);
  });

  it('應排除草稿和下架文章（query 條件只包含 PUBLISHED）', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'post-1',
        slug: 'published-post',
        updatedAt: new Date(),
        status: 'PUBLISHED',
      },
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    await sitemap();

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PUBLISHED',
        }),
      })
    );
  });

  it('應排除 noIndex 文章', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'post-1',
        slug: 'visible-post',
        updatedAt: new Date(),
        status: 'PUBLISHED',
      },
      {
        id: 'post-2',
        slug: 'hidden-post',
        updatedAt: new Date(),
        status: 'PUBLISHED',
      },
    ]);
    (mockPrisma.seoMetadata.findMany as jest.Mock).mockResolvedValue([
      { postId: 'post-2', noIndex: true },
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    const result = await sitemap();

    const postEntries = result.filter((entry) =>
      entry.url.includes('/posts/')
    );
    expect(postEntries).toHaveLength(1);
    expect(postEntries[0].url).toContain('visible-post');
    expect(postEntries.find((e) => e.url.includes('hidden-post'))).toBeUndefined();
  });

  it('應包含分類頁', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { slug: 'tech', updatedAt: new Date('2025-01-10') },
      { slug: 'life', updatedAt: new Date('2025-01-12') },
    ]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    const result = await sitemap();

    const categoryEntries = result.filter((entry) =>
      entry.url.includes('/categories/')
    );
    expect(categoryEntries).toHaveLength(2);
    expect(categoryEntries[0].url).toBe(
      'https://blog.example.com/categories/tech'
    );
    expect(categoryEntries[1].url).toBe(
      'https://blog.example.com/categories/life'
    );
    expect(categoryEntries[0].changeFrequency).toBe('weekly');
    expect(categoryEntries[0].priority).toBe(0.6);
  });

  it('應包含標籤頁', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([
      { slug: 'nextjs', updatedAt: new Date('2025-01-08') },
      { slug: 'react', updatedAt: new Date('2025-01-09') },
    ]);

    const result = await sitemap();

    const tagEntries = result.filter((entry) =>
      entry.url.includes('/tags/')
    );
    expect(tagEntries).toHaveLength(2);
    expect(tagEntries[0].url).toBe('https://blog.example.com/tags/nextjs');
    expect(tagEntries[1].url).toBe('https://blog.example.com/tags/react');
    expect(tagEntries[0].changeFrequency).toBe('weekly');
    expect(tagEntries[0].priority).toBe(0.5);
  });

  it('空白部落格應只包含首頁', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);

    const result = await sitemap();

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://blog.example.com');
  });
});
