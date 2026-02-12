/**
 * @file GA4 概覽 API Route Handler 測試
 * @description 測試 GET /api/admin/analytics/overview
 *   - 認證檢查
 *   - GA4 未設定時的回應
 *   - 正常取得數據
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

// Mock GA4 Data
jest.mock('@/lib/analytics/ga4-data', () => ({
  getAnalyticsOverview: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/analytics/overview/route';
import { getAnalyticsOverview } from '@/lib/analytics/ga4-data';

const mockGetServerSession = getServerSession as jest.Mock;
const mockGetAnalyticsOverview = getAnalyticsOverview as jest.Mock;

function createRequest(queryString = '') {
  return new NextRequest(
    new URL(`http://localhost/api/admin/analytics/overview${queryString}`)
  );
}

describe('GET /api/admin/analytics/overview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset env
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  });

  it('未認證時應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET(createRequest() as never);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Unauthorized');
  });

  it('GA4 未設定時應回傳 configured: false', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });

    const response = await GET(createRequest() as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.configured).toBe(false);
    expect(json.success).toBe(false);
  });

  it('正常取得概覽數據', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GA4_PROPERTY_ID = '123456';

    const mockData = {
      pageViews: 1000,
      users: 500,
      sessions: 600,
      bounceRate: 45.5,
      pageViewsChange: 25,
      usersChange: 25,
      sessionsChange: 20,
      bounceRateChange: -10,
    };
    mockGetAnalyticsOverview.mockResolvedValue(mockData);

    const response = await GET(createRequest() as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockData);
    expect(json.configured).toBe(true);
  });

  it('API 錯誤時應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@test.com' } });
    process.env.GA4_PROPERTY_ID = '123456';

    mockGetAnalyticsOverview.mockRejectedValue(new Error('API quota exceeded'));

    const response = await GET(createRequest() as never);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('API quota exceeded');
  });
});
