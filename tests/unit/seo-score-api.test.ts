/**
 * @file SEO Score API Route Handler 測試
 * @description 測試 /api/admin/seo/score/[postId] 的 GET 處理
 *   - GET：回傳總分與各項目明細
 *   - 未認證回傳 401
 *   - 文章不存在回傳 404
 *   - 無 SEO 設定時仍計算評分（基於文章內容）
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
    },
    seoMetadata: {
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

import { GET } from '@/app/api/admin/seo/score/[postId]/route';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock Request */
function createRequest(): Request {
  return new Request('http://localhost:3000/api/admin/seo/score/post-1', {
    method: 'GET',
  });
}

/** Mock route context */
function createContext(postId: string = 'post-1') {
  return { params: Promise.resolve({ postId }) };
}

describe('GET /api/admin/seo/score/[postId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('文章不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('無 SEO 設定時應回傳基於內容的評分', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 'post-1',
      title: '測試文章',
      content: '短內容',
    });
    (mockPrisma.seoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalScore).toBeDefined();
    expect(data.data.items).toHaveLength(10);
    expect(data.data.grade).toBeDefined();
    expect(data.data.maxScore).toBe(100);
  });

  it('有完整 SEO 設定時應回傳高分', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 'post-1',
      title: '學習 Next.js 的完整指南',
      content: `${'C'.repeat(800)}\n\n## 第一章\n\n### 第二章\n\n這是關於 next.js 的文章。\n\n[內部連結](/posts/test)\n\n[外部連結](https://example.com)\n`,
    });
    (mockPrisma.seoMetadata.findUnique as jest.Mock).mockResolvedValue({
      metaTitle: 'A'.repeat(60),
      metaDescription: 'B'.repeat(140),
      focusKeyword: 'next.js',
      ogImage: 'https://example.com/og.jpg',
    });

    const response = await GET(createRequest(), createContext());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalScore).toBeGreaterThanOrEqual(80);
    expect(data.data.grade).toBe('優良');
  });

  it('各項目明細應包含 name、score、maxScore、description、passed', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 'post-1',
      title: '測試',
      content: '內容',
    });
    (mockPrisma.seoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());
    const data = await response.json();

    for (const item of data.data.items) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('maxScore');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('passed');
    }
  });
});
