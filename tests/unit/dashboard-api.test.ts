/**
 * @file 儀表板 API Route Handler 測試
 * @description 測試 /api/admin/dashboard/stats 與 /api/admin/dashboard/activity 的 API 處理
 *   - GET /api/admin/dashboard/stats：取得統計數據
 *   - GET /api/admin/dashboard/activity：取得近期活動
 *   - 認證檢查：未登入應回傳 401
 *   - 錯誤處理：service 拋錯時回傳 500
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET as StatsGET } from '@/app/api/admin/dashboard/stats/route';
import { GET as ActivityGET } from '@/app/api/admin/dashboard/activity/route';
import * as dashboardService from '@/services/dashboard.service';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock dashboard service
jest.mock('@/services/dashboard.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockDashboardService = dashboardService as jest.Mocked<typeof dashboardService>;

/** 建立 mock Request */
function createRequest(
  path: string,
  options: {
    searchParams?: Record<string, string>;
  } = {}
): Request {
  const url = new URL(`http://localhost:3000${path}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString(), { method: 'GET' });
}

/** Mock session */
const mockSession = {
  user: { id: 'user-1', name: 'Admin', email: 'admin@test.com' },
};

/** Mock 統計數據 */
const mockStats: dashboardService.DashboardStats = {
  totalPosts: 25,
  publishedPosts: 15,
  draftPosts: 5,
  scheduledPosts: 3,
  totalCategories: 8,
  totalTags: 12,
  totalMedia: 30,
  recentPostsCount: 4,
};

/** Mock 活動資料 */
const mockActivities: dashboardService.Activity[] = [
  {
    id: 'post-created-1',
    type: 'post_created',
    title: '新文章',
    description: '建立了文章「新文章」',
    timestamp: new Date('2024-06-15T10:00:00.000Z'),
  },
  {
    id: 'category-created-1',
    type: 'category_created',
    title: '技術',
    description: '建立了分類「技術」',
    timestamp: new Date('2024-06-15T09:00:00.000Z'),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET /api/admin/dashboard/stats ─────────────────────────────────

describe('GET /api/admin/dashboard/stats', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = createRequest('/api/admin/dashboard/stats');
    const response = await StatsGET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('應回傳統計數據', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getDashboardStats.mockResolvedValue(mockStats);

    const request = createRequest('/api/admin/dashboard/stats');
    const response = await StatsGET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: mockStats });
  });

  it('service 拋錯時應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getDashboardStats.mockRejectedValue(
      new Error('Database error')
    );

    const request = createRequest('/api/admin/dashboard/stats');
    const response = await StatsGET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ success: false, error: 'Internal server error' });
  });
});

// ─── GET /api/admin/dashboard/activity ──────────────────────────────

describe('GET /api/admin/dashboard/activity', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = createRequest('/api/admin/dashboard/activity');
    const response = await ActivityGET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('應回傳近期活動', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getRecentActivity.mockResolvedValue(mockActivities);

    const request = createRequest('/api/admin/dashboard/activity');
    const response = await ActivityGET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it('應傳遞 limit 參數給 service', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getRecentActivity.mockResolvedValue([]);

    const request = createRequest('/api/admin/dashboard/activity', {
      searchParams: { limit: '5' },
    });
    await ActivityGET(request);

    expect(mockDashboardService.getRecentActivity).toHaveBeenCalledWith(5);
  });

  it('未提供 limit 時應使用預設值 10', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getRecentActivity.mockResolvedValue([]);

    const request = createRequest('/api/admin/dashboard/activity');
    await ActivityGET(request);

    expect(mockDashboardService.getRecentActivity).toHaveBeenCalledWith(10);
  });

  it('limit 為非數字時應使用預設值 10', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getRecentActivity.mockResolvedValue([]);

    const request = createRequest('/api/admin/dashboard/activity', {
      searchParams: { limit: 'abc' },
    });
    await ActivityGET(request);

    expect(mockDashboardService.getRecentActivity).toHaveBeenCalledWith(10);
  });

  it('service 拋錯時應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDashboardService.getRecentActivity.mockRejectedValue(
      new Error('Database error')
    );

    const request = createRequest('/api/admin/dashboard/activity');
    const response = await ActivityGET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ success: false, error: 'Internal server error' });
  });
});
