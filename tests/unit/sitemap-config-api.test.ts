/**
 * @file Sitemap 設定 API 整合測試
 * @description 測試 /api/admin/seo/sitemap-config 的 GET/PUT
 *   - GET：取得所有 sitemap 設定
 *   - PUT：更新 sitemap 設定（upsert）
 *   - priority 範圍驗證（0.0-1.0）
 *   - 未認證回傳 401
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    sitemapConfig: {
      findMany: jest.fn(),
      upsert: jest.fn(),
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

import { GET, PUT } from '@/app/api/admin/seo/sitemap-config/route';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('GET /api/admin/seo/sitemap-config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('應回傳所有 sitemap 設定', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.sitemapConfig.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'config-1',
        path: '/posts/*',
        changefreq: 'weekly',
        priority: 0.8,
        enabled: true,
      },
      {
        id: 'config-2',
        path: '/categories/*',
        changefreq: 'monthly',
        priority: 0.6,
        enabled: true,
      },
    ]);

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].path).toBe('/posts/*');
  });

  it('無設定時應回傳空陣列', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.sitemapConfig.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });
});

describe('PUT /api/admin/seo/sitemap-config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ path: '/posts/*', changefreq: 'weekly', priority: 0.8 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('應成功更新 sitemap 設定', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    const mockConfig = {
      id: 'config-1',
      path: '/posts/*',
      changefreq: 'daily',
      priority: 0.9,
      enabled: true,
    };
    (mockPrisma.sitemapConfig.upsert as jest.Mock).mockResolvedValue(mockConfig);

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ path: '/posts/*', changefreq: 'daily', priority: 0.9 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.changefreq).toBe('daily');
    expect(data.data.priority).toBe(0.9);
  });

  it('priority 超出範圍應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ path: '/posts/*', changefreq: 'weekly', priority: 1.5 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('priority 為負數應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ path: '/posts/*', changefreq: 'weekly', priority: -0.1 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it('缺少 path 應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ changefreq: 'weekly', priority: 0.5 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it('無效的 changefreq 應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const request = new Request('http://localhost:3000/api/admin/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify({ path: '/posts/*', changefreq: 'invalid', priority: 0.5 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});
