import {
  createComment,
  getApprovedComments,
  deleteComment,
  createAdminReply,
  batchUpdateComments,
  getCommentStats,
  getAdminComments,
  updateCommentStatus,
} from '@/lib/services/comment.service';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    siteSetting: {
      findUnique: jest.fn(),
    },
  },
}));

describe('comment.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const validCommentData = {
      postId: 'post-1',
      authorName: '張三',
      authorEmail: 'test@example.com',
      content: '這是一則測試評論',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    it('應該成功建立頂層評論', async () => {
      const mockPost = {
        id: 'post-1',
        status: 'PUBLISHED',
      };

      const mockCreatedComment = {
        id: 'comment-1',
        ...validCommentData,
        parentId: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

      const result = await createComment(validCommentData);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        select: { id: true, status: true },
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post-1',
          authorName: '張三',
          authorEmail: 'test@example.com',
          content: '這是一則測試評論',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          parentId: null,
          status: 'PENDING',
        },
      });

      expect(result).toEqual(mockCreatedComment);
      expect(result.status).toBe('PENDING');
    });

    it('應該成功建立回覆評論', async () => {
      const mockPost = {
        id: 'post-1',
        status: 'PUBLISHED',
      };

      const mockParentComment = {
        id: 'comment-1',
        postId: 'post-1',
        parentId: null,
      };

      const mockCreatedReply = {
        id: 'comment-2',
        ...validCommentData,
        parentId: 'comment-1',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const replyData = {
        ...validCommentData,
        parentId: 'comment-1',
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedReply);

      const result = await createComment(replyData);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
        select: { id: true, postId: true, parentId: true },
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post-1',
          authorName: '張三',
          authorEmail: 'test@example.com',
          content: '這是一則測試評論',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          parentId: 'comment-1',
          status: 'PENDING',
        },
      });

      expect(result.parentId).toBe('comment-1');
    });

    it('回覆的回覆應該歸入頂層評論（parent 也有 parentId）', async () => {
      const mockPost = {
        id: 'post-1',
        status: 'PUBLISHED',
      };

      const mockParentComment = {
        id: 'comment-2',
        postId: 'post-1',
        parentId: 'comment-1', // 這是一則回覆
      };

      const mockCreatedReply = {
        id: 'comment-3',
        ...validCommentData,
        parentId: 'comment-1', // 應該歸到頂層
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const replyData = {
        ...validCommentData,
        parentId: 'comment-2',
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedReply);

      const result = await createComment(replyData);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          parentId: 'comment-1', // 應該設為 parent.parentId
        }),
      });

      expect(result.parentId).toBe('comment-1');
    });

    it('文章不存在時應該拋出錯誤', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createComment(validCommentData)).rejects.toThrow('文章不存在');
    });

    it('文章狀態非 PUBLISHED 時應該拋出錯誤', async () => {
      const mockDraftPost = {
        id: 'post-1',
        status: 'DRAFT',
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockDraftPost);

      await expect(createComment(validCommentData)).rejects.toThrow(
        '無法在未發布的文章上留言'
      );
    });

    it('父評論不存在時應該拋出錯誤', async () => {
      const mockPost = {
        id: 'post-1',
        status: 'PUBLISHED',
      };

      const replyData = {
        ...validCommentData,
        parentId: 'non-existent-comment',
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createComment(replyData)).rejects.toThrow('父評論不存在');
    });

    it('authorName 為空時應該拋出錯誤', async () => {
      const invalidData = {
        ...validCommentData,
        authorName: '',
      };

      await expect(createComment(invalidData)).rejects.toThrow('作者名稱為必填');
    });

    it('authorEmail 為空時應該拋出錯誤', async () => {
      const invalidData = {
        ...validCommentData,
        authorEmail: '',
      };

      await expect(createComment(invalidData)).rejects.toThrow('Email 為必填');
    });

    it('content 為空時應該拋出錯誤', async () => {
      const invalidData = {
        ...validCommentData,
        content: '',
      };

      await expect(createComment(invalidData)).rejects.toThrow('評論內容為必填');
    });

    it('authorEmail 格式不正確時應該拋出錯誤', async () => {
      const invalidData = {
        ...validCommentData,
        authorEmail: 'invalid-email',
      };

      await expect(createComment(invalidData)).rejects.toThrow('Email 格式不正確');
    });

    it('authorEmail 格式不正確時應該拋出錯誤（缺少 @）', async () => {
      const invalidData = {
        ...validCommentData,
        authorEmail: 'invalidemail.com',
      };

      await expect(createComment(invalidData)).rejects.toThrow('Email 格式不正確');
    });

    it('authorEmail 格式不正確時應該拋出錯誤（缺少網域）', async () => {
      const invalidData = {
        ...validCommentData,
        authorEmail: 'invalid@',
      };

      await expect(createComment(invalidData)).rejects.toThrow('Email 格式不正確');
    });

    describe('自動核准邏輯', () => {
      beforeEach(() => {
        const mockPost = {
          id: 'post-1',
          status: 'PUBLISHED',
        };
        (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      });

      it('comment_auto_approve 為 "true" 時，新評論 status 應為 APPROVED', async () => {
        const mockSetting = {
          key: 'comment_auto_approve',
          value: 'true',
        };

        const mockCreatedComment = {
          id: 'comment-1',
          ...validCommentData,
          parentId: null,
          status: 'APPROVED',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(mockSetting);
        (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

        const result = await createComment(validCommentData);

        expect(prisma.siteSetting.findUnique).toHaveBeenCalledWith({
          where: { key: 'comment_auto_approve' },
        });

        expect(prisma.comment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'APPROVED',
          }),
        });

        expect(result.status).toBe('APPROVED');
      });

      it('comment_auto_approve 為 "false" 時，新評論 status 應為 PENDING', async () => {
        const mockSetting = {
          key: 'comment_auto_approve',
          value: 'false',
        };

        const mockCreatedComment = {
          id: 'comment-1',
          ...validCommentData,
          parentId: null,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(mockSetting);
        (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

        const result = await createComment(validCommentData);

        expect(prisma.siteSetting.findUnique).toHaveBeenCalledWith({
          where: { key: 'comment_auto_approve' },
        });

        expect(prisma.comment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        });

        expect(result.status).toBe('PENDING');
      });

      it('無 comment_auto_approve 設定時，新評論 status 應為 PENDING（預設）', async () => {
        const mockCreatedComment = {
          id: 'comment-1',
          ...validCommentData,
          parentId: null,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

        const result = await createComment(validCommentData);

        expect(prisma.siteSetting.findUnique).toHaveBeenCalledWith({
          where: { key: 'comment_auto_approve' },
        });

        expect(prisma.comment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        });

        expect(result.status).toBe('PENDING');
      });

      it('comment_auto_approve 值為非 "true" 字串時，新評論 status 應為 PENDING', async () => {
        const mockSetting = {
          key: 'comment_auto_approve',
          value: 'TRUE', // 大寫不視為 true
        };

        const mockCreatedComment = {
          id: 'comment-1',
          ...validCommentData,
          parentId: null,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(mockSetting);
        (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

        const result = await createComment(validCommentData);

        expect(prisma.comment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        });

        expect(result.status).toBe('PENDING');
      });
    });
  });

  describe('getApprovedComments', () => {
    const mockTopLevelComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        parentId: null,
        authorName: '張三',
        authorEmail: 'user1@example.com',
        content: '這是頂層評論 1',
        status: 'APPROVED',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        parentId: null,
        authorName: '李四',
        authorEmail: 'user2@example.com',
        content: '這是頂層評論 2',
        status: 'APPROVED',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    const mockReplies = [
      {
        id: 'comment-3',
        postId: 'post-1',
        parentId: 'comment-1',
        authorName: '王五',
        authorEmail: 'user3@example.com',
        content: '這是回覆 1',
        status: 'APPROVED',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: 'comment-4',
        postId: 'post-1',
        parentId: 'comment-1',
        authorName: '趙六',
        authorEmail: 'user4@example.com',
        content: '這是回覆 2',
        status: 'APPROVED',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
    ];

    it('應該返回已核准的評論（含巢狀結構）', async () => {
      (prisma.comment.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTopLevelComments)
        .mockResolvedValueOnce(mockReplies);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      const result = await getApprovedComments('post-1', { page: 1, limit: 10 });

      // 第一次查詢：頂層評論
      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(1, {
        where: {
          postId: 'post-1',
          parentId: null,
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
        skip: 0,
      });

      // 第二次查詢：所有回覆
      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          parentId: { in: ['comment-1', 'comment-2'] },
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'asc' },
      });

      expect(result.comments).toHaveLength(2);
      expect(result.comments[0].replies).toEqual(mockReplies);
      expect(result.comments[1].replies).toEqual([]);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('應該支援分頁參數', async () => {
      (prisma.comment.findMany as jest.Mock)
        .mockResolvedValueOnce([mockTopLevelComments[1]])
        .mockResolvedValueOnce([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      const result = await getApprovedComments('post-1', { page: 2, limit: 1 });

      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          take: 1,
          skip: 1,
        })
      );

      expect(result.page).toBe(2);
      expect(result.limit).toBe(1);
      expect(result.totalPages).toBe(2);
    });

    it('應該按建立時間升冪排序（舊的在前）', async () => {
      (prisma.comment.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTopLevelComments)
        .mockResolvedValueOnce([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      await getApprovedComments('post-1');

      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('只查詢 APPROVED 狀態的評論（排除 PENDING/SPAM/DELETED）', async () => {
      (prisma.comment.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTopLevelComments)
        .mockResolvedValueOnce(mockReplies);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      await getApprovedComments('post-1');

      // 頂層評論查詢
      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );

      // 回覆查詢
      expect(prisma.comment.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('沒有頂層評論時應該返回空陣列', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(0);

      const result = await getApprovedComments('post-1');

      expect(result.comments).toEqual([]);
      expect(result.total).toBe(0);
      expect(prisma.comment.findMany).toHaveBeenCalledTimes(1); // 不應該查詢回覆
    });

    it('頂層評論存在但沒有回覆時應該正確處理', async () => {
      (prisma.comment.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTopLevelComments)
        .mockResolvedValueOnce([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      const result = await getApprovedComments('post-1');

      expect(result.comments).toHaveLength(2);
      expect(result.comments[0].replies).toEqual([]);
      expect(result.comments[1].replies).toEqual([]);
    });
  });

  describe('getAdminComments', () => {
    const mockComments = [
      {
        id: '1',
        postId: 'post1',
        parentId: null,
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Great article!',
        status: 'APPROVED',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date('2024-02-10T01:00:00Z'),
        updatedAt: new Date('2024-02-10T01:00:00Z'),
        post: { id: 'post1', title: 'Test Post', slug: 'test-post' },
      },
      {
        id: '2',
        postId: 'post1',
        parentId: null,
        authorName: 'Jane Smith',
        authorEmail: 'jane@example.com',
        content: 'Thanks for sharing!',
        status: 'PENDING',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date('2024-02-09T01:00:00Z'),
        updatedAt: new Date('2024-02-09T01:00:00Z'),
        post: { id: 'post1', title: 'Test Post', slug: 'test-post' },
      },
    ];

    it('應該返回全部評論列表（無狀態篩選，預設分頁）', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      const result = await getAdminComments({});

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
      expect(result.comments).toEqual(mockComments);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('應該支援狀態篩選（PENDING）', async () => {
      const pendingComments = [mockComments[1]];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(pendingComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await getAdminComments({ status: 'PENDING' });

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
      expect(result.comments).toEqual(pendingComments);
      expect(result.total).toBe(1);
    });

    it('應該支援狀態篩選（APPROVED）', async () => {
      const approvedComments = [mockComments[0]];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(approvedComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await getAdminComments({ status: 'APPROVED' });

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'APPROVED' },
        })
      );
      expect(result.comments).toEqual(approvedComments);
    });

    it('應該支援狀態篩選（SPAM）', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(0);

      const result = await getAdminComments({ status: 'SPAM' });

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'SPAM' },
        })
      );
      expect(result.comments).toEqual([]);
    });

    it('應該支援狀態篩選（DELETED）', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(0);

      const result = await getAdminComments({ status: 'DELETED' });

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'DELETED' },
        })
      );
      expect(result.comments).toEqual([]);
    });

    it('應該支援分頁參數', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComments[1]]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      const result = await getAdminComments({ page: 2, limit: 1 });

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          skip: 1,
        })
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(1);
      expect(result.totalPages).toBe(2);
    });

    it('應該按照 createdAt desc 排序', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(2);

      await getAdminComments({});

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('應該同時支援狀態篩選和分頁', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComments[0]]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await getAdminComments({ status: 'APPROVED', page: 1, limit: 10 });

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
      expect(result.comments).toEqual([mockComments[0]]);
    });
  });

  describe('updateCommentStatus', () => {
    const mockComment = {
      id: '1',
      postId: 'post1',
      parentId: null,
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      content: 'Great article!',
      status: 'PENDING',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-02-10T01:00:00Z'),
      updatedAt: new Date('2024-02-10T01:00:00Z'),
    };

    it('應該成功更新評論狀態為 APPROVED', async () => {
      const updatedComment = { ...mockComment, status: 'APPROVED' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(updatedComment);

      const result = await updateCommentStatus('1', 'APPROVED');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'APPROVED' },
      });
      expect(result).toEqual(updatedComment);
    });

    it('應該成功更新評論狀態為 SPAM', async () => {
      const updatedComment = { ...mockComment, status: 'SPAM' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(updatedComment);

      const result = await updateCommentStatus('1', 'SPAM');

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'SPAM' },
      });
      expect(result).toEqual(updatedComment);
    });

    it('應該成功更新評論狀態為 DELETED', async () => {
      const updatedComment = { ...mockComment, status: 'DELETED' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(updatedComment);

      const result = await updateCommentStatus('1', 'DELETED');

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'DELETED' },
      });
      expect(result).toEqual(updatedComment);
    });

    it('應該成功更新評論狀態為 PENDING', async () => {
      const approvedComment = { ...mockComment, status: 'APPROVED' };
      const updatedComment = { ...mockComment, status: 'PENDING' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(approvedComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(updatedComment);

      const result = await updateCommentStatus('1', 'PENDING');

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'PENDING' },
      });
      expect(result).toEqual(updatedComment);
    });

    it('評論不存在時應該返回 null', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateCommentStatus('not-exist', 'APPROVED');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'not-exist' },
      });
      expect(prisma.comment.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('評論不存在時不應該執行更新', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await updateCommentStatus('not-exist', 'SPAM');

      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });
});

  describe('deleteComment', () => {
    const mockComment = {
      id: 'comment-1',
      postId: 'post-1',
      parentId: null,
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      content: 'Test comment',
      status: 'APPROVED',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('應該預設執行軟刪除（設定 status 為 DELETED）', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue({
        ...mockComment,
        status: 'DELETED',
      });

      const result = await deleteComment('comment-1');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
        data: { status: 'DELETED' },
      });
      expect(result.status).toBe('DELETED');
    });

    it('應該支援硬刪除選項（實際刪除記錄）', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      const result = await deleteComment('comment-1', { hard: true });

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(result).toEqual(mockComment);
    });

    it('硬刪除時應該級聯刪除 replies（依賴 Prisma schema onDelete: Cascade）', async () => {
      const mockCommentWithReplies = {
        ...mockComment,
        replies: [
          { id: 'reply-1', content: 'Reply 1' },
          { id: 'reply-2', content: 'Reply 2' },
        ],
      };

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithReplies);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockCommentWithReplies);

      await deleteComment('comment-1', { hard: true });

      // 驗證只調用一次 delete，Prisma 會自動處理級聯刪除
      expect(prisma.comment.delete).toHaveBeenCalledTimes(1);
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
    });

    it('評論不存在時應該拋出錯誤', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteComment('not-exist')).rejects.toThrow('Comment not found');
    });

    it('軟刪除時，已刪除的評論應該可以再次軟刪除', async () => {
      const deletedComment = { ...mockComment, status: 'DELETED' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(deletedComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(deletedComment);

      const result = await deleteComment('comment-1');

      expect(result.status).toBe('DELETED');
    });
  });

  describe('createAdminReply', () => {
    const mockParentComment = {
      id: 'comment-1',
      postId: 'post-1',
      parentId: null,
      authorName: 'User',
      authorEmail: 'user@example.com',
      content: 'Parent comment',
      status: 'APPROVED',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const mockAdminUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@novascribe.com',
    };

    it('應該建立管理員回覆並自動設定為 APPROVED', async () => {
      const mockReply = {
        id: 'reply-1',
        postId: 'post-1',
        parentId: 'comment-1',
        authorName: 'Admin User',
        authorEmail: 'admin@novascribe.com',
        content: 'Admin reply content',
        status: 'APPROVED',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockReply);

      const result = await createAdminReply({
        commentId: 'comment-1',
        content: 'Admin reply content',
        adminUser: mockAdminUser,
      });

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post-1',
          parentId: 'comment-1',
          authorName: 'Admin User',
          authorEmail: 'admin@novascribe.com',
          content: 'Admin reply content',
          status: 'APPROVED',
        },
      });
      expect(result.status).toBe('APPROVED');
      expect(result.authorName).toBe('Admin User');
    });

    it('應該使用 adminUser.name 作為 authorName', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'reply-1',
        authorName: 'Custom Admin Name',
        status: 'APPROVED',
      });

      await createAdminReply({
        commentId: 'comment-1',
        content: 'Reply',
        adminUser: { id: 'admin-2', name: 'Custom Admin Name', email: 'custom@novascribe.com' },
      });

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorName: 'Custom Admin Name',
          }),
        })
      );
    });

    it('應該使用 adminUser.email 作為 authorEmail', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'reply-1',
        authorEmail: 'custom@novascribe.com',
        status: 'APPROVED',
      });

      await createAdminReply({
        commentId: 'comment-1',
        content: 'Reply',
        adminUser: { id: 'admin-2', name: 'Admin', email: 'custom@novascribe.com' },
      });

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorEmail: 'custom@novascribe.com',
          }),
        })
      );
    });

    it('父評論不存在時應該拋出錯誤', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createAdminReply({
          commentId: 'not-exist',
          content: 'Reply',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow('Parent comment not found');
    });

    it('應該繼承父評論的 postId', async () => {
      const customParent = { ...mockParentComment, postId: 'custom-post-id' };
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(customParent);
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'reply-1',
        postId: 'custom-post-id',
      });

      await createAdminReply({
        commentId: 'comment-1',
        content: 'Reply',
        adminUser: mockAdminUser,
      });

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            postId: 'custom-post-id',
          }),
        })
      );
    });

    it('管理員回覆不應設定 ipAddress 和 userAgent', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParentComment);
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'reply-1',
        ipAddress: null,
        userAgent: null,
      });

      await createAdminReply({
        commentId: 'comment-1',
        content: 'Reply',
        adminUser: mockAdminUser,
      });

      const createCall = (prisma.comment.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.ipAddress).toBeUndefined();
      expect(createCall.data.userAgent).toBeUndefined();
    });
  });

  describe('batchUpdateComments', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('應該批次核准評論（action: approve）', async () => {
      const ids = ['id1', 'id2', 'id3'];
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await batchUpdateComments({ ids, action: 'approve' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'APPROVED' },
      });
      expect(result).toEqual({ count: 3 });
    });

    it('應該批次標記為 spam（action: spam）', async () => {
      const ids = ['id1', 'id2'];
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await batchUpdateComments({ ids, action: 'spam' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'SPAM' },
      });
      expect(result).toEqual({ count: 2 });
    });

    it('應該批次軟刪除評論（action: delete）', async () => {
      const ids = ['id1'];
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await batchUpdateComments({ ids, action: 'delete' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'DELETED' },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('應該拋出錯誤當超過 50 則評論上限', async () => {
      const ids = Array.from({ length: 51 }, (_, i) => `id${i}`);

      await expect(batchUpdateComments({ ids, action: 'approve' })).rejects.toThrow(
        'Cannot batch update more than 50 comments at once'
      );

      expect(prisma.comment.updateMany).not.toHaveBeenCalled();
    });

    it('應該處理空陣列', async () => {
      const ids: string[] = [];
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await batchUpdateComments({ ids, action: 'approve' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'APPROVED' },
      });
      expect(result).toEqual({ count: 0 });
    });

    it('應該處理恰好 50 則評論', async () => {
      const ids = Array.from({ length: 50 }, (_, i) => `id${i}`);
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 50 });

      const result = await batchUpdateComments({ ids, action: 'approve' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'APPROVED' },
      });
      expect(result).toEqual({ count: 50 });
    });

    it('應該處理混合狀態評論的批次更新', async () => {
      // 測試包含不同狀態的評論 ID，全部更新為 APPROVED
      const ids = ['pending1', 'spam1', 'deleted1'];
      (prisma.comment.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await batchUpdateComments({ ids, action: 'approve' });

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { status: 'APPROVED' },
      });
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('getCommentStats', () => {
    beforeEach(() => {
      // 每個測試前重置 Date
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-02-10T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('應該返回評論統計資料（待審核數、今日新增數、已核准總數、Spam 總數）', async () => {
      const mockCounts = [10, 5, 100, 20]; // pending, todayNew, approved, spam
      let callIndex = 0;
      (prisma.comment.count as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockCounts[callIndex++]);
      });

      const result = await getCommentStats();

      expect(prisma.comment.count).toHaveBeenCalledTimes(4);

      // 驗證 pending 查詢
      expect(prisma.comment.count).toHaveBeenNthCalledWith(1, {
        where: { status: 'PENDING' },
      });

      // 驗證 todayNew 查詢（今日 00:00 開始）
      const todayStart = new Date('2024-02-10T00:00:00.000Z');
      expect(prisma.comment.count).toHaveBeenNthCalledWith(2, {
        where: {
          createdAt: { gte: todayStart },
        },
      });

      // 驗證 approved 查詢
      expect(prisma.comment.count).toHaveBeenNthCalledWith(3, {
        where: { status: 'APPROVED' },
      });

      // 驗證 spam 查詢
      expect(prisma.comment.count).toHaveBeenNthCalledWith(4, {
        where: { status: 'SPAM' },
      });

      expect(result).toEqual({
        pending: 10,
        todayNew: 5,
        approved: 100,
        spam: 20,
      });
    });

    it('應該處理全部為 0 的統計資料', async () => {
      (prisma.comment.count as jest.Mock).mockResolvedValue(0);

      const result = await getCommentStats();

      expect(prisma.comment.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        pending: 0,
        todayNew: 0,
        approved: 0,
        spam: 0,
      });
    });

    it('應該正確計算今日 00:00 開始的時間', async () => {
      // 設定時間為 2024-02-10 15:30:45
      jest.setSystemTime(new Date('2024-02-10T15:30:45Z'));
      (prisma.comment.count as jest.Mock).mockResolvedValue(0);

      await getCommentStats();

      // 驗證 todayNew 使用今日 00:00:00.000
      const expectedTodayStart = new Date('2024-02-10T00:00:00.000Z');
      expect(prisma.comment.count).toHaveBeenNthCalledWith(2, {
        where: {
          createdAt: { gte: expectedTodayStart },
        },
      });
    });
  });
