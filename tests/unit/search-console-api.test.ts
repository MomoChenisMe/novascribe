/**
 * @file Search Console 效能 API Route Handler 測試
 * @description 測試 GET /api/admin/search-console/performance
 *   - 認證檢查
 *   - GSC 未設定時的回應
 *   - 正常取得數據
 *   - 支援 dimension query 參數
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock Search Console
jest.mock('@/lib/search-console', () => ({
  getSearchPerformance: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/search-console/performance/route';
import { getSearchPerformance } from '@/lib/search-console';

const mockGetServerSession = getServerSession as jest.Mock;
const mockGetSearchPerformance = getSearchPerformance as jest.Mock;

function createRequest(queryString = '') {
  return new NextRequest(
    new URL(`http://localhost/api/admin/search-console/performance${queryString}`)
  );
}

describe('GET /api/admin/search-console/performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GSC_SITE_URL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  });

  it('未認證時應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET(createRequest());
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('GSC 未設定時應回傳 configured: false', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    const response = await GET(createRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.configured).toBe(false);
  });

  it('正常取得效能數據', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GSC_SITE_URL = 'https://example.com';

    const mockData = {
      rows: [
        { keys: ['nextjs'], clicks: 50, impressions: 500, ctr: 0.1, position: 5 },
      ],
      totals: { clicks: 50, impressions: 500, ctr: 0.1, position: 5 },
    };
    mockGetSearchPerformance.mockResolvedValue(mockData);

    const response = await GET(createRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockData);
    expect(json.configured).toBe(true);
  });

  it('應傳遞 dimension 參數', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GSC_SITE_URL = 'https://example.com';

    mockGetSearchPerformance.mockResolvedValue({ rows: [], totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 } });

    await GET(createRequest('?dimension=page'));

    expect(mockGetSearchPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: ['page'],
      }),
      expect.any(Object)
    );
  });

  it('無效的 dimension 應預設為 query', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GSC_SITE_URL = 'https://example.com';

    mockGetSearchPerformance.mockResolvedValue({ rows: [], totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 } });

    await GET(createRequest('?dimension=invalid'));

    expect(mockGetSearchPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: ['query'],
      }),
      expect.any(Object)
    );
  });

  it('API 錯誤時應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GSC_SITE_URL = 'https://example.com';

    mockGetSearchPerformance.mockRejectedValue(new Error('Service unavailable'));

    const response = await GET(createRequest());
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Service unavailable');
  });
});
