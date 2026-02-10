/**
 * @file GET /api/admin/comments route handler tests
 * @description 測試管理員評論列表 API
 * @jest-environment node
 */

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  CommentStatus: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    SPAM: 'SPAM',
    DELETED: 'DELETED',
  },
}));

// Mock dependencies FIRST (before any imports)
jest.mock('next-auth');
jest.mock('@/lib/services/comment.service');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {},
}));

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { getAdminComments } from '@/lib/services/comment.service';
import { CommentStatus } from '@prisma/client';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockGetAdminComments = getAdminComments as jest.MockedFunction<
  typeof getAdminComments
>;

describe('GET /api/admin/comments', () => {
  const baseUrl = 'http://localhost:3000/api/admin/comments';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認證檢查', () => {
    it('未認證時應回傳 401', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(baseUrl);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockGetAdminComments).not.toHaveBeenCalled();
    });

    it('已認證時應通過認證檢查', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });

      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(baseUrl);
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetAdminComments).toHaveBeenCalled();
    });
  });

  describe('狀態篩選', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('應支援 status 查詢參數（PENDING）', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(`${baseUrl}?status=PENDING`);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        status: CommentStatus.PENDING,
        page: 1,
        limit: 20,
      });
    });

    it('應支援 status 查詢參數（APPROVED）', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(`${baseUrl}?status=APPROVED`);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        status: CommentStatus.APPROVED,
        page: 1,
        limit: 20,
      });
    });

    it('應支援 status 查詢參數（SPAM）', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(`${baseUrl}?status=SPAM`);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        status: CommentStatus.SPAM,
        page: 1,
        limit: 20,
      });
    });

    it('未指定 status 時不應傳遞 status 參數', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(baseUrl);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  describe('分頁', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('應支援 page 和 limit 查詢參數', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });

      const request = new NextRequest(`${baseUrl}?page=2&limit=10`);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
    });

    it('未指定分頁參數時使用預設值（page=1, limit=20）', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(baseUrl);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('應處理無效的 page 參數（使用預設值）', async () => {
      mockGetAdminComments.mockResolvedValue({
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const request = new NextRequest(`${baseUrl}?page=invalid`);
      await GET(request);

      expect(mockGetAdminComments).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  describe('成功回應', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('應回傳評論列表（含分頁資訊）', async () => {
      const mockResult = {
        comments: [
          {
            id: 'comment-1',
            postId: 'post-1',
            authorName: 'John Doe',
            authorEmail: 'john@example.com',
            content: 'Test comment',
            status: CommentStatus.PENDING,
            createdAt: '2026-01-01T00:00:00.000Z', // Use string instead of Date
            post: {
              id: 'post-1',
              title: 'Test Post',
              slug: 'test-post',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockGetAdminComments.mockResolvedValue(mockResult as any);

      const request = new NextRequest(baseUrl);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
    });

    it('應正確處理空結果', async () => {
      const mockResult = {
        comments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockGetAdminComments.mockResolvedValue(mockResult);

      const request = new NextRequest(baseUrl);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
    });
  });

  describe('錯誤處理', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('Service 錯誤時應回傳 500', async () => {
      mockGetAdminComments.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(baseUrl);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });
});
