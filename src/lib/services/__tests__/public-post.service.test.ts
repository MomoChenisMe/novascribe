import { getPublishedPosts, getPostBySlug, getRelatedPosts } from '@/lib/services/public-post.service';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('public-post.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublishedPosts', () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post 1',
        slug: 'test-post-1',
        excerpt: 'Excerpt 1',
        content: 'Content 1',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-01'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
        tags: [{ tag: { id: 'tag1', name: 'TypeScript', slug: 'typescript' } }],
      },
      {
        id: '2',
        title: 'Test Post 2',
        slug: 'test-post-2',
        excerpt: 'Excerpt 2',
        content: 'Content 2',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-02'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
        tags: [],
      },
    ];

    it('應該返回已發布的文章列表（預設分頁）', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      const result = await getPublishedPosts({});

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        skip: 0,
        include: {
          category: true,
          tags: { include: { tag: true } },
          seoMetadata: true,
        },
      });
      expect(result.posts).toEqual(mockPosts);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('應該支援分頁參數', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[1]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      const result = await getPublishedPosts({ page: 2, limit: 1 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          skip: 1,
        })
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(1);
    });

    it('應該支援依分類篩選', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      await getPublishedPosts({ categorySlug: 'tech' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'PUBLISHED',
            category: { slug: 'tech' },
          },
        })
      );
    });

    it('應該支援依標籤篩選', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      await getPublishedPosts({ tagSlug: 'typescript' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'PUBLISHED',
            tags: { some: { tag: { slug: 'typescript' } } },
          },
        })
      );
    });
  });

  describe('getPostBySlug', () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'Excerpt',
      content: 'Content',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-01'),
      category: { id: 'cat1', name: 'Tech', slug: 'tech' },
      tags: [{ tag: { id: 'tag1', name: 'TypeScript', slug: 'typescript' } }],
      seoMetadata: { metaTitle: 'SEO Title' },
    };

    it('應該依 slug 返回單篇文章', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await getPostBySlug('test-post');

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-post' },
        include: {
          category: true,
          tags: { include: { tag: true } },
          seoMetadata: true,
        },
      });
      expect(result).toEqual(mockPost);
    });

    it('slug 不存在時應該返回 null', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getPostBySlug('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('getRelatedPosts', () => {
    const mockRelatedPosts = [
      {
        id: '2',
        title: 'Related Post 1',
        slug: 'related-post-1',
        excerpt: 'Excerpt',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-02'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
      },
      {
        id: '3',
        title: 'Related Post 2',
        slug: 'related-post-2',
        excerpt: 'Excerpt',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-03'),
        category: { id: 'cat1', name: 'Tech', slug: 'tech' },
      },
    ];

    it('應該依分類返回相關文章（排除自己）', async () => {
      const currentPost = {
        id: '1',
        categoryId: 'cat1',
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(currentPost);
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockRelatedPosts);

      const result = await getRelatedPosts('1', 3);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PUBLISHED',
          categoryId: 'cat1',
          id: { not: '1' },
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        include: {
          category: true,
        },
      });
      expect(result).toEqual(mockRelatedPosts);
    });

    it('文章無分類時應該返回空陣列', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: '1', categoryId: null });

      const result = await getRelatedPosts('1');

      expect(result).toEqual([]);
    });
  });
});
