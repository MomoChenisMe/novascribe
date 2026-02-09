/**
 * @file SEO 儀表板 API Route Handler 測試
 * @description 測試 GET /api/admin/seo/dashboard
 *   - 認證檢查
 *   - 概覽數據（平均評分、完整 SEO 文章數、缺少 meta 文章數）
 *   - 缺少 SEO 清單
 *   - 改善建議
 *   - 所有完善時的回應
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
    },
  },
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { GET } from '@/app/api/admin/seo/dashboard/route';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.Mock;
const mockPostFindMany = prisma.post.findMany as jest.Mock;

describe('GET /api/admin/seo/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證時應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Unauthorized');
  });

  it('應回傳概覽數據', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    mockPostFindMany.mockResolvedValue([
      {
        id: '1',
        title: 'Post 1',
        content: 'x'.repeat(600),
        slug: 'post-1',
        seoMetadata: {
          metaTitle: 'Post 1 Title',
          metaDescription: 'Post 1 description that is long enough for SEO',
          ogImage: '/og.jpg',
          focusKeyword: 'test',
          seoScore: 85,
        },
      },
      {
        id: '2',
        title: 'Post 2',
        content: 'Short content',
        slug: 'post-2',
        seoMetadata: {
          metaTitle: 'Post 2 Title',
          metaDescription: null,
          ogImage: null,
          focusKeyword: null,
          seoScore: 45,
        },
      },
      {
        id: '3',
        title: 'Post 3',
        content: 'x'.repeat(600),
        slug: 'post-3',
        seoMetadata: null,
      },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.overview.totalPosts).toBe(3);
    expect(json.data.overview.averageScore).toBe(65); // (85 + 45) / 2
    expect(json.data.overview.completeSeoCount).toBe(1); // Only Post 1 (85 >= 80)
    expect(json.data.overview.missingMetaCount).toBe(2); // Post 2 (no desc) + Post 3 (no seo)
  });

  it('應回傳缺少 SEO 的文章清單', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    mockPostFindMany.mockResolvedValue([
      {
        id: '1',
        title: 'Missing Meta Post',
        content: 'Content',
        slug: 'missing-meta',
        seoMetadata: null,
      },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(json.data.missingMetaPosts).toHaveLength(1);
    expect(json.data.missingMetaPosts[0].id).toBe('1');
    expect(json.data.missingMetaPosts[0].title).toBe('Missing Meta Post');
    expect(json.data.missingMetaPosts[0].hasTitle).toBe(false);
    expect(json.data.missingMetaPosts[0].hasDescription).toBe(false);
  });

  it('應回傳改善建議', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    mockPostFindMany.mockResolvedValue([
      {
        id: '1',
        title: 'No SEO',
        content: 'Short',
        slug: 'no-seo',
        seoMetadata: null,
      },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(json.data.suggestions.length).toBeGreaterThan(0);
    // Should have meta_title_missing suggestion
    expect(json.data.suggestions.some(
      (s: { rule: string }) => s.rule === 'meta_title_missing'
    )).toBe(true);
  });

  it('所有文章 SEO 完善時概覽數據應正確', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    mockPostFindMany.mockResolvedValue([
      {
        id: '1',
        title: 'Perfect Post',
        content: 'x'.repeat(1000),
        slug: 'perfect',
        seoMetadata: {
          metaTitle: 'A perfectly crafted meta title for SEO optimization',
          metaDescription: 'A meta description that is exactly the right length for search engine optimization and provides users with a clear understanding of the page content.',
          ogImage: '/og.jpg',
          focusKeyword: 'seo',
          seoScore: 95,
        },
      },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(json.data.overview.missingMetaCount).toBe(0);
    expect(json.data.overview.completeSeoCount).toBe(1);
    expect(json.data.missingMetaPosts).toHaveLength(0);
  });

  it('無文章時應回傳零值', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    mockPostFindMany.mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(json.data.overview.totalPosts).toBe(0);
    expect(json.data.overview.averageScore).toBe(0);
    expect(json.data.overview.completeSeoCount).toBe(0);
    expect(json.data.overview.missingMetaCount).toBe(0);
    expect(json.data.missingMetaPosts).toHaveLength(0);
    expect(json.data.suggestions).toHaveLength(0);
  });

  it('建議最多回傳 20 條', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    // Create 10 posts with no SEO — each generates ~4 suggestions = 40 total
    const posts = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      title: `Post ${i}`,
      content: 'Short',
      slug: `post-${i}`,
      seoMetadata: null,
    }));

    mockPostFindMany.mockResolvedValue(posts);

    const response = await GET();
    const json = await response.json();

    expect(json.data.suggestions.length).toBeLessThanOrEqual(20);
  });
});
