/**
 * @file POST /api/admin/comments/[id]/reply 測試
 * @description 測試管理員回覆評論功能
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as commentService from '@/lib/services/comment.service';
import * as emailService from '@/lib/email';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock comment service
jest.mock('@/lib/services/comment.service', () => ({
  createAdminReply: jest.fn(),
}));

// Mock email service
jest.mock('@/lib/email', () => ({
  sendReplyNotification: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const { getServerSession } = require('next-auth');

describe('POST /api/admin/comments/[id]/reply', () => {
  const mockSession = {
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
    },
  };

  const mockReply = {
    id: 'reply-1',
    postId: 'post-1',
    parentId: 'comment-1',
    authorName: 'Admin User',
    authorEmail: 'admin@example.com',
    content: '感謝您的評論！',
    status: 'APPROVED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功建立管理員回覆', () => {
    it('應該成功建立回覆並回傳 201', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);
      (emailService.sendReplyNotification as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '感謝您的評論！' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'reply-1',
          parentId: 'comment-1',
          authorName: 'Admin User',
          content: '感謝您的評論！',
          status: 'APPROVED',
        }),
      });
    });

    it('應該呼叫 createAdminReply 並傳入正確參數', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '感謝您的評論！' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      await POST(request, context);

      // Assert
      expect(commentService.createAdminReply).toHaveBeenCalledWith({
        commentId: 'comment-1',
        content: '感謝您的評論！',
        adminUser: mockSession.user,
      });
    });

    it('應該自動將回覆狀態設為 APPROVED', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(data.data.status).toBe('APPROVED');
    });

    it('應該非同步觸發 sendReplyNotification（不阻塞）', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);
      
      // 模擬郵件發送延遲
      (emailService.sendReplyNotification as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const startTime = Date.now();
      const response = await POST(request, context);
      const elapsed = Date.now() - startTime;

      // Assert - 回應應該立即返回（不等待郵件發送）
      expect(response.status).toBe(201);
      expect(elapsed).toBeLessThan(50); // 應該在 50ms 內返回
      expect(emailService.sendReplyNotification).toHaveBeenCalled();
    });
  });

  describe('認證檢查', () => {
    it('應該在未認證時回傳 401', async () => {
      // Arrange
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toMatchObject({
        success: false,
        error: 'Unauthorized',
      });
      expect(commentService.createAdminReply).not.toHaveBeenCalled();
    });

    it('應該從 session 取得 adminUser 資料', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      await POST(request, context);

      // Assert
      expect(commentService.createAdminReply).toHaveBeenCalledWith(
        expect.objectContaining({
          adminUser: {
            id: 'admin-1',
            email: 'admin@example.com',
            name: 'Admin User',
          },
        })
      );
    });
  });

  describe('輸入驗證', () => {
    it('應該在缺少 content 時回傳 400', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: 'Content is required',
      });
      expect(commentService.createAdminReply).not.toHaveBeenCalled();
    });

    it('應該在 content 為空字串時回傳 400', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Content is required');
    });

    it('應該在 content 只有空白時回傳 400', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '   ' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Content is required');
    });
  });

  describe('錯誤處理', () => {
    it('應該在父評論不存在時回傳 404', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockRejectedValue(
        new Error('Parent comment not found')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/comments/nonexistent/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'nonexistent' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toMatchObject({
        success: false,
        error: 'Parent comment not found',
      });
    });

    it('應該在其他錯誤時回傳 500', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: 'Internal server error',
      });
    });

    it('應該在郵件發送失敗時仍然成功回傳回覆（不阻塞）', async () => {
      // Arrange
      getServerSession.mockResolvedValue(mockSession);
      (commentService.createAdminReply as jest.Mock).mockResolvedValue(mockReply);
      (emailService.sendReplyNotification as jest.Mock).mockRejectedValue(
        new Error('SMTP connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/comments/comment-1/reply', {
        method: 'POST',
        body: JSON.stringify({ content: '測試回覆' }),
      });
      const context = { params: Promise.resolve({ id: 'comment-1' }) };

      // Act
      const response = await POST(request, context);
      const data = await response.json();

      // Assert - 即使郵件失敗，仍應成功建立回覆
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });
});
