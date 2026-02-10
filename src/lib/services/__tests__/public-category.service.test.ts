import { getPublicCategories, getCategoryBySlug } from '@/lib/services/public-category.service';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('public-category.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicCategories', () => {
    const mockCategories = [
      {
        id: 'cat1',
        name: 'Backend',
        slug: 'backend',
        description: 'Backend Development',
        _count: { posts: 5 },
      },
      {
        id: 'cat2',
        name: 'Frontend',
        slug: 'frontend',
        description: 'Frontend Development',
        _count: { posts: 3 },
      },
      {
        id: 'cat3',
        name: 'DevOps',
        slug: 'devops',
        description: 'DevOps practices',
        _count: { posts: 0 },
      },
    ];

    it('應該返回所有分類列表，每個分類包含已發布文章數量', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getPublicCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: 'PUBLISHED' },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'cat1',
        name: 'Backend',
        slug: 'backend',
        description: 'Backend Development',
        postCount: 5,
      });
    });

    it('應該按名稱字母序排列分類', async () => {
      const unorderedCategories = [
        { id: 'cat2', name: 'Frontend', slug: 'frontend', description: '', _count: { posts: 3 } },
        { id: 'cat1', name: 'Backend', slug: 'backend', description: '', _count: { posts: 5 } },
      ];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(unorderedCategories);

      await getPublicCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('應該包含無已發布文章的分類（postCount 為 0）', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 'cat3', name: 'DevOps', slug: 'devops', description: '', _count: { posts: 0 } },
      ]);

      const result = await getPublicCategories();

      expect(result[0].postCount).toBe(0);
    });

    it('無任何分類時應該返回空陣列', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getPublicCategories();

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryBySlug', () => {
    const mockCategory = {
      id: 'cat1',
      name: 'Backend',
      slug: 'backend',
      description: 'Backend Development',
    };

    const mockPosts = [
      {
        id: 'post1',
        title: 'Post 1',
        slug: 'post-1',
        excerpt: 'Excerpt 1',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-03'),
        category: mockCategory,
        tags: [],
      },
      {
        id: 'post2',
        title: 'Post 2',
        slug: 'post-2',
        excerpt: 'Excerpt 2',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-02'),
        category: mockCategory,
        tags: [],
      },
    ];

    it('應該返回分類資訊及其下的已發布文章列表（分頁）', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      const result = await getCategoryBySlug('backend', { page: 1, limit: 10 });

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'backend' },
      });
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat1',
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        skip: 0,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
      expect(result).toEqual({
        category: mockCategory,
        posts: mockPosts,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('文章應該按 publishedAt 降序排列', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await getCategoryBySlug('backend', { page: 1, limit: 10 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { publishedAt: 'desc' },
        })
      );
    });

    it('應該支援分頁參數', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[1]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(10);

      const result = await getCategoryBySlug('backend', { page: 2, limit: 5 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5,
        })
      );
      expect(result?.currentPage).toBe(2);
      expect(result?.totalPages).toBe(2);
    });

    it('分類不存在時應該返回 null', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getCategoryBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('分類下無已發布文章時應該返回空陣列', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const result = await getCategoryBySlug('backend');

      expect(result?.posts).toEqual([]);
      expect(result?.total).toBe(0);
    });

    it('文章列表只包含 PUBLISHED 狀態的文章', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await getCategoryBySlug('backend');

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
          }),
        })
      );
    });
  });
});
