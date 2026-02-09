/**
 * @file SEO Meta API Route Handler 測試
 * @description 測試 /api/admin/seo/posts/[postId] 的 GET、PUT 處理
 *   - GET：取得文章 SEO 設定、無記錄時回傳空值、未認證回傳 401
 *   - PUT：建立/更新 SEO 設定（upsert）、欄位長度驗證、自動觸發評分計算
 *   - 認證檢查：未登入應回傳 401
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    seoMetadata: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
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

// Mock SEO score
jest.mock('@/lib/seo/score', () => ({
  calculateSeoScore: jest.fn().mockReturnValue({
    totalScore: 70,
    items: [],
    grade: '尚可',
  }),
}));

import { GET, PUT } from '@/app/api/admin/seo/posts/[postId]/route';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock Request */
function createRequest(
  method: string,
  body?: Record<string, unknown>
): Request {
  const options: RequestInit = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new Request('http://localhost:3000/api/admin/seo/posts/post-1', options);
}

/** Mock route context */
function createContext(postId: string = 'post-1') {
  return { params: Promise.resolve({ postId }) };
}

describe('GET /api/admin/seo/posts/[postId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET(createRequest('GET'), createContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('文章不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(createRequest('GET'), createContext());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Post not found');
  });

  it('文章存在但無 SEO 設定時應回傳空資料', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ id: 'post-1' });
    (mockPrisma.seoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(createRequest('GET'), createContext());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeNull();
  });

  it('有 SEO 設定時應回傳完整資料', async () => {
    const mockSeoData = {
      id: 'seo-1',
      postId: 'post-1',
      metaTitle: '測試標題',
      metaDescription: '測試描述',
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      twitterCard: 'summary_large_image',
      canonicalUrl: null,
      noIndex: false,
      noFollow: false,
      focusKeyword: 'Next.js',
      seoScore: 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ id: 'post-1' });
    (mockPrisma.seoMetadata.findUnique as jest.Mock).mockResolvedValue(mockSeoData);

    const response = await GET(createRequest('GET'), createContext());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metaTitle).toBe('測試標題');
    expect(data.data.focusKeyword).toBe('Next.js');
  });
});

describe('PUT /api/admin/seo/posts/[postId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await PUT(
      createRequest('PUT', { metaTitle: '標題' }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('文章不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await PUT(
      createRequest('PUT', { metaTitle: '標題' }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('應成功建立 SEO 設定（upsert）', async () => {
    const mockPost = {
      id: 'post-1',
      title: '測試文章',
      content: '文章內容',
    };
    const mockUpsertResult = {
      id: 'seo-1',
      postId: 'post-1',
      metaTitle: '新標題',
      metaDescription: '新描述',
      seoScore: 70,
    };

    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.seoMetadata.upsert as jest.Mock).mockResolvedValue(mockUpsertResult);

    const response = await PUT(
      createRequest('PUT', {
        metaTitle: '新標題',
        metaDescription: '新描述',
      }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.seoMetadata.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { postId: 'post-1' },
      })
    );
  });

  it('metaTitle 超過 70 字元應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ id: 'post-1' });

    const response = await PUT(
      createRequest('PUT', {
        metaTitle: 'A'.repeat(71),
      }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
  });

  it('metaDescription 超過 160 字元應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ id: 'post-1' });

    const response = await PUT(
      createRequest('PUT', {
        metaDescription: 'B'.repeat(161),
      }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('ogImage 無效 URL 應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ id: 'post-1' });

    const response = await PUT(
      createRequest('PUT', {
        ogImage: 'not-a-url',
      }),
      createContext()
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('應在儲存時計算 SEO 評分', async () => {
    const { calculateSeoScore } = require('@/lib/seo/score');

    const mockPost = {
      id: 'post-1',
      title: '測試文章',
      content: '文章內容',
    };
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.seoMetadata.upsert as jest.Mock).mockResolvedValue({ id: 'seo-1' });

    await PUT(
      createRequest('PUT', {
        metaTitle: '新標題',
        focusKeyword: 'Next.js',
      }),
      createContext()
    );

    expect(calculateSeoScore).toHaveBeenCalled();
  });
});
