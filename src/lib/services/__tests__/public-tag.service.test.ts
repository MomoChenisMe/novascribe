import { getPublicTags, getTagBySlug } from '@/lib/services/public-tag.service';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('public-tag.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicTags', () => {
    const mockTags = [
      {
        id: 'tag1',
        name: 'TypeScript',
        slug: 'typescript',
        _count: { posts: 10 },
      },
      {
        id: 'tag2',
        name: 'React',
        slug: 'react',
        _count: { posts: 8 },
      },
      {
        id: 'tag3',
        name: 'Node.js',
        slug: 'nodejs',
        _count: { posts: 0 },
      },
    ];

    it('應該返回所有標籤列表，每個標籤包含已發布文章數量', async () => {
      (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await getPublicTags();

      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { posts: { _count: 'desc' } },
        include: {
          _count: {
            select: {
              posts: {
                where: { post: { status: 'PUBLISHED' } },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'tag1',
        name: 'TypeScript',
        slug: 'typescript',
        postCount: 10,
      });
    });

    it('應該按 postCount 降序排列標籤', async () => {
      const unorderedTags = [
        { id: 'tag2', name: 'React', slug: 'react', _count: { posts: 8 } },
        { id: 'tag1', name: 'TypeScript', slug: 'typescript', _count: { posts: 10 } },
      ];
      (prisma.tag.findMany as jest.Mock).mockResolvedValue(unorderedTags);

      await getPublicTags();

      expect(prisma.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { posts: { _count: 'desc' } },
        })
      );
    });

    it('應該包含無已發布文章的標籤（postCount 為 0）', async () => {
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: 'tag3', name: 'Node.js', slug: 'nodejs', _count: { posts: 0 } },
      ]);

      const result = await getPublicTags();

      expect(result[0].postCount).toBe(0);
    });

    it('無任何標籤時應該返回空陣列', async () => {
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getPublicTags();

      expect(result).toEqual([]);
    });
  });

  describe('getTagBySlug', () => {
    const mockTag = {
      id: 'tag1',
      name: 'TypeScript',
      slug: 'typescript',
    };

    const mockPosts = [
      {
        id: 'post1',
        title: 'Post 1',
        slug: 'post-1',
        excerpt: 'Excerpt 1',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-03'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
        tags: [{ tag: mockTag }],
      },
      {
        id: 'post2',
        title: 'Post 2',
        slug: 'post-2',
        excerpt: 'Excerpt 2',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-02'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
        tags: [{ tag: mockTag }],
      },
    ];

    it('應該返回標籤資訊及其關聯的已發布文章列表（分頁）', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      const result = await getTagBySlug('typescript', { page: 1, limit: 10 });

      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { slug: 'typescript' },
      });
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          tags: { some: { tagId: 'tag1' } },
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
        tag: mockTag,
        posts: mockPosts,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('文章應該按 publishedAt 降序排列', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await getTagBySlug('typescript', { page: 1, limit: 10 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { publishedAt: 'desc' },
        })
      );
    });

    it('應該支援分頁參數', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[1]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(10);

      const result = await getTagBySlug('typescript', { page: 2, limit: 5 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5,
        })
      );
      expect(result?.currentPage).toBe(2);
      expect(result?.totalPages).toBe(2);
    });

    it('標籤不存在時應該返回 null', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getTagBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('標籤下無已發布文章時應該返回空陣列', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const result = await getTagBySlug('typescript');

      expect(result?.posts).toEqual([]);
      expect(result?.total).toBe(0);
    });

    it('文章列表只包含 PUBLISHED 狀態的文章', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await getTagBySlug('typescript');

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
