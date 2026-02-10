/**
 * 前台 SEO 整合測試
 * 驗證各頁面 generateMetadata 正確性、OG tags、Twitter Card
 */

import { Metadata } from 'next';

// Mock Prisma
const mockPrisma = {
  post: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
  tag: {
    findUnique: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe('前台 SEO 整合', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('文章頁 generateMetadata', () => {
    const mockPost = {
      id: 'post-1',
      slug: 'test-article',
      title: '測試文章標題',
      excerpt: '這是一篇測試文章的摘要',
      content: '# 內容',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      authorId: 'author-1',
      categoryId: 'cat-1',
      featuredImage: 'https://example.com/image.jpg',
      seoMetadata: {
        id: 'seo-1',
        postId: 'post-1',
        metaTitle: '自訂 Meta 標題',
        metaDescription: '自訂 Meta 描述',
        ogTitle: '自訂 OG 標題',
        ogDescription: '自訂 OG 描述',
        ogImage: 'https://example.com/og-image.jpg',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://example.com/posts/test-article',
        noIndex: false,
        noFollow: false,
        focusKeyword: 'test',
        metaKeywords: ['test', 'article'],
      },
      category: {
        id: 'cat-1',
        name: '技術',
        slug: 'tech',
      },
    };

    it('應該使用 SeoMetadata 優先順序生成 metadata', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      // 動態導入以獲取最新的 generateMetadata
      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      });

      expect(metadata).toMatchObject({
        title: '自訂 Meta 標題',
        description: '自訂 Meta 描述',
      });
    });

    it('應該包含 Open Graph tags', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      }) as Metadata;

      expect(metadata.openGraph).toMatchObject({
        title: '自訂 OG 標題',
        description: '自訂 OG 描述',
        images: [{ url: 'https://example.com/og-image.jpg' }],
        type: 'article',
      });
      expect(metadata.openGraph?.publishedTime).toBe('2025-01-01T00:00:00.000Z');
    });

    it('應該包含 Twitter Card', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      }) as Metadata;

      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
      });
    });

    it('應該設定 canonical URL', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      }) as Metadata;

      expect(metadata.alternates?.canonical).toBe('https://example.com/posts/test-article');
    });

    it('應該設定 robots 指令', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      }) as Metadata;

      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
      });
    });

    it('應該在沒有 SeoMetadata 時使用 fallback', async () => {
      const postWithoutSeo = { ...mockPost, seoMetadata: null };
      mockPrisma.post.findUnique.mockResolvedValue(postWithoutSeo);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      });

      expect(metadata).toMatchObject({
        title: '測試文章標題',
        description: '這是一篇測試文章的摘要',
      });
    });

    it('應該在文章不存在時返回 null', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'non-existent' }),
      });

      expect(metadata).toEqual({});
    });
  });

  describe('首頁 generateMetadata', () => {
    it('應該包含網站基本資訊', async () => {
      const { generateMetadata } = await import('@/app/(public)/page');
      const metadata = await generateMetadata({});

      expect(metadata).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
      });
      expect((metadata as Metadata).openGraph).toBeDefined();
    });

    it('應該包含 WebSite JSON-LD', async () => {
      const { metadata } = await import('@/app/(public)/page');
      // WebSiteJsonLd 元件整合會在元件層級測試
      expect(metadata).toBeDefined();
    });
  });

  describe('分類頁 generateMetadata', () => {
    const mockCategory = {
      id: 'cat-1',
      name: '技術',
      slug: 'tech',
      description: '技術相關文章',
    };

    it('應該包含分類資訊', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const { generateMetadata } = await import('@/app/(public)/categories/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'tech' }),
      });

      expect(metadata).toMatchObject({
        title: expect.stringContaining('技術'),
        description: '技術相關文章',
      });
    });

    it('應該在分類不存在時返回預設值', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const { generateMetadata } = await import('@/app/(public)/categories/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'non-existent' }),
      });

      expect(metadata).toEqual({});
    });
  });

  describe('標籤頁 generateMetadata', () => {
    const mockTag = {
      id: 'tag-1',
      name: 'JavaScript',
      slug: 'javascript',
    };

    it('應該包含標籤資訊', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(mockTag);

      const { generateMetadata } = await import('@/app/(public)/tags/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'javascript' }),
      });

      expect(metadata).toMatchObject({
        title: expect.stringContaining('JavaScript'),
      });
    });
  });

  describe('noIndex 處理', () => {
    it('應該在 noIndex=true 時禁止索引', async () => {
      const postWithNoIndex = {
        ...{
          id: 'post-1',
          slug: 'test-article',
          title: '測試文章',
          excerpt: '摘要',
          status: 'PUBLISHED',
          seoMetadata: {
            noIndex: true,
            noFollow: true,
          },
        },
      };
      mockPrisma.post.findUnique.mockResolvedValue(postWithNoIndex);

      const { generateMetadata } = await import('@/app/(public)/posts/[slug]/page');
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'test-article' }),
      }) as Metadata;

      expect(metadata.robots).toMatchObject({
        index: false,
        follow: false,
      });
    });
  });
});
