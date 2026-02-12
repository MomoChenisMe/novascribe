/**
 * 分類 Feed 測試
 * GET /feed/[category].xml
 */

jest.mock('feed');

// Mock Prisma
const mockPrisma = {
  category: {
    findUnique: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock Markdown 渲染
jest.mock('@/lib/markdown', () => ({
  renderMarkdown: jest.fn((content: string) => `<p>${content}</p>`),
}));

import { GET } from '@/app/feed/[category]/route';

describe('GET /feed/[category].xml', () => {
  const mockCategory = {
    id: 'cat-1',
    name: '技術',
    slug: 'tech',
    description: '技術相關文章',
  };

  const mockPosts = [
    {
      id: 'post-1',
      title: '技術文章 1',
      slug: 'tech-post-1',
      excerpt: '技術文章摘要',
      content: '# 技術內容',
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      categoryId: 'cat-1',
      category: mockCategory,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該返回分類的 RSS Feed', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET(
      new Request('http://localhost:3000/feed/tech.xml'),
      { params: Promise.resolve({ category: 'tech' }) }
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
    expect(text).toContain('<rss version="2.0"');
  });

  it('應該包含分類名稱在 Feed 標題中', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET(
      new Request('http://localhost:3000/feed/tech.xml'),
      { params: Promise.resolve({ category: 'tech' }) }
    );
    const text = await response.text();

    expect(text).toContain('技術');
  });

  it('應該只包含該分類的文章', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    await GET(
      new Request('http://localhost:3000/feed/tech.xml'),
      { params: Promise.resolve({ category: 'tech' }) }
    );

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 'cat-1',
          status: 'PUBLISHED',
        }),
      })
    );
  });

  it('分類不存在時應該返回 404', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost:3000/feed/nonexistent.xml'),
      { params: Promise.resolve({ category: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('分類存在但無文章時應該返回空的有效 Feed', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.post.findMany.mockResolvedValue([]);

    const response = await GET(
      new Request('http://localhost:3000/feed/tech.xml'),
      { params: Promise.resolve({ category: 'tech' }) }
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('<rss version="2.0"');
    expect(text).toContain('<channel>');
  });

  it('應該按 publishedAt 降序排列', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    await GET(
      new Request('http://localhost:3000/feed/tech.xml'),
      { params: Promise.resolve({ category: 'tech' }) }
    );

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { publishedAt: 'desc' },
      })
    );
  });
});
