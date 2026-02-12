/**
 * 搜尋 API 測試
 * GET /api/search
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';

// Mock Prisma
const mockPrisma = {
  post: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe('GET /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功搜尋', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: '使用 Next.js 建立部落格',
        slug: 'nextjs-blog',
        excerpt: '介紹如何使用 Next.js 建立現代化部落格',
        publishedAt: new Date('2025-01-01'),
        category: { id: 'cat-1', name: '技術', slug: 'tech' },
        tags: [
          { tag: { id: 'tag-1', name: 'Next.js', slug: 'nextjs' } },
        ],
      },
      {
        id: 'post-2',
        title: 'Next.js 16 新特性',
        slug: 'nextjs-16-features',
        excerpt: 'Next.js 16 帶來的新功能與改進',
        publishedAt: new Date('2025-01-02'),
        category: { id: 'cat-1', name: '技術', slug: 'tech' },
        tags: [],
      },
    ];

    it('應該返回匹配的文章列表', async () => {
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/search?q=Next.js');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Next.js'),
            slug: 'nextjs-blog',
          }),
        ]),
        pagination: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          perPage: 10,
        },
      });
    });

    it('應該對標題中的關鍵字高亮', async () => {
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/search?q=Next.js');
      const response = await GET(request);
      const data = await response.json();

      expect(data.results[0].title).toContain('<mark>');
      expect(data.results[0].title).toContain('</mark>');
    });

    it('應該對摘要中的關鍵字高亮', async () => {
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/search?q=Next.js');
      const response = await GET(request);
      const data = await response.json();

      expect(data.results[0].excerpt).toContain('<mark>');
    });

    it('應該支援分頁', async () => {
      mockPrisma.post.findMany.mockResolvedValue([mockPosts[1]]);
      mockPrisma.post.count.mockResolvedValue(15);

      const request = new NextRequest('http://localhost:3000/api/search?q=Next.js&page=2');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toMatchObject({
        total: 15,
        totalPages: 2,
        currentPage: 2,
        perPage: 10,
      });
      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('應該只搜尋 PUBLISHED 狀態的文章', async () => {
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      await GET(request);

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
          }),
        })
      );
    });

    it('應該按 publishedAt 降序排列', async () => {
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      await GET(request);

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { publishedAt: 'desc' },
        })
      );
    });
  });

  describe('錯誤處理', () => {
    it('應該在缺少 q 參數時返回 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('搜尋關鍵字為必填');
    });

    it('應該在 q 為空字串時返回 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('搜尋關鍵字為必填');
    });

    it('應該在無符合結果時返回空陣列', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/search?q=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.pagination).toMatchObject({
        total: 0,
        totalPages: 0,
      });
    });

    it('應該在分頁超出範圍時返回空陣列', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(5);

      const request = new NextRequest('http://localhost:3000/api/search?q=test&page=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.pagination.totalPages).toBe(1);
    });
  });

  describe('安全性', () => {
    it('不應該暴露敏感欄位', async () => {
      mockPrisma.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'Test excerpt',
          authorId: 'author-123',
          content: 'Full content',
          publishedAt: new Date(),
          category: { id: 'cat-1', name: 'Test', slug: 'test' },
          tags: [],
        },
      ]);
      mockPrisma.post.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.results[0]).not.toHaveProperty('authorId');
      expect(data.results[0]).not.toHaveProperty('content');
    });
  });
});
