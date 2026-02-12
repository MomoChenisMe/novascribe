/**
 * @file PUT /api/admin/comments/batch route handler tests
 * @description 測試管理員批次操作評論 API
 * @jest-environment node
 */

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
import { PUT } from '../route';
import { getServerSession } from 'next-auth';
import { batchUpdateComments } from '@/lib/services/comment.service';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockBatchUpdateComments = batchUpdateComments as jest.MockedFunction<
  typeof batchUpdateComments
>;

describe('PUT /api/admin/comments/batch', () => {
  const baseUrl = 'http://localhost:3000/api/admin/comments/batch';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認證檢查', () => {
    it('未認證時應回傳 401', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({
          ids: ['id1', 'id2'],
          action: 'approve',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockBatchUpdateComments).not.toHaveBeenCalled();
    });

    it('已認證時應通過認證檢查', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });

      mockBatchUpdateComments.mockResolvedValue({ count: 2 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({
          ids: ['id1', 'id2'],
          action: 'approve',
        }),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockBatchUpdateComments).toHaveBeenCalled();
    });
  });

  describe('批次操作', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('應該批次核准評論（action: approve）', async () => {
      const ids = ['id1', 'id2', 'id3'];
      mockBatchUpdateComments.mockResolvedValue({ count: 3 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids, action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockBatchUpdateComments).toHaveBeenCalledWith({
        ids,
        action: 'approve',
      });
      expect(data).toEqual({ updated: 3 });
    });

    it('應該批次標記為 spam（action: spam）', async () => {
      const ids = ['id1', 'id2'];
      mockBatchUpdateComments.mockResolvedValue({ count: 2 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids, action: 'spam' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockBatchUpdateComments).toHaveBeenCalledWith({
        ids,
        action: 'spam',
      });
      expect(data).toEqual({ updated: 2 });
    });

    it('應該批次刪除評論（action: delete）', async () => {
      const ids = ['id1'];
      mockBatchUpdateComments.mockResolvedValue({ count: 1 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids, action: 'delete' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockBatchUpdateComments).toHaveBeenCalledWith({
        ids,
        action: 'delete',
      });
      expect(data).toEqual({ updated: 1 });
    });

    it('超過 50 則上限時應該回傳 400', async () => {
      const ids = Array.from({ length: 51 }, (_, i) => `id${i}`);
      mockBatchUpdateComments.mockRejectedValue(
        new Error('Cannot batch update more than 50 comments at once')
      );

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids, action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Cannot batch update more than 50 comments at once',
      });
    });

    it('恰好 50 則評論應該成功處理', async () => {
      const ids = Array.from({ length: 50 }, (_, i) => `id${i}`);
      mockBatchUpdateComments.mockResolvedValue({ count: 50 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids, action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ updated: 50 });
    });

    it('空陣列應該回傳 updated: 0', async () => {
      mockBatchUpdateComments.mockResolvedValue({ count: 0 });

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids: [], action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ updated: 0 });
    });
  });

  describe('輸入驗證', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('缺少 ids 參數時應回傳 400', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ids and action are required' });
      expect(mockBatchUpdateComments).not.toHaveBeenCalled();
    });

    it('缺少 action 參數時應回傳 400', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids: ['id1', 'id2'] }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ids and action are required' });
      expect(mockBatchUpdateComments).not.toHaveBeenCalled();
    });

    it('ids 不是陣列時應回傳 400', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids: 'not-an-array', action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ids must be an array' });
      expect(mockBatchUpdateComments).not.toHaveBeenCalled();
    });

    it('action 類型不正確時應回傳 400', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids: ['id1'], action: 'invalid' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'action must be one of: approve, spam, delete',
      });
      expect(mockBatchUpdateComments).not.toHaveBeenCalled();
    });

    it('JSON 格式不正確時應回傳 400', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('錯誤處理', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('Service 錯誤（非超過上限）應回傳 500', async () => {
      mockBatchUpdateComments.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify({ ids: ['id1'], action: 'approve' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });
});
