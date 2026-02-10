/**
 * @file PUT /api/admin/comments/[id] route handler tests
 * @description 測試更新評論狀態 API
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

// Mock dependencies FIRST
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
import { updateCommentStatus } from '@/lib/services/comment.service';
import { CommentStatus } from '@prisma/client';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockUpdateCommentStatus = updateCommentStatus as jest.MockedFunction<
  typeof updateCommentStatus
>;

describe('PUT /api/admin/comments/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認證檢查', () => {
    it('未認證時應回傳 401', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockUpdateCommentStatus).not.toHaveBeenCalled();
    });

    it('已認證時應通過認證檢查', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });

      const mockComment = {
        id: 'comment-1',
        postId: 'post-1',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Test comment',
        status: CommentStatus.APPROVED,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        parentId: null,
        ipAddress: null,
        userAgent: null,
      };

      mockUpdateCommentStatus.mockResolvedValue(mockComment);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);

      expect(response.status).toBe(200);
      expect(mockUpdateCommentStatus).toHaveBeenCalled();
    });
  });

  describe('更新狀態', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('應支援更新為 APPROVED', async () => {
      const mockComment = {
        id: 'comment-1',
        postId: 'post-1',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Test comment',
        status: CommentStatus.APPROVED,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        parentId: null,
        ipAddress: null,
        userAgent: null,
      };

      mockUpdateCommentStatus.mockResolvedValue(mockComment);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockUpdateCommentStatus).toHaveBeenCalledWith('comment-1', CommentStatus.APPROVED);
      expect(data.id).toBe('comment-1');
      expect(data.status).toBe(CommentStatus.APPROVED);
    });

    it('應支援更新為 SPAM', async () => {
      const mockComment = {
        id: 'comment-1',
        postId: 'post-1',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Spam comment',
        status: CommentStatus.SPAM,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        parentId: null,
        ipAddress: null,
        userAgent: null,
      };

      mockUpdateCommentStatus.mockResolvedValue(mockComment);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.SPAM }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);

      expect(response.status).toBe(200);
      expect(mockUpdateCommentStatus).toHaveBeenCalledWith('comment-1', CommentStatus.SPAM);
    });

    it('應支援更新為 DELETED', async () => {
      const mockComment = {
        id: 'comment-1',
        postId: 'post-1',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Deleted comment',
        status: CommentStatus.DELETED,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        parentId: null,
        ipAddress: null,
        userAgent: null,
      };

      mockUpdateCommentStatus.mockResolvedValue(mockComment);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.DELETED }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);

      expect(response.status).toBe(200);
      expect(mockUpdateCommentStatus).toHaveBeenCalledWith('comment-1', CommentStatus.DELETED);
    });
  });

  describe('404 處理', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('評論不存在時應回傳 404', async () => {
      mockUpdateCommentStatus.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      });

      const context = { params: Promise.resolve({ id: 'nonexistent' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Comment not found' });
    });
  });

  describe('輸入驗證', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
        expires: '2026-12-31',
      });
    });

    it('缺少 status 欄位時應回傳 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Status is required' });
      expect(mockUpdateCommentStatus).not.toHaveBeenCalled();
    });

    it('無效的 status 值時應回傳 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid status value' });
      expect(mockUpdateCommentStatus).not.toHaveBeenCalled();
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
      mockUpdateCommentStatus.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1', {
        method: 'PUT',
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      });

      const context = { params: Promise.resolve({ id: 'comment-1' }) };
      const response = await PUT(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });
});
