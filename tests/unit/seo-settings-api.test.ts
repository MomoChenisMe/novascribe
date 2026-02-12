/**
 * @file SEO 設定 API 整合測試
 * @description 測試 /api/admin/seo/settings 的 GET/PUT
 *   - GET：取得全站 SEO 設定
 *   - PUT：更新全站 SEO 設定
 *   - 未認證回傳 401
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    siteSetting: {
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

import { GET, PUT } from '@/app/api/admin/seo/settings/route';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('GET /api/admin/seo/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/seo/settings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('應回傳所有 SEO 設定', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.siteSetting.findMany as jest.Mock).mockResolvedValue([
      { key: 'seo.default_title', value: 'My Blog' },
      { key: 'seo.default_description', value: 'A great blog' },
      { key: 'seo.og_image', value: 'https://example.com/og.jpg' },
    ]);

    const request = new Request('http://localhost:3000/api/admin/seo/settings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      'seo.default_title': 'My Blog',
      'seo.default_description': 'A great blog',
      'seo.og_image': 'https://example.com/og.jpg',
      'seo.twitter_handle': null,
      'seo.robots_custom_rules': null,
      'seo.ga4_id': null,
      'seo.gsc_verification': null,
    });
  });

  it('無設定時應回傳全 null', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.siteSetting.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/admin/seo/settings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data['seo.default_title']).toBeNull();
    expect(data.data['seo.default_description']).toBeNull();
  });
});

describe('PUT /api/admin/seo/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/seo/settings', {
      method: 'PUT',
      body: JSON.stringify({ 'seo.default_title': 'New Title' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('應成功更新設定', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.siteSetting.upsert as jest.Mock).mockImplementation(
      ({ where }) => Promise.resolve({ key: where.key, value: 'updated' })
    );

    const request = new Request('http://localhost:3000/api/admin/seo/settings', {
      method: 'PUT',
      body: JSON.stringify({
        'seo.default_title': 'New Title',
        'seo.default_description': 'New Description',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledTimes(2);
  });

  it('應過濾非 seo.* 開頭的鍵名', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.siteSetting.upsert as jest.Mock).mockResolvedValue({});

    const request = new Request('http://localhost:3000/api/admin/seo/settings', {
      method: 'PUT',
      body: JSON.stringify({
        'seo.default_title': 'Title',
        'invalid.key': 'Should be filtered',
        'another_bad_key': 'Also filtered',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);

    // 只應更新 seo.* 開頭的鍵
    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'seo.default_title' },
      })
    );
  });

  it('空物件應成功但不執行任何 upsert', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const request = new Request('http://localhost:3000/api/admin/seo/settings', {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it('應支援更新所有 SEO 設定欄位', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    (mockPrisma.siteSetting.upsert as jest.Mock).mockResolvedValue({});

    const request = new Request('http://localhost:3000/api/admin/seo/settings', {
      method: 'PUT',
      body: JSON.stringify({
        'seo.default_title': 'Title',
        'seo.default_description': 'Desc',
        'seo.og_image': 'https://example.com/og.jpg',
        'seo.twitter_handle': '@momo',
        'seo.robots_custom_rules': 'User-agent: *\nDisallow: /tmp/',
        'seo.ga4_id': 'G-XXXXXXXXXX',
        'seo.gsc_verification': 'verification-code',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledTimes(7);
  });
});
