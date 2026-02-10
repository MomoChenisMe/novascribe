/**
 * @file /api/admin/comments/stats Route Handler 測試
 * @description 測試評論統計 API
 *   - GET：取得評論統計資料（總數、待審核數、已批准數、已拒絕數、垃圾評論數）
 * @jest-environment node
 */

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    comment: {
      count: jest.fn(),
    },
  },
}));

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe('GET /api/admin/comments/stats', () => {
  const mockRequest = new NextRequest('http://localhost:3000/api/admin/comments/stats');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未認證時應回傳 401', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('應回傳評論統計資料', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' },
      expires: '2026-12-31',
    });

    // Mock count 回傳值
    (prisma.comment.count as jest.Mock)
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(5) // pending
      .mockResolvedValueOnce(80) // approved
      .mockResolvedValueOnce(10) // rejected
      .mockResolvedValueOnce(5); // spam

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      total: 100,
      pending: 5,
      approved: 80,
      rejected: 10,
      spam: 5,
    });

    // 驗證 prisma.comment.count 呼叫
    expect(prisma.comment.count).toHaveBeenCalledTimes(5);
    expect(prisma.comment.count).toHaveBeenNthCalledWith(1, {}); // total
    expect(prisma.comment.count).toHaveBeenNthCalledWith(2, {
      where: { status: 'PENDING' },
    });
    expect(prisma.comment.count).toHaveBeenNthCalledWith(3, {
      where: { status: 'APPROVED' },
    });
    expect(prisma.comment.count).toHaveBeenNthCalledWith(4, {
      where: { status: 'REJECTED' },
    });
    expect(prisma.comment.count).toHaveBeenNthCalledWith(5, {
      where: { status: 'SPAM' },
    });
  });

  it('資料庫錯誤時應回傳 500', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' },
      expires: '2026-12-31',
    });

    (prisma.comment.count as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
